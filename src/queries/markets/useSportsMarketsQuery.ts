import { GlobalFiltersEnum } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { BetType, ENETPULSE_SPORTS, SPORTS_MAP, SPORTS_TAGS_MAP } from 'constants/tags';
import { groupBy, orderBy, uniqBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { CombinedMarketsContractData, SGPItem, SportMarketInfo, SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';
import { fixDuplicatedTeamName } from 'utils/formatters/string';
import networkConnector from 'utils/networkConnector';
import { convertPriceImpactToBonus, getMarketAddressesFromSportMarketArray } from 'utils/markets';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';
import { filterMarketsByTagsArray, insertCombinedMarketsIntoArrayOFMarkets } from 'utils/combinedMarkets';
import localStore from 'utils/localStore';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const BATCH_SIZE = 100;
const BATCH_SIZE_FOR_COMBINED_MARKETS_QUERY = 5;

const childrenOf = (parentMarket: string, groupedMarkets: any) => {
    return (groupedMarkets[parentMarket] || []).map((market: SportMarketInfo) => ({
        ...market,
        childMarkets: orderBy(childrenOf(market.address, groupedMarkets), ['betType'], ['asc']),
    }));
};

const groupMarkets = (allMarkets: SportMarkets) => {
    const groupedMarkets = groupBy(allMarkets, (market) => market.parentMarket);
    return childrenOf('null', groupedMarkets);
};

const mapMarkets = async (allMarkets: SportMarkets, mapOnlyOpenedMarkets: boolean, networkId: NetworkId) => {
    const mappedMarkets = [] as SportMarkets;

    let oddsFromContract: undefined | Array<any>;
    let priceImpactFromContract: undefined | Array<any>;
    if (mapOnlyOpenedMarkets) {
        try {
            const { sportPositionalMarketDataContract, sportMarketManagerContract } = networkConnector;
            const numberOfActiveMarkets = await sportMarketManagerContract?.numActiveMarkets();
            const numberOfBatches = Math.trunc(numberOfActiveMarkets / BATCH_SIZE) + 1;

            const promises = [];
            for (let i = 0; i < numberOfBatches; i++) {
                promises.push(sportPositionalMarketDataContract?.getOddsForAllActiveMarketsInBatches(i, BATCH_SIZE));
            }
            for (let i = 0; i < numberOfBatches; i++) {
                promises.push(
                    sportPositionalMarketDataContract?.getPriceImpactForAllActiveMarketsInBatches(i, BATCH_SIZE)
                );
            }

            const promisesResult = await Promise.all(promises);

            oddsFromContract = promisesResult.slice(0, numberOfBatches).flat(1);
            priceImpactFromContract = promisesResult.slice(numberOfBatches, numberOfBatches + numberOfBatches).flat(1);
        } catch (e) {
            console.log('Could not get oods from chain', e);
        }
    }

    allMarkets.forEach((market) => {
        if (Number(market.tags[0]) === 0) return;
        market.maturityDate = new Date(market.maturityDate);
        const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.tags[0]));
        market.homeTeam = fixDuplicatedTeamName(market.homeTeam, isEnetpulseSport);
        market.awayTeam = fixDuplicatedTeamName(market.awayTeam, isEnetpulseSport);
        market.sport = SPORTS_MAP[market.tags[0]];
        market.isEnetpulseRacing =
            SPORTS_TAGS_MAP['Motosport'].includes(Number(market.tags[0])) &&
            ENETPULSE_SPORTS.includes(Number(market.tags[0]));
        if (mapOnlyOpenedMarkets) {
            if (oddsFromContract) {
                const oddsItem = oddsFromContract.find(
                    (obj: any) => obj[0].toString().toLowerCase() === market.address.toLowerCase()
                );
                if (oddsItem) {
                    market.homeOdds = bigNumberFormmaterWithDecimals(
                        oddsItem.odds[0],
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    market.awayOdds = bigNumberFormmaterWithDecimals(
                        oddsItem.odds[1],
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    market.drawOdds = oddsItem.odds[2]
                        ? bigNumberFormmaterWithDecimals(oddsItem.odds[2], getDefaultDecimalsForNetwork(networkId))
                        : undefined;
                }
            }
            if (priceImpactFromContract) {
                const priceImpactItem = priceImpactFromContract.find(
                    (obj: any) => obj[0].toString().toLowerCase() === market.address.toLowerCase()
                );
                if (priceImpactItem) {
                    market.homeBonus = convertPriceImpactToBonus(
                        bigNumberFormmaterWithDecimals(priceImpactItem.priceImpact[0])
                    );
                    market.awayBonus = convertPriceImpactToBonus(
                        bigNumberFormmaterWithDecimals(priceImpactItem.priceImpact[1])
                    );
                    market.drawBonus = priceImpactItem.priceImpact[2]
                        ? convertPriceImpactToBonus(bigNumberFormmaterWithDecimals(priceImpactItem.priceImpact[2]))
                        : undefined;
                }
            }

            if (
                market.homeOdds !== 0 ||
                market.awayOdds !== 0 ||
                (market.drawOdds || 0) !== 0 ||
                market.betType === BetType.DOUBLE_CHANCE
            ) {
                mappedMarkets.push(market);
            }
        } else {
            mappedMarkets.push(market);
        }
    });

    let finalMarkets = groupMarkets(mappedMarkets);
    if (mapOnlyOpenedMarkets && mappedMarkets.length > 0) {
        try {
            const { sportPositionalMarketDataContract } = networkConnector;

            const tmpOpenMarkets = groupMarkets(mappedMarkets);
            const sgpFees: SGPItem[] | undefined = localStore.get(LOCAL_STORAGE_KEYS.SGP_FEES);
            const tmpTags: number[] = [];

            if (sgpFees) sgpFees.forEach((sgpItem) => tmpTags.push(...sgpItem.tags));

            const marketsFilteredByTags = filterMarketsByTagsArray(tmpOpenMarkets, tmpTags);
            const marketAddresses = getMarketAddressesFromSportMarketArray(marketsFilteredByTags);

            if (marketAddresses) {
                const promises: CombinedMarketsContractData[] = [];
                const numberOfBatches = Math.trunc(marketAddresses.length / BATCH_SIZE_FOR_COMBINED_MARKETS_QUERY) + 1;

                for (let i = 0; i < numberOfBatches; i++) {
                    const arraySlice = marketAddresses.slice(
                        i * BATCH_SIZE_FOR_COMBINED_MARKETS_QUERY,
                        i * BATCH_SIZE_FOR_COMBINED_MARKETS_QUERY + BATCH_SIZE_FOR_COMBINED_MARKETS_QUERY
                    );
                    promises.push(sportPositionalMarketDataContract?.getCombinedOddsForBatchOfMarkets(arraySlice));
                }

                const promisesResult = await Promise.all(promises);

                const combinedMarketsData: CombinedMarketsContractData = [];

                promisesResult.forEach((promiseData) => {
                    promiseData.forEach((_combinedMarketData: any) => {
                        combinedMarketsData.push(_combinedMarketData);
                    });
                });

                if (combinedMarketsData) {
                    const newMarkets = insertCombinedMarketsIntoArrayOFMarkets(tmpOpenMarkets, combinedMarketsData);
                    finalMarkets = newMarkets;
                }
            }
        } catch (e) {
            console.log('Error ', e);
        }
    }

    return finalMarkets;
};

const useSportMarketsQuery = (
    globalFilter: GlobalFiltersEnum,
    networkId: NetworkId,
    options?: UseQueryOptions<SportMarkets>
) => {
    return useQuery<SportMarkets>(
        QUERY_KEYS.SportMarkets(globalFilter, networkId),
        async () => {
            let markets: SportMarkets = [];
            try {
                const today = new Date();
                // thales-data takes timestamp argument in seconds
                const minMaturityDate = Math.round(new Date(new Date().setDate(today.getDate() - 7)).getTime() / 1000); // show history for 7 days in the past
                const todaysDate = Math.round(today.getTime() / 1000);

                switch (globalFilter) {
                    case GlobalFiltersEnum.OpenMarkets:
                        markets = await thalesData.sportMarkets.markets({
                            isOpen: true,
                            isCanceled: false,
                            isPaused: false,
                            network: networkId,
                            minMaturityDate: todaysDate,
                        });
                        break;
                    case GlobalFiltersEnum.ResolvedMarkets:
                        markets = await thalesData.sportMarkets.markets({
                            isOpen: false,
                            isCanceled: false,
                            network: networkId,
                            minMaturityDate,
                        });
                        break;
                    case GlobalFiltersEnum.Canceled:
                        const [canceledMarkets, pausedMarkets] = await Promise.all([
                            thalesData.sportMarkets.markets({
                                isOpen: false,
                                isCanceled: true,
                                network: networkId,
                                minMaturityDate,
                            }),
                            thalesData.sportMarkets.markets({
                                isPaused: true,
                                network: networkId,
                                minMaturityDate,
                            }),
                        ]);
                        markets = uniqBy([...canceledMarkets, ...pausedMarkets], 'address');
                        break;
                    case GlobalFiltersEnum.PendingMarkets:
                        markets = await thalesData.sportMarkets.markets({
                            isOpen: true,
                            isCanceled: false,
                            minMaturityDate,
                            maxMaturityDate: todaysDate,
                            network: networkId,
                        });
                        break;
                    default:
                        break;
                }

                return mapMarkets(markets, globalFilter === GlobalFiltersEnum.OpenMarkets, networkId);
            } catch (e) {
                console.log(e);
                return markets;
            }
        },
        {
            ...options,
        }
    );
};

export default useSportMarketsQuery;

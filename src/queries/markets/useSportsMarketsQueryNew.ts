import { GlobalFiltersEnum } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { BetType, ENETPULSE_SPORTS, SPORTS_MAP, SPORTS_TAGS_MAP } from 'constants/tags';
import { groupBy, orderBy } from 'lodash';
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

const marketsCache = {
    [GlobalFiltersEnum.OpenMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.Canceled]: [] as SportMarkets,
    [GlobalFiltersEnum.ResolvedMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.PendingMarkets]: [] as SportMarkets,
};

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
    const openMarkets = [] as SportMarkets;
    const canceledMarkets = [] as SportMarkets;
    const resolvedMarkets = [] as SportMarkets;
    const pendingMarkets = [] as SportMarkets;

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
        market.homeTeam = fixDuplicatedTeamName(market.homeTeam);
        market.awayTeam = fixDuplicatedTeamName(market.awayTeam);
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
                market.isOpen &&
                !market.isPaused &&
                !market.isCanceled &&
                (market.homeOdds !== 0 ||
                    market.awayOdds !== 0 ||
                    (market.drawOdds || 0) !== 0 ||
                    market.betType === BetType.DOUBLE_CHANCE) &&
                market.maturityDate.getTime() > new Date().getTime()
            ) {
                openMarkets.push(market);
            }
        } else {
            if (
                market.isResolved &&
                !market.isCanceled &&
                market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 > new Date().getTime()
            ) {
                resolvedMarkets.push(market);
            }
            if (
                (market.isCanceled || market.isPaused) &&
                market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 > new Date().getTime()
            ) {
                canceledMarkets.push(market);
            }
            if (market.maturityDate.getTime() < new Date().getTime() && !market.isResolved && !market.isCanceled) {
                pendingMarkets.push(market);
            }
        }
    });

    if (openMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.OpenMarkets] = groupMarkets(openMarkets);
        try {
            const { sportPositionalMarketDataContract } = networkConnector;

            const tmpOpenMarkets = groupMarkets(openMarkets);
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
                    marketsCache[GlobalFiltersEnum.OpenMarkets] = newMarkets;
                }
            }
        } catch (e) {
            console.log('Error ', e);
        }
    }

    if (resolvedMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.ResolvedMarkets] = groupMarkets(resolvedMarkets);
    }

    if (canceledMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.Canceled] = groupMarkets(canceledMarkets);
    }

    if (pendingMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.PendingMarkets] = groupMarkets(pendingMarkets);
    }
};

const useSportMarketsQueryNew = (networkId: NetworkId, options?: UseQueryOptions<typeof marketsCache>) => {
    return useQuery<typeof marketsCache>(
        QUERY_KEYS.SportMarketsNew(networkId),
        async () => {
            try {
                const today = new Date();
                // thales-data takes timestamp argument in seconds
                const priorDate = Math.round(new Date(new Date().setDate(today.getDate() - 14)).getTime() / 1000);

                // mapping open markets first
                await mapMarkets(
                    await thalesData.sportMarkets.markets({
                        isOpen: true,
                        network: networkId,
                    }),
                    true,
                    networkId
                );

                // fetch and map markets in the background that are not opened
                thalesData.sportMarkets
                    .markets({
                        network: networkId,
                        minTimestamp: priorDate,
                    })
                    .then(async (result: any) => {
                        mapMarkets(result, false, networkId);
                    });

                return marketsCache;
            } catch (e) {
                console.log(e);
                return marketsCache;
            }
        },
        {
            refetchInterval: 60 * 1000,
            ...options,
        }
    );
};

export default useSportMarketsQueryNew;

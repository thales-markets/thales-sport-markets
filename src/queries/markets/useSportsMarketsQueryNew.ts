import { GlobalFiltersEnum } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { SPORTS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamName } from 'utils/formatters/string';
import { appplyLogicForApexGame } from 'utils/markets';
import networkConnector from 'utils/networkConnector';

const marketsCache = {
    [GlobalFiltersEnum.OpenMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.Canceled]: [] as SportMarkets,
    [GlobalFiltersEnum.ResolvedMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.PendingMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.All]: [] as SportMarkets,
    [GlobalFiltersEnum.YourPositions]: [] as SportMarkets,
    [GlobalFiltersEnum.Claim]: [] as SportMarkets,
    [GlobalFiltersEnum.History]: [] as SportMarkets,
};

const mapMarkets = async (allMarkets: SportMarkets) => {
    const openMarkets = [] as SportMarkets;
    const canceledMarkets = [] as SportMarkets;
    const resolvedMarkets = [] as SportMarkets;
    const pendingMarkets = [] as SportMarkets;

    const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
    let oddsFromContract: undefined | Array<any>;

    try {
        oddsFromContract = await sportPositionalMarketDataContract?.getOddsForAllActiveMarkets();
    } catch (e) {
        console.log('Could not get oods from chain', e);
    }

    allMarkets.forEach((market) => {
        market.maturityDate = new Date(market.maturityDate);
        market.homeTeam = market.isApex ? fixApexName(market.homeTeam) : fixDuplicatedTeamName(market.homeTeam);
        market.awayTeam = market.isApex ? fixApexName(market.awayTeam) : fixDuplicatedTeamName(market.awayTeam);
        if (market.isApex) {
            market = appplyLogicForApexGame(market);
        } else {
            market = fixLongTeamName(market);
        }
        market.sport = SPORTS_MAP[market.tags[0]];

        if (market.isOpen && oddsFromContract) {
            oddsFromContract
                .filter((obj: any) => obj[0] === market.id)
                .map((obj: any) => {
                    market.homeOdds = bigNumberFormatter(obj.odds[0]);
                    market.awayOdds = bigNumberFormatter(obj.odds[1]);
                    market.drawOdds = obj.odds[2] ? bigNumberFormatter(obj.odds[2]) : undefined;
                });
        }

        if (
            market.isOpen &&
            !market.isCanceled &&
            (market.homeOdds !== 0 || market.awayOdds !== 0 || (market.drawOdds || 0) !== 0) &&
            market.maturityDate.getTime() > new Date().getTime()
        ) {
            openMarkets.push(market);
        }
        if (
            market.isResolved &&
            !market.isCanceled &&
            market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 > new Date().getTime()
        ) {
            resolvedMarkets.push(market);
        }
        if ((market.isCanceled || market.isPaused) && !market.isResolved) {
            canceledMarkets.push(market);
        }
        if (market.maturityDate.getTime() < new Date().getTime() && !market.isResolved && !market.isCanceled) {
            pendingMarkets.push(market);
        }
    });

    if (openMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.OpenMarkets] = openMarkets;
    }

    if (resolvedMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.ResolvedMarkets] = resolvedMarkets;
    }

    if (canceledMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.Canceled] = canceledMarkets;
    }

    if (pendingMarkets.length > 0) {
        marketsCache[GlobalFiltersEnum.PendingMarkets] = pendingMarkets;
    }

    const allMarketsInOne = [
        ...marketsCache[GlobalFiltersEnum.OpenMarkets],
        ...marketsCache[GlobalFiltersEnum.ResolvedMarkets],
        ...marketsCache[GlobalFiltersEnum.Canceled],
        ...marketsCache[GlobalFiltersEnum.PendingMarkets],
    ];

    marketsCache[GlobalFiltersEnum.All] = allMarketsInOne;
    marketsCache[GlobalFiltersEnum.Claim] = allMarketsInOne;
    marketsCache[GlobalFiltersEnum.YourPositions] = allMarketsInOne;
    marketsCache[GlobalFiltersEnum.History] = allMarketsInOne;
};

const useSportMarketsQueryNew = (networkId: NetworkId, options?: UseQueryOptions<typeof marketsCache>) => {
    return useQuery<typeof marketsCache>(
        QUERY_KEYS.SportMarketsNew(networkId),
        async () => {
            try {
                // mapping open markets first
                await mapMarkets(
                    await thalesData.sportMarkets.markets({
                        isOpen: true,
                        network: networkId,
                    })
                );

                // fetch and map markets in the background that are not opened
                thalesData.sportMarkets
                    .markets({
                        isOpen: false,
                        network: networkId,
                    })
                    .then(async (result: any) => {
                        mapMarkets(result);
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

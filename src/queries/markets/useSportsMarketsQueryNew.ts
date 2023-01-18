import { GlobalFiltersEnum } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { BetType, SPORTS_MAP } from 'constants/tags';
import { groupBy, orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SportMarketInfo, SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { fixDuplicatedTeamName } from 'utils/formatters/string';
import networkConnector from 'utils/networkConnector';
import { generalConfig } from 'config/general';

type DiscountMap = Map<string, { homeBonus: number; awayBonus: number; drawBonus: number }>;

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
    let discountMap: DiscountMap;
    if (mapOnlyOpenedMarkets) {
        try {
            const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
            const [oddsForAllActive, discountsResponse] = await Promise.all([
                sportPositionalMarketDataContract?.getOddsForAllActiveMarkets(),
                fetch(`${generalConfig.API_URL}/overtimeDiscounts/${networkId}`),
            ]);

            oddsFromContract = oddsForAllActive;
            const json = await discountsResponse.json();
            discountMap = new Map(json) as DiscountMap;
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
        if (mapOnlyOpenedMarkets) {
            const marketDiscount = discountMap?.get(market.address);
            market = {
                ...market,
                ...marketDiscount,
            };

            if (market.isOpen && oddsFromContract) {
                oddsFromContract
                    .filter((obj: any) => obj[0].toString().toLowerCase() === market.address.toLowerCase())
                    .map((obj: any) => {
                        market.homeOdds = bigNumberFormatter(obj.odds[0]);
                        market.awayOdds = bigNumberFormatter(obj.odds[1]);
                        market.drawOdds = obj.odds[2] ? bigNumberFormatter(obj.odds[2]) : undefined;
                    });
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
                market.maturityDate.getTime() + 30 * 24 * 60 * 60 * 1000 > new Date().getTime()
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
                const priorDate = Math.round(new Date(new Date().setDate(today.getDate() - 30)).getTime() / 1000);

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

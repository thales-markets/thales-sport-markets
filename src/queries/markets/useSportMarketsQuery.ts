import { GlobalFiltersEnum } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { SPORTS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SportMarketInfo, SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamName } from 'utils/formatters/string';
import { fixScoresForApexGame } from 'utils/markets';
import networkConnector from 'utils/networkConnector';

const marketsParams = {
    [GlobalFiltersEnum.OpenMarkets]: { isOpen: true },
    [GlobalFiltersEnum.Canceled]: { isCanceled: true },
    [GlobalFiltersEnum.ResolvedMarkets]: { isResolved: true },
    [GlobalFiltersEnum.All]: {},
    [GlobalFiltersEnum.YourPositions]: {},
    [GlobalFiltersEnum.Claim]: { isOpen: false },
    [GlobalFiltersEnum.History]: {},
};

export const marketsCache = {
    [GlobalFiltersEnum.OpenMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.Canceled]: [] as SportMarkets,
    [GlobalFiltersEnum.ResolvedMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.All]: [] as SportMarkets,
    [GlobalFiltersEnum.YourPositions]: [] as SportMarkets,
    [GlobalFiltersEnum.Claim]: [] as SportMarkets,
    [GlobalFiltersEnum.History]: [] as SportMarkets,
};

const mapResult = async (markets: any, globalFilter: GlobalFiltersEnum) => {
    const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

    if (
        globalFilter != GlobalFiltersEnum.All &&
        globalFilter != GlobalFiltersEnum.YourPositions &&
        globalFilter != GlobalFiltersEnum.OpenMarkets
    ) {
        const mappedMarkets = markets.map((market: SportMarketInfo) => {
            market.maturityDate = new Date(market.maturityDate);
            market.homeTeam = market.isApex ? fixApexName(market.homeTeam) : fixDuplicatedTeamName(market.homeTeam);
            market.awayTeam = market.isApex ? fixApexName(market.awayTeam) : fixDuplicatedTeamName(market.awayTeam);
            market = fixLongTeamName(market);
            market.sport = SPORTS_MAP[market.tags[0]];
            if (market.isApex) {
                market = fixScoresForApexGame(market);
            }

            return market;
        });

        return mappedMarkets;
    } else {
        try {
            const oddsFromContract = await sportPositionalMarketDataContract?.getOddsForAllActiveMarkets();
            if (oddsFromContract) {
                const mappedMarkets = markets.map((market: SportMarketInfo) => {
                    market.maturityDate = new Date(market.maturityDate);
                    market.homeTeam = market.isApex
                        ? fixApexName(market.homeTeam)
                        : fixDuplicatedTeamName(market.homeTeam);
                    market.awayTeam = market.isApex
                        ? fixApexName(market.awayTeam)
                        : fixDuplicatedTeamName(market.awayTeam);
                    market = fixLongTeamName(market);
                    market.sport = SPORTS_MAP[market.tags[0]];
                    if (market.isOpen) {
                        oddsFromContract
                            .filter((obj: any) => obj[0] === market.id)
                            .map((obj: any) => {
                                market.homeOdds = bigNumberFormatter(obj.odds[0]);
                                market.awayOdds = bigNumberFormatter(obj.odds[1]);
                                market.drawOdds = obj.odds[2] ? bigNumberFormatter(obj.odds[2]) : 0;
                            });
                    }
                    if (market.isApex) {
                        market = fixScoresForApexGame(market);
                    }

                    return market;
                });

                if (globalFilter === GlobalFiltersEnum.OpenMarkets) {
                    return mappedMarkets.filter(
                        (market: SportMarketInfo) =>
                            market.isOpen &&
                            !market.isCanceled &&
                            (market.homeOdds !== 0 || market.awayOdds !== 0 || market.drawOdds !== 0)
                    );
                }
                return mappedMarkets;
            } else {
                const mappedMarkets = markets.map((market: SportMarketInfo) => {
                    market.maturityDate = new Date(market.maturityDate);
                    market.homeTeam = market.isApex
                        ? fixApexName(market.homeTeam)
                        : fixDuplicatedTeamName(market.homeTeam);
                    market.awayTeam = market.isApex
                        ? fixApexName(market.awayTeam)
                        : fixDuplicatedTeamName(market.awayTeam);
                    market = fixLongTeamName(market);
                    market.sport = SPORTS_MAP[market.tags[0]];
                    if (market.isApex) {
                        market = fixScoresForApexGame(market);
                    }
                    return market;
                });

                return mappedMarkets;
            }
        } catch (e) {
            console.log(e);
            return marketsCache[globalFilter];
        }
    }
};

const mapMarkets = (allMarkets: SportMarkets) => {
    const openMarkets = [] as SportMarkets;
    const canceledMarkets = [] as SportMarkets;
    const resolvedMarkets = [] as SportMarkets;

    allMarkets.forEach((market) => {
        if (
            market.isOpen &&
            !market.isCanceled &&
            (market.homeOdds !== 0 || market.awayOdds !== 0 || market.drawOdds !== 0)
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
        if (market.isCanceled) {
            canceledMarkets.push(market);
        }
    });

    marketsCache[GlobalFiltersEnum.OpenMarkets] = openMarkets;
    marketsCache[GlobalFiltersEnum.ResolvedMarkets] = resolvedMarkets;
    marketsCache[GlobalFiltersEnum.Canceled] = canceledMarkets;
    marketsCache[GlobalFiltersEnum.All] = allMarkets;
    marketsCache[GlobalFiltersEnum.Claim] = allMarkets;
    marketsCache[GlobalFiltersEnum.YourPositions] = allMarkets;
    marketsCache[GlobalFiltersEnum.History] = allMarkets;
};

const useSportMarketsQuery = (
    networkId: NetworkId,
    globalFilter: GlobalFiltersEnum,
    setMarketsCached: any,
    options?: UseQueryOptions<typeof marketsCache>
) => {
    return useQuery<typeof marketsCache>(
        QUERY_KEYS.SportMarkets(networkId),
        async () => {
            try {
                marketsCache[globalFilter] = await mapResult(
                    await thalesData.sportMarkets.markets({
                        ...marketsParams[globalFilter],
                        network: networkId,
                    }),
                    globalFilter
                );

                thalesData.sportMarkets
                    .markets({
                        network: networkId,
                    })
                    .then(async (result: any) => {
                        mapMarkets(await mapResult(result, GlobalFiltersEnum.All));
                        setMarketsCached ? setMarketsCached({ ...marketsCache }) : '';
                    });
                setMarketsCached ? setMarketsCached({ ...marketsCache }) : '';

                return marketsCache;
            } catch (e) {
                console.log(e);
            }
            return marketsCache;
        },
        {
            refetchInterval: 60 * 1000,
            ...options,
        }
    );
};

export default useSportMarketsQuery;

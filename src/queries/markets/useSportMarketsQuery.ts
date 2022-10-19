import { GlobalFilterEnum } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { SPORTS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SportMarketInfo, SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamName } from 'utils/formatters/string';
import { appplyLogicForApexGame } from 'utils/markets';
import networkConnector from 'utils/networkConnector';

const marketsParams = {
    [GlobalFilterEnum.OpenMarkets]: { isOpen: true },
    [GlobalFilterEnum.Canceled]: { isCanceled: true },
    [GlobalFilterEnum.ResolvedMarkets]: { isResolved: true },
    [GlobalFilterEnum.All]: {},
    [GlobalFilterEnum.YourPositions]: {},
    [GlobalFilterEnum.Claim]: { isOpen: false },
    [GlobalFilterEnum.Archived]: {},
    [GlobalFilterEnum.History]: {},
};

export const marketsCache = {
    [GlobalFilterEnum.OpenMarkets]: [] as SportMarkets,
    [GlobalFilterEnum.Canceled]: [] as SportMarkets,
    [GlobalFilterEnum.ResolvedMarkets]: [] as SportMarkets,
    [GlobalFilterEnum.All]: [] as SportMarkets,
    [GlobalFilterEnum.YourPositions]: [] as SportMarkets,
    [GlobalFilterEnum.Claim]: [] as SportMarkets,
    [GlobalFilterEnum.Archived]: [] as SportMarkets,
    [GlobalFilterEnum.History]: [] as SportMarkets,
};

const mapResult = async (markets: any, globalFilter: GlobalFilterEnum) => {
    const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

    if (
        globalFilter != GlobalFilterEnum.All &&
        globalFilter != GlobalFilterEnum.YourPositions &&
        globalFilter != GlobalFilterEnum.OpenMarkets
    ) {
        const mappedMarkets = markets.map((market: SportMarketInfo) => {
            market.maturityDate = new Date(market.maturityDate);
            market.homeTeam = market.isApex ? fixApexName(market.homeTeam) : fixDuplicatedTeamName(market.homeTeam);
            market.awayTeam = market.isApex ? fixApexName(market.awayTeam) : fixDuplicatedTeamName(market.awayTeam);
            if (market.isApex) {
                market = appplyLogicForApexGame(market);
            } else {
                market = fixLongTeamName(market);
            }
            market.sport = SPORTS_MAP[market.tags[0]];

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
                    if (market.isApex) {
                        market = appplyLogicForApexGame(market);
                    } else {
                        market = fixLongTeamName(market);
                    }
                    market.sport = SPORTS_MAP[market.tags[0]];
                    if (market.isOpen) {
                        oddsFromContract
                            .filter((obj: any) => obj[0] === market.id)
                            .map((obj: any) => {
                                market.homeOdds = bigNumberFormatter(obj.odds[0]);
                                market.awayOdds = bigNumberFormatter(obj.odds[1]);
                                market.drawOdds = obj.odds[2] ? bigNumberFormatter(obj.odds[2]) : undefined;
                            });
                    }

                    return market;
                });

                if (globalFilter === GlobalFilterEnum.OpenMarkets) {
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
                    if (market.isApex) {
                        market = appplyLogicForApexGame(market);
                    } else {
                        market = fixLongTeamName(market);
                    }
                    market.sport = SPORTS_MAP[market.tags[0]];
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
    const archivedMarkets = [] as SportMarkets;

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
        if (
            (market.isResolved || market.isCanceled) &&
            market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 < new Date().getTime()
        ) {
            archivedMarkets.push(market);
        }
    });

    marketsCache[GlobalFilterEnum.OpenMarkets] = openMarkets;
    marketsCache[GlobalFilterEnum.ResolvedMarkets] = resolvedMarkets;
    marketsCache[GlobalFilterEnum.Canceled] = canceledMarkets;
    marketsCache[GlobalFilterEnum.Archived] = archivedMarkets;
    marketsCache[GlobalFilterEnum.All] = allMarkets;
    marketsCache[GlobalFilterEnum.Claim] = allMarkets;
    marketsCache[GlobalFilterEnum.YourPositions] = allMarkets;
    marketsCache[GlobalFilterEnum.History] = allMarkets;
};

const useSportMarketsQuery = (
    networkId: NetworkId,
    globalFilter: GlobalFilterEnum,
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
                        mapMarkets(await mapResult(result, GlobalFilterEnum.All));
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

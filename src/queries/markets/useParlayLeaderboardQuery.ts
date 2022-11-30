import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket, ParlayMarketWithRank } from 'types/markets';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamNameString } from 'utils/formatters/string';

export const useParlayLeaderboardQuery = (
    networkId: NetworkId,
    minTimestamp?: number,
    maxTimestamp?: number,
    options?: UseQueryOptions<ParlayMarketWithRank[]>
) => {
    return useQuery<ParlayMarketWithRank[]>(
        QUERY_KEYS.ParlayLeaderboard(networkId),
        async () => {
            try {
                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    network: networkId,
                    maxTimestamp,
                    minTimestamp,
                    won: 'true',
                });

                console.log(parlayMarkets);

                const parlayMarketsModified = parlayMarkets
                    .sort((a: ParlayMarket, b: ParlayMarket) => a.totalQuote - b.totalQuote)
                    .map((parlayMarket: ParlayMarket, index: number) => {
                        return {
                            rank: index + 1,
                            ...parlayMarket,
                            sportMarkets: parlayMarket.sportMarkets.map((market) => {
                                return {
                                    ...market,
                                    homeTeam: market.isApex
                                        ? fixApexName(market.homeTeam)
                                        : fixLongTeamNameString(fixDuplicatedTeamName(market.homeTeam)),
                                    awayTeam: market.isApex
                                        ? fixApexName(market.awayTeam)
                                        : fixLongTeamNameString(fixDuplicatedTeamName(market.awayTeam)),
                                };
                            }),
                        };
                    });
                return parlayMarketsModified;
            } catch (e) {
                console.log('E ', e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};

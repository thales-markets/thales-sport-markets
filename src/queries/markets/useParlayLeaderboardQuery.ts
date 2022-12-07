import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket, ParlayMarketWithRank } from 'types/markets';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamNameString } from 'utils/formatters/string';

const sortByTotalQuote = (a: ParlayMarket, b: ParlayMarket) => {
    let firstQuote = 1;
    a.marketQuotes.map((quote) => {
        firstQuote = firstQuote * quote;
    });

    let secondQuote = 1;
    b.marketQuotes.map((quote) => {
        secondQuote = secondQuote * quote;
    });
    return firstQuote - secondQuote;
};

export const useParlayLeaderboardQuery = (
    networkId: NetworkId,
    startPeriod?: number,
    endPeriod?: number,
    options?: UseQueryOptions<ParlayMarketWithRank[]>
) => {
    return useQuery<ParlayMarketWithRank[]>(
        QUERY_KEYS.ParlayLeaderboard(networkId),
        async () => {
            try {
                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    network: networkId,
                    startPeriod,
                    endPeriod,
                    won: 'true',
                });

                const parlayMarketsModified = parlayMarkets
                    .sort((a: ParlayMarket, b: ParlayMarket) =>
                        a.totalQuote !== b.totalQuote
                            ? a.totalQuote - b.totalQuote
                            : a.positions.length !== b.positions.length
                            ? b.positions.length - a.positions.length
                            : a.sUSDPaid !== b.sUSDPaid
                            ? b.sUSDPaid - a.sUSDPaid
                            : sortByTotalQuote(a, b)
                    )
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

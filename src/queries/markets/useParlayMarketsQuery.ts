import QUERY_KEYS from 'constants/queryKeys';
import { ENETPULSE_SPORTS, GOLF_TOURNAMENT_WINNER_TAG, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { ParlayMarket } from 'types/markets';
import { NetworkId } from 'types/network';
import { updateTotalQuoteAndAmountFromContract } from 'utils/markets';

export const useParlayMarketsQuery = (
    account: string,
    networkId: NetworkId,
    minTimestamp?: number,
    maxTimestamp?: number,
    options?: UseQueryOptions<ParlayMarket[] | undefined>
) => {
    return useQuery<ParlayMarket[] | undefined>(
        QUERY_KEYS.ParlayMarkets(networkId, account),
        async () => {
            try {
                if (!account) return undefined;
                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    account,
                    network: networkId,
                    maxTimestamp,
                    minTimestamp,
                });

                const parlayMarketsModified = parlayMarkets.map((parlayMarket: ParlayMarket) => {
                    return {
                        ...parlayMarket,
                        sportMarkets: parlayMarket.sportMarkets.map((market) => {
                            const isOneSideMarket =
                                (SPORTS_TAGS_MAP['Motosport'].includes(Number(market.tags[0])) &&
                                    ENETPULSE_SPORTS.includes(Number(market.tags[0]))) ||
                                (Number(market.tags[0]) == GOLF_TOURNAMENT_WINNER_TAG &&
                                    JSON_ODDS_SPORTS.includes(Number(market.tags[0])));
                            return {
                                ...market,
                                homeTeam: market.homeTeam,
                                awayTeam: market.awayTeam,
                                isOneSideMarket: isOneSideMarket,
                            };
                        }),
                    };
                });

                const updateParlayWithContractData = updateTotalQuoteAndAmountFromContract(parlayMarketsModified);
                return updateParlayWithContractData;
            } catch (e) {
                console.log('E ', e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

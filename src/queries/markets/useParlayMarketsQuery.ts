import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket } from 'types/markets';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';
import { fixApexName, fixDuplicatedTeamName } from 'utils/formatters/string';
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
                            return {
                                ...market,
                                homeTeam: market.isApex
                                    ? fixApexName(market.homeTeam)
                                    : fixDuplicatedTeamName(market.homeTeam),
                                awayTeam: market.isApex
                                    ? fixApexName(market.awayTeam)
                                    : fixDuplicatedTeamName(market.awayTeam),
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
            refetchInterval: 5000,
            ...options,
        }
    );
};

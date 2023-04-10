import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { ParlayVaultTrade } from 'types/vault';
import { updateTotalQuoteAndAmountFromContract } from 'utils/markets';
import { ParlayMarketWithRound, SportMarketInfo } from 'types/markets';
import { fixApexName, fixDuplicatedTeamName } from 'utils/formatters/string';

const useParlayVaultTradesQuery = (
    vaultAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<ParlayMarketWithRound[]>
) => {
    return useQuery<ParlayMarketWithRound[]>(
        QUERY_KEYS.Vault.ParlayTrades(vaultAddress, networkId),
        async () => {
            try {
                const parlayVaultTrades = await thalesData.sportMarkets.parlayVaultTransactions({
                    network: networkId,
                    vault: vaultAddress,
                });

                const parlayMarketsModified: ParlayMarketWithRound[] = parlayVaultTrades.map(
                    ({ wholeMarket, round }: ParlayVaultTrade) => {
                        return {
                            ...wholeMarket,
                            round,
                            sportMarkets: wholeMarket.sportMarkets.map((market: SportMarketInfo) => {
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
                    }
                );

                const updateParlayWithContractData = updateTotalQuoteAndAmountFromContract(
                    parlayMarketsModified
                ) as ParlayMarketWithRound[];
                return updateParlayWithContractData;
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};

export default useParlayVaultTradesQuery;

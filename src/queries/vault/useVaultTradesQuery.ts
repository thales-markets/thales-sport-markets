import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { VaultTrades, VaultTrade } from 'types/vault';
import { getEtherscanTxLink } from 'utils/etherscan';
import { VaultTradeStatus } from 'constants/vault';
import { convertFinalResultToResultType } from 'utils/markets';

const useVaultTradesQuery = (vaultAddress: string, networkId: NetworkId, options?: UseQueryOptions<VaultTrades>) => {
    return useQuery<VaultTrades>(
        QUERY_KEYS.Vault.Trades(vaultAddress, networkId),
        async () => {
            try {
                const vaultTrades = await thalesData.sportMarkets.vaultTransactions({
                    network: networkId,
                    vault: vaultAddress,
                });

                return vaultTrades.map((trade: VaultTrade) => {
                    const game = `${trade.wholeMarket.homeTeam} - ${trade.wholeMarket.awayTeam}`;
                    const position = trade.position;
                    const result = convertFinalResultToResultType(trade.wholeMarket.finalResult);
                    const link = getEtherscanTxLink(networkId, trade.hash);
                    const status =
                        Number(trade.wholeMarket.finalResult) === 0
                            ? VaultTradeStatus.IN_PROGRESS
                            : position === result
                            ? VaultTradeStatus.WIN
                            : VaultTradeStatus.LOSE;

                    return {
                        ...trade,
                        game,
                        position,
                        result,
                        link,
                        status,
                    };
                });
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useVaultTradesQuery;

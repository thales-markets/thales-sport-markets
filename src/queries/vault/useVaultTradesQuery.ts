import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { VaultTradeStatus } from 'enums/vault';
import { useQuery, UseQueryOptions } from 'react-query';
import { getEtherscanTxLink } from 'thales-utils';
import { VaultTrade, VaultTrades } from 'types/vault';
import { convertFinalResultToResultType } from 'utils/markets';

const useVaultTradesQuery = (vaultAddress: string, networkId: Network, options?: UseQueryOptions<VaultTrades>) => {
    return useQuery<VaultTrades>(
        QUERY_KEYS.Vault.Trades(vaultAddress, networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.VaultsTransactions}/${networkId}?vault=${vaultAddress}`
                );
                const vaultTrades = response?.data ? response.data : [];

                return vaultTrades.map((trade: VaultTrade) => {
                    const game = `${trade.wholeMarket.homeTeam} - ${trade.wholeMarket.awayTeam}`;
                    const position = trade.position;
                    const result = convertFinalResultToResultType(trade.wholeMarket.finalResult);
                    const link = getEtherscanTxLink(networkId, trade.hash);
                    const status = trade.wholeMarket.isCanceled
                        ? VaultTradeStatus.CANCELLED
                        : Number(trade.wholeMarket.finalResult) === 0
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
            ...options,
        }
    );
};

export default useVaultTradesQuery;

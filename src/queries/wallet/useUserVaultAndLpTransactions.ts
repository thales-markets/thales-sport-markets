import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { VAULT_MAP } from 'constants/vault';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { LiquidityPoolUserTransactions, VaultsAndLiquidityPoolUserTransactions } from 'types/liquidityPool';
import { VaultUserTransactions } from 'types/vault';

const useUserVaultAndLpTransactions = (
    networkId: Network,
    walletAddress: string,
    options?: UseQueryOptions<VaultsAndLiquidityPoolUserTransactions>
) => {
    return useQuery<VaultsAndLiquidityPoolUserTransactions>(
        QUERY_KEYS.Wallet.VaultsAndLpTxs(networkId, walletAddress),
        async () => {
            try {
                const vaultTx: VaultsAndLiquidityPoolUserTransactions = [];
                for (const key in VAULT_MAP) {
                    const response = await axios.get(
                        `${generalConfig.API_URL}/${API_ROUTES.VaultsUserTransactions}/${networkId}?vault=${VAULT_MAP[key].addresses[networkId]}&account=${walletAddress}`
                    );
                    const vaultUserTransactions: VaultUserTransactions = response?.data ? response.data : [];

                    vaultTx.push(
                        ...vaultUserTransactions.map((tx) => {
                            return { name: key, ...tx };
                        })
                    );
                }

                const lpUserTransactionsResponse = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.LPTransactions}/${networkId}?account=${walletAddress}`
                );
                const liquidityPoolUserTransactions: LiquidityPoolUserTransactions = lpUserTransactionsResponse?.data
                    ? lpUserTransactionsResponse.data
                    : [];

                vaultTx.push(
                    ...liquidityPoolUserTransactions.map((tx) => {
                        return { name: tx.liquidityPoolType == 'parlay' ? 'parlay-lp' : 'single-lp', ...tx };
                    })
                );

                return vaultTx.sort((a, b) => b.timestamp - a.timestamp);
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

export default useUserVaultAndLpTransactions;

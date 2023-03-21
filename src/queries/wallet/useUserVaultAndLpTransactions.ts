import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { LiquidityPoolUserTransactions } from 'types/liquidityPool';
import { VAULT_MAP } from 'constants/vault';
import { VaultUserTransactions, VaultUserTransactionsWithVaultName } from 'types/vault';

const useUserVaultAndLpTransactions = (
    networkId: NetworkId,
    walletAddress: string,
    options?: UseQueryOptions<LiquidityPoolUserTransactions>
) => {
    return useQuery<LiquidityPoolUserTransactions>(
        QUERY_KEYS.Wallet.VaultsAndLpTxs(networkId, walletAddress),
        async () => {
            try {
                const vaultTx: VaultUserTransactionsWithVaultName = [];
                for (const key in VAULT_MAP) {
                    const vaultUserTransactions: VaultUserTransactions = await thalesData.sportMarkets.vaultUserTransactions(
                        {
                            network: networkId,
                            vault: VAULT_MAP[key].addresses[networkId],
                            account: walletAddress,
                        }
                    );

                    vaultTx.push(
                        ...vaultUserTransactions.map((tx) => {
                            return { name: key, ...tx };
                        })
                    );
                }

                console.log('vaultTx: ', vaultTx);
                const liquidityPoolUserTransactions: LiquidityPoolUserTransactions = await thalesData.sportMarkets.liquidityPoolUserTransactions(
                    {
                        network: networkId,
                        account: walletAddress,
                    }
                );
                console.log('liquidityPoolUserTransactions: ', liquidityPoolUserTransactions);
                return liquidityPoolUserTransactions;
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

export default useUserVaultAndLpTransactions;

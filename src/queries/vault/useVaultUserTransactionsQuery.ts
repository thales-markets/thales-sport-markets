import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { VaultUserTransactions } from 'types/vault';

const useVaultUserTransactionsQuery = (
    vaultAddress: string,
    networkId: Network,
    options?: UseQueryOptions<VaultUserTransactions>
) => {
    return useQuery<VaultUserTransactions>(
        QUERY_KEYS.Vault.UserTransactions(vaultAddress, networkId),
        async () => {
            try {
                const vaultUserTransactions = await thalesData.sportMarkets.vaultUserTransactions({
                    network: networkId,
                    vault: vaultAddress,
                });
                return vaultUserTransactions;
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

export default useVaultUserTransactionsQuery;

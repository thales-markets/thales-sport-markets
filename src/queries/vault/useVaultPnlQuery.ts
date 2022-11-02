import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { VaultPnls } from 'types/vault';

const useVaultPnlQuery = (networkId: NetworkId, options?: UseQueryOptions<VaultPnls>) => {
    return useQuery<VaultPnls>(
        QUERY_KEYS.Vault.PnL(networkId),
        async () => {
            try {
                const vaultPnls = await thalesData.sportMarkets.vaultPnls({
                    network: networkId,
                });
                return vaultPnls;
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

export default useVaultPnlQuery;

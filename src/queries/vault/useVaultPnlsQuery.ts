import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { VaultPnls } from 'types/vault';
import { orderBy } from 'lodash';

const useVaultPnlsQuery = (vaultAddress: string, networkId: NetworkId, options?: UseQueryOptions<VaultPnls>) => {
    return useQuery<VaultPnls>(
        QUERY_KEYS.Vault.PnL(vaultAddress, networkId),
        async () => {
            try {
                const vaultPnls = await thalesData.sportMarkets.vaultPnls({
                    network: networkId,
                    vault: vaultAddress,
                });
                return orderBy(vaultPnls, ['round'], ['asc']).map((pnl) => {
                    return {
                        round: `R${pnl.round}`,
                        pnl: pnl.pnl - 1,
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

export default useVaultPnlsQuery;

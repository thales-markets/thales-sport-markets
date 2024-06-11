import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { VaultPnls } from 'types/vault';

const useVaultPnlsQuery = (vaultAddress: string, networkId: Network, options?: UseQueryOptions<VaultPnls>) => {
    return useQuery<VaultPnls>(
        QUERY_KEYS.Vault.PnL(vaultAddress, networkId),
        async () => {
            try {
                const vaultPnlsResponse = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.VaultsPnl}/${networkId}?vault=${vaultAddress}`
                );

                const vaultPnls = vaultPnlsResponse?.data ? vaultPnlsResponse.data : [];

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
            ...options,
        }
    );
};

export default useVaultPnlsQuery;

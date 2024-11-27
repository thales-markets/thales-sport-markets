import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import thalesData from 'thales-data';
import { coinFormatter } from 'thales-utils';
import { LiquidityPoolUserTransactions } from 'types/liquidityPool';
import { NetworkConfig } from '../../types/network';
import { getLiquidityPools } from '../../utils/liquidityPool';

const useLiquidityPoolUserTransactions = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolUserTransactions>({
        queryKey: QUERY_KEYS.Wallet.LiquidityPoolTransactions(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            try {
                const vaultTx: LiquidityPoolUserTransactions = [];

                const liquidityPoolUserTransactions: LiquidityPoolUserTransactions = await thalesData.sportMarketsV2.liquidityPoolUserTransactions(
                    {
                        network: networkConfig.networkId,
                        account: walletAddress,
                    }
                );

                const liquidityPools = getLiquidityPools(networkConfig.networkId);

                vaultTx.push(
                    ...liquidityPoolUserTransactions.map((tx) => {
                        const lp = liquidityPools.find(
                            (lp: any) => lp.address.toLowerCase() === tx.liquidityPool.toLowerCase()
                        );
                        if (!lp) return tx;
                        return {
                            ...tx,
                            name: lp.name,
                            amount: coinFormatter(
                                (tx.amount as unknown) as bigint,
                                networkConfig.networkId,
                                lp.collateral
                            ),
                            collateral: lp.collateral,
                        };
                    })
                );

                return vaultTx.sort((a, b) => b.timestamp - a.timestamp);
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        ...options,
    });
};

export default useLiquidityPoolUserTransactions;

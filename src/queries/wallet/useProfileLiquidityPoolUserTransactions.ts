import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { coinFormatter } from 'thales-utils';
import { LiquidityPoolUserTransactions } from 'types/liquidityPool';
import { SupportedNetwork } from '../../types/network';
import { getLiquidityPools } from '../../utils/liquidityPool';

const useLiquidityPoolUserTransactions = (
    networkId: SupportedNetwork,
    walletAddress: string,
    options?: UseQueryOptions<LiquidityPoolUserTransactions>
) => {
    return useQuery<LiquidityPoolUserTransactions>(
        QUERY_KEYS.Wallet.LiquidityPoolTransactions(networkId, walletAddress),
        async () => {
            try {
                const vaultTx: LiquidityPoolUserTransactions = [];

                const liquidityPoolUserTransactions: LiquidityPoolUserTransactions = await thalesData.sportMarketsV2.liquidityPoolUserTransactions(
                    {
                        network: networkId,
                        account: walletAddress,
                    }
                );

                const liquidityPools = getLiquidityPools(networkId);

                vaultTx.push(
                    ...liquidityPoolUserTransactions.map((tx) => {
                        const lp = liquidityPools.find(
                            (lp: any) => lp.address.toLowerCase() === tx.liquidityPool.toLowerCase()
                        );
                        if (!lp) return tx;
                        return {
                            ...tx,
                            name: lp.name,
                            amount: coinFormatter(tx.amount, networkId, lp.collateral),
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
        {
            ...options,
        }
    );
};

export default useLiquidityPoolUserTransactions;

import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { LiquidityPoolUserTransactions, ProfileLiquidityPoolUserTransactions } from 'types/liquidityPool';

const useProfileLiquidityPoolUserTransactions = (
    networkId: Network,
    walletAddress: string,
    options?: UseQueryOptions<ProfileLiquidityPoolUserTransactions>
) => {
    return useQuery<ProfileLiquidityPoolUserTransactions>(
        QUERY_KEYS.Wallet.LiquidityPoolTransactions(networkId, walletAddress),
        async () => {
            try {
                const vaultTx: ProfileLiquidityPoolUserTransactions = [];

                const liquidityPoolUserTransactions: LiquidityPoolUserTransactions = await thalesData.sportMarkets.liquidityPoolUserTransactions(
                    {
                        network: networkId,
                        account: walletAddress,
                    }
                );

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

export default useProfileLiquidityPoolUserTransactions;

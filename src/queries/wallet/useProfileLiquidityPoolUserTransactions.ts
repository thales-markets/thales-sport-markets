import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { coinFormatter, Coins } from 'thales-utils';
import { LiquidityPoolUserTransactions, ProfileLiquidityPoolUserTransactions } from 'types/liquidityPool';
import { LiquidityPoolMap } from '../../constants/liquidityPool';
import { SupportedNetwork } from '../../types/network';

const useProfileLiquidityPoolUserTransactions = (
    networkId: SupportedNetwork,
    walletAddress: string,
    options?: UseQueryOptions<ProfileLiquidityPoolUserTransactions>
) => {
    return useQuery<ProfileLiquidityPoolUserTransactions>(
        QUERY_KEYS.Wallet.LiquidityPoolTransactions(networkId, walletAddress),
        async () => {
            try {
                const vaultTx: ProfileLiquidityPoolUserTransactions = [];

                const liquidityPoolUserTransactions: LiquidityPoolUserTransactions = await thalesData.sportMarketsV2.liquidityPoolUserTransactions(
                    {
                        network: networkId,
                        account: walletAddress,
                    }
                );

                const liquidityPools: any = Object.values(LiquidityPoolMap[networkId]);
                const liquidityPoolKeys = Object.keys(LiquidityPoolMap[networkId]);

                vaultTx.push(
                    ...liquidityPoolUserTransactions.map((tx) => {
                        const lpIndex = liquidityPools.findIndex(
                            (lp: any) => lp.address.toLowerCase() === tx.liquidityPool.toLowerCase()
                        );
                        console.log(lpIndex, liquidityPoolKeys[lpIndex] as Coins);
                        return {
                            ...tx,
                            name: liquidityPools[lpIndex].name,
                            amount: coinFormatter(
                                tx.amount,
                                networkId,
                                liquidityPoolKeys[lpIndex].toUpperCase() as Coins
                            ),
                            collateral: liquidityPoolKeys[lpIndex].toUpperCase() as Coins,
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

export default useProfileLiquidityPoolUserTransactions;

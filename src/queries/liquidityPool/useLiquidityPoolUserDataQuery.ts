import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserLiquidityPoolData } from 'types/liquidityPool';

const useLiquidityPoolUserDataQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<UserLiquidityPoolData | undefined>
) => {
    return useQuery<UserLiquidityPoolData | undefined>(
        QUERY_KEYS.LiquidityPool.UserData(walletAddress, networkId),
        async () => {
            const userLiquidityPoolData: UserLiquidityPoolData = {
                balanceCurrentRound: 0,
                balanceNextRound: 0,
                balanceTotal: 0,
                isWithdrawalRequested: false,
                hasDepositForCurrentRound: false,
                hasDepositForNextRound: false,
            };

            try {
                const { liquidityPoolContract } = networkConnector;
                if (liquidityPoolContract) {
                    const [round] = await Promise.all([liquidityPoolContract?.round()]);

                    const [balanceCurrentRound, balanceNextRound, withdrawalRequested] = await Promise.all([
                        liquidityPoolContract?.balancesPerRound(Number(round), walletAddress),
                        liquidityPoolContract?.balancesPerRound(Number(round) + 1, walletAddress),
                        liquidityPoolContract?.withdrawalRequested(walletAddress),
                    ]);

                    userLiquidityPoolData.balanceCurrentRound = bigNumberFormatter(balanceCurrentRound);
                    userLiquidityPoolData.balanceNextRound = bigNumberFormatter(balanceNextRound);
                    userLiquidityPoolData.balanceTotal = withdrawalRequested
                        ? 0
                        : userLiquidityPoolData.balanceCurrentRound + userLiquidityPoolData.balanceNextRound;
                    userLiquidityPoolData.isWithdrawalRequested = withdrawalRequested;
                    userLiquidityPoolData.hasDepositForCurrentRound = userLiquidityPoolData.balanceCurrentRound > 0;
                    userLiquidityPoolData.hasDepositForNextRound = userLiquidityPoolData.balanceNextRound > 0;

                    return userLiquidityPoolData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useLiquidityPoolUserDataQuery;

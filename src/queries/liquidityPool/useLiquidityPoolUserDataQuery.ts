import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormmaterWithDecimals, bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserLiquidityPoolData } from 'types/liquidityPool';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';

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
                stakedThales: 0,
                maxDeposit: 0,
                availableToDeposit: 0,
                neededStakedThalesToWithdraw: 0,
            };

            const decimals = getDefaultDecimalsForNetwork(networkId);
            try {
                const { liquidityPoolContract } = networkConnector;
                if (liquidityPoolContract) {
                    const [round] = await Promise.all([liquidityPoolContract?.round()]);

                    const [
                        balanceCurrentRound,
                        balanceNextRound,
                        withdrawalRequested,
                        maxAvailableDeposit,
                        neededStakedThalesToWithdraw,
                    ] = await Promise.all([
                        liquidityPoolContract?.balancesPerRound(Number(round), walletAddress),
                        liquidityPoolContract?.balancesPerRound(Number(round) + 1, walletAddress),
                        liquidityPoolContract?.withdrawalRequested(walletAddress),
                        liquidityPoolContract?.getMaxAvailableDepositForUser(walletAddress),
                        liquidityPoolContract?.getNeededStakedThalesToWithdrawForUser(walletAddress),
                    ]);

                    userLiquidityPoolData.balanceCurrentRound = bigNumberFormmaterWithDecimals(
                        balanceCurrentRound,
                        decimals
                    );
                    userLiquidityPoolData.balanceNextRound = bigNumberFormmaterWithDecimals(balanceNextRound, decimals);
                    userLiquidityPoolData.balanceTotal = withdrawalRequested
                        ? 0
                        : userLiquidityPoolData.balanceCurrentRound + userLiquidityPoolData.balanceNextRound;
                    userLiquidityPoolData.isWithdrawalRequested = withdrawalRequested;
                    userLiquidityPoolData.hasDepositForCurrentRound = userLiquidityPoolData.balanceCurrentRound > 0;
                    userLiquidityPoolData.hasDepositForNextRound = userLiquidityPoolData.balanceNextRound > 0;
                    userLiquidityPoolData.maxDeposit = bigNumberFormmaterWithDecimals(
                        maxAvailableDeposit.maxDepositForUser,
                        decimals
                    );
                    userLiquidityPoolData.stakedThales = bigNumberFormatter(maxAvailableDeposit.stakedThalesForUser);
                    userLiquidityPoolData.availableToDeposit = bigNumberFormmaterWithDecimals(
                        maxAvailableDeposit.availableToDepositForUser,
                        decimals
                    );
                    userLiquidityPoolData.neededStakedThalesToWithdraw = bigNumberFormatter(
                        neededStakedThalesToWithdraw
                    );

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

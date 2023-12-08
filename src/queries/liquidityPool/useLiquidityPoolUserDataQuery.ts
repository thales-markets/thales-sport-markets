import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import networkConnector from 'utils/networkConnector';
import { Network } from 'enums/network';
import { UserLiquidityPoolData } from 'types/liquidityPool';

const useLiquidityPoolUserDataQuery = (
    walletAddress: string,
    networkId: Network,
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
                withdrawalShare: 0,
                isPartialWithdrawalRequested: false,
                withdrawalAmount: 0,
            };

            const decimals = getDefaultDecimalsForNetwork(networkId);
            try {
                const { liquidityPoolContract, liquidityPoolDataContract } = networkConnector;
                if (liquidityPoolContract && liquidityPoolDataContract) {
                    const contractUserLiquidityPoolData = await liquidityPoolDataContract.getUserLiquidityPoolData(
                        liquidityPoolContract.address,
                        walletAddress
                    );

                    userLiquidityPoolData.isWithdrawalRequested = contractUserLiquidityPoolData.withdrawalRequested;
                    userLiquidityPoolData.withdrawalShare = bigNumberFormatter(
                        contractUserLiquidityPoolData.withdrawalShare
                    );
                    userLiquidityPoolData.isPartialWithdrawalRequested = userLiquidityPoolData.withdrawalShare > 0;

                    userLiquidityPoolData.balanceCurrentRound = bigNumberFormatter(
                        contractUserLiquidityPoolData.balanceCurrentRound,
                        decimals
                    );
                    userLiquidityPoolData.balanceNextRound = bigNumberFormatter(
                        contractUserLiquidityPoolData.balanceNextRound,
                        decimals
                    );
                    userLiquidityPoolData.withdrawalAmount = userLiquidityPoolData.isWithdrawalRequested
                        ? userLiquidityPoolData.isPartialWithdrawalRequested
                            ? userLiquidityPoolData.balanceCurrentRound * userLiquidityPoolData.withdrawalShare
                            : userLiquidityPoolData.balanceCurrentRound
                        : 0;

                    userLiquidityPoolData.balanceTotal =
                        userLiquidityPoolData.balanceCurrentRound -
                        userLiquidityPoolData.withdrawalAmount +
                        userLiquidityPoolData.balanceNextRound;

                    userLiquidityPoolData.hasDepositForCurrentRound = userLiquidityPoolData.balanceCurrentRound > 0;
                    userLiquidityPoolData.hasDepositForNextRound = userLiquidityPoolData.balanceNextRound > 0;
                    userLiquidityPoolData.maxDeposit = bigNumberFormatter(
                        contractUserLiquidityPoolData.maxDeposit,
                        decimals
                    );
                    userLiquidityPoolData.stakedThales = bigNumberFormatter(contractUserLiquidityPoolData.stakedThales);
                    userLiquidityPoolData.availableToDeposit = bigNumberFormatter(
                        contractUserLiquidityPoolData.availableToDeposit,
                        decimals
                    );

                    return userLiquidityPoolData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            ...options,
        }
    );
};

export default useLiquidityPoolUserDataQuery;

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
                const { liquidityPoolContract, liquidityPoolDataContract } = networkConnector;
                if (liquidityPoolContract && liquidityPoolDataContract) {
                    const contractUserLiquidityPoolData = await liquidityPoolDataContract.getUserLiquidityPoolData(
                        liquidityPoolContract.address,
                        walletAddress
                    );

                    userLiquidityPoolData.balanceCurrentRound = bigNumberFormmaterWithDecimals(
                        contractUserLiquidityPoolData.balanceCurrentRound,
                        decimals
                    );
                    userLiquidityPoolData.balanceNextRound = bigNumberFormmaterWithDecimals(
                        contractUserLiquidityPoolData.balanceNextRound,
                        decimals
                    );
                    userLiquidityPoolData.balanceTotal = contractUserLiquidityPoolData.withdrawalRequested
                        ? 0
                        : userLiquidityPoolData.balanceCurrentRound + userLiquidityPoolData.balanceNextRound;
                    userLiquidityPoolData.isWithdrawalRequested = contractUserLiquidityPoolData.withdrawalRequested;
                    userLiquidityPoolData.hasDepositForCurrentRound = userLiquidityPoolData.balanceCurrentRound > 0;
                    userLiquidityPoolData.hasDepositForNextRound = userLiquidityPoolData.balanceNextRound > 0;
                    userLiquidityPoolData.maxDeposit = bigNumberFormmaterWithDecimals(
                        contractUserLiquidityPoolData.maxDeposit,
                        decimals
                    );
                    userLiquidityPoolData.stakedThales = bigNumberFormatter(contractUserLiquidityPoolData.stakedThales);
                    userLiquidityPoolData.availableToDeposit = bigNumberFormmaterWithDecimals(
                        contractUserLiquidityPoolData.availableToDeposit,
                        decimals
                    );
                    userLiquidityPoolData.neededStakedThalesToWithdraw = bigNumberFormatter(
                        contractUserLiquidityPoolData.neededStakedThalesToWithdraw
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

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { coinFormatter, Coins } from 'thales-utils';
import { UserLiquidityPoolData } from 'types/liquidityPool';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContractV2';
import { getContract } from 'viem';
import QUERY_KEYS from '../../constants/queryKeys';

const useLiquidityPoolUserDataQuery = (
    address: string,
    collateral: Coins,
    walletAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserLiquidityPoolData | undefined>({
        queryKey: QUERY_KEYS.LiquidityPool.UserData(address, walletAddress, queryConfig.networkId),
        queryFn: async () => {
            const userLiquidityPoolData: UserLiquidityPoolData = {
                balanceCurrentRound: 0,
                balanceNextRound: 0,
                balanceTotal: 0,
                isWithdrawalRequested: false,
                hasDepositForCurrentRound: false,
                hasDepositForNextRound: false,
                withdrawalShare: 0,
                isPartialWithdrawalRequested: false,
                withdrawalAmount: 0,
            };

            try {
                const liquidityPoolDataContractInstance = getContract({
                    abi: getContractAbi(liquidityPoolDataContract, queryConfig.networkId),
                    address: liquidityPoolDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                if (liquidityPoolDataContractInstance) {
                    const contractUserLiquidityPoolData = await liquidityPoolDataContractInstance.read.getUserLiquidityPoolData(
                        [address, walletAddress]
                    );

                    userLiquidityPoolData.isWithdrawalRequested = contractUserLiquidityPoolData.withdrawalRequested;
                    userLiquidityPoolData.withdrawalShare = coinFormatter(
                        contractUserLiquidityPoolData.withdrawalShare,
                        queryConfig.networkId,
                        collateral
                    );
                    userLiquidityPoolData.isPartialWithdrawalRequested = userLiquidityPoolData.withdrawalShare > 0;

                    userLiquidityPoolData.balanceCurrentRound = coinFormatter(
                        contractUserLiquidityPoolData.balanceCurrentRound,
                        queryConfig.networkId,
                        collateral
                    );
                    userLiquidityPoolData.balanceNextRound = coinFormatter(
                        contractUserLiquidityPoolData.balanceNextRound,
                        queryConfig.networkId,
                        collateral
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

                    return userLiquidityPoolData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        ...options,
    });
};

export default useLiquidityPoolUserDataQuery;

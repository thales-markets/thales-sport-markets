import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { coinFormatter, Coins } from 'thales-utils';
import { UserLiquidityPoolData } from 'types/liquidityPool';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContractV2';
import { getContract } from 'viem';
import QUERY_KEYS from '../../constants/queryKeys';

const useLiquidityPoolUserDataQuery = (
    address: string,
    collateral: Coins,
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserLiquidityPoolData | undefined>({
        queryKey: QUERY_KEYS.LiquidityPool.UserData(address, walletAddress, networkConfig.networkId),
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
                    abi: getContractAbi(liquidityPoolDataContract, networkConfig.networkId),
                    address: liquidityPoolDataContract.addresses[networkConfig.networkId],
                    client: networkConfig.client,
                }) as ViemContract;

                if (liquidityPoolDataContractInstance) {
                    const contractUserLiquidityPoolData = await liquidityPoolDataContractInstance.read.getUserLiquidityPoolData(
                        [address, walletAddress]
                    );

                    userLiquidityPoolData.isWithdrawalRequested = contractUserLiquidityPoolData.withdrawalRequested;
                    userLiquidityPoolData.withdrawalShare = coinFormatter(
                        contractUserLiquidityPoolData.withdrawalShare,
                        networkConfig.networkId,
                        collateral
                    );
                    userLiquidityPoolData.isPartialWithdrawalRequested = userLiquidityPoolData.withdrawalShare > 0;

                    userLiquidityPoolData.balanceCurrentRound = coinFormatter(
                        contractUserLiquidityPoolData.balanceCurrentRound,
                        networkConfig.networkId,
                        collateral
                    );
                    userLiquidityPoolData.balanceNextRound = coinFormatter(
                        contractUserLiquidityPoolData.balanceNextRound,
                        networkConfig.networkId,
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

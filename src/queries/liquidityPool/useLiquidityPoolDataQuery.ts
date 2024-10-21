import { secondsToMilliseconds } from 'date-fns';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, coinFormatter, Coins } from 'thales-utils';
import { LiquidityPoolData } from 'types/liquidityPool';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContractV2';
import { getContract } from 'viem';
import QUERY_KEYS from '../../constants/queryKeys';

const useLiquidityPoolDataQuery = (
    address: string,
    collateral: Coins,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolData | undefined>({
        queryKey: QUERY_KEYS.LiquidityPool.Data(address, queryConfig.networkId),
        queryFn: async () => {
            const liquidityPoolData: LiquidityPoolData = {
                collateral: '',
                liquidityPoolStarted: false,
                maxAllowedDeposit: 0,
                round: 0,
                roundEndTime: 0,
                allocationNextRound: 0,
                allocationNextRoundPercentage: 0,
                availableAllocationNextRound: 0,
                allocationCurrentRound: 0,
                isRoundEnded: false,
                minDepositAmount: 0,
                maxAllowedUsers: 0,
                usersCurrentlyInLiquidityPool: 0,
                canCloseCurrentRound: false,
                paused: false,
                roundLength: 0,
                lifetimePnl: 0,
            };

            try {
                const liquidityPoolDataContractInstance = getContract({
                    abi: getContractAbi(liquidityPoolDataContract, queryConfig.networkId),
                    address: liquidityPoolDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                if (liquidityPoolDataContractInstance) {
                    const contractLiquidityPoolData = await liquidityPoolDataContractInstance.read.getLiquidityPoolData(
                        address
                    );

                    liquidityPoolData.collateral = contractLiquidityPoolData.collateral;

                    liquidityPoolData.liquidityPoolStarted = contractLiquidityPoolData.started;
                    liquidityPoolData.maxAllowedDeposit = coinFormatter(
                        contractLiquidityPoolData.maxAllowedDeposit,
                        queryConfig.networkId,
                        collateral
                    );
                    liquidityPoolData.round = Number(contractLiquidityPoolData.round);
                    liquidityPoolData.roundEndTime = secondsToMilliseconds(
                        Number(contractLiquidityPoolData.roundEndTime)
                    );
                    liquidityPoolData.allocationNextRound = coinFormatter(
                        contractLiquidityPoolData.totalDeposited,
                        queryConfig.networkId,
                        collateral
                    );
                    liquidityPoolData.allocationNextRoundPercentage =
                        (liquidityPoolData.allocationNextRound / liquidityPoolData.maxAllowedDeposit) * 100;
                    liquidityPoolData.availableAllocationNextRound =
                        liquidityPoolData.maxAllowedDeposit - liquidityPoolData.allocationNextRound;
                    liquidityPoolData.allocationCurrentRound = coinFormatter(
                        contractLiquidityPoolData.allocationCurrentRound,
                        queryConfig.networkId,
                        collateral
                    );
                    liquidityPoolData.isRoundEnded = new Date().getTime() > liquidityPoolData.roundEndTime;
                    liquidityPoolData.minDepositAmount = coinFormatter(
                        contractLiquidityPoolData.minDepositAmount,
                        queryConfig.networkId,
                        collateral
                    );
                    liquidityPoolData.maxAllowedUsers = Number(contractLiquidityPoolData.maxAllowedUsers);
                    liquidityPoolData.usersCurrentlyInLiquidityPool = Number(
                        contractLiquidityPoolData.usersCurrentlyInPool
                    );
                    liquidityPoolData.canCloseCurrentRound = contractLiquidityPoolData.canCloseCurrentRound;
                    liquidityPoolData.paused = contractLiquidityPoolData.paused;
                    liquidityPoolData.roundLength = Number(contractLiquidityPoolData.roundLength) / 60 / 60 / 24;
                    liquidityPoolData.lifetimePnl =
                        bigNumberFormatter(contractLiquidityPoolData.lifetimePnl, 18) === 0
                            ? 0
                            : bigNumberFormatter(contractLiquidityPoolData.lifetimePnl, 18) - 1;

                    return liquidityPoolData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        ...options,
    });
};

export default useLiquidityPoolDataQuery;

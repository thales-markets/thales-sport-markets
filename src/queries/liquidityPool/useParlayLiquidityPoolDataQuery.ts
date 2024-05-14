import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { LiquidityPoolData } from 'types/liquidityPool';
import networkConnector from 'utils/networkConnector';
import QUERY_KEYS from '../../constants/queryKeys';

const useParlayLiquidityPoolDataQuery = (
    networkId: Network,
    options?: UseQueryOptions<LiquidityPoolData | undefined>
) => {
    return useQuery<LiquidityPoolData | undefined>(
        QUERY_KEYS.LiquidityPool.ParlayData(networkId),
        async () => {
            const liquidityPoolData: LiquidityPoolData = {
                liquidityPoolStarted: false,
                maxAllowedDeposit: 0,
                round: 0,
                roundEndTime: 0,
                allocationNextRound: 0,
                allocationNextRoundPercentage: 0,
                allocationCurrentRound: 0,
                isRoundEnded: false,
                availableAllocationNextRound: 0,
                minDepositAmount: 0,
                maxAllowedUsers: 0,
                usersCurrentlyInLiquidityPool: 0,
                canCloseCurrentRound: false,
                paused: false,
                lifetimePnl: 0,
                roundLength: 0,
                stakedThalesMultiplier: 0,
            };

            const decimals = getDefaultDecimalsForNetwork(networkId);
            try {
                const { parlayAMMLiquidityPoolContract, parlayAMMLiquidityPoolDataContract } = networkConnector;
                if (parlayAMMLiquidityPoolContract && parlayAMMLiquidityPoolDataContract) {
                    const contractLiquidityPoolData = await parlayAMMLiquidityPoolDataContract.getLiquidityPoolData(
                        parlayAMMLiquidityPoolContract.address
                    );

                    liquidityPoolData.liquidityPoolStarted = contractLiquidityPoolData.started;
                    liquidityPoolData.maxAllowedDeposit = bigNumberFormatter(
                        contractLiquidityPoolData.maxAllowedDeposit,
                        decimals
                    );
                    liquidityPoolData.round = Number(contractLiquidityPoolData.round);
                    liquidityPoolData.allocationNextRound = bigNumberFormatter(
                        contractLiquidityPoolData.totalDeposited,
                        decimals
                    );
                    liquidityPoolData.availableAllocationNextRound =
                        liquidityPoolData.maxAllowedDeposit - liquidityPoolData.allocationNextRound;
                    liquidityPoolData.allocationNextRoundPercentage =
                        (liquidityPoolData.allocationNextRound / liquidityPoolData.maxAllowedDeposit) * 100;
                    liquidityPoolData.minDepositAmount = bigNumberFormatter(
                        contractLiquidityPoolData.minDepositAmount,
                        decimals
                    );
                    liquidityPoolData.maxAllowedUsers = Number(contractLiquidityPoolData.maxAllowedUsers);
                    liquidityPoolData.usersCurrentlyInLiquidityPool = Number(
                        contractLiquidityPoolData.usersCurrentlyInPool
                    );
                    liquidityPoolData.canCloseCurrentRound = contractLiquidityPoolData.canCloseCurrentRound;
                    liquidityPoolData.paused = contractLiquidityPoolData.paused;
                    liquidityPoolData.roundLength = Number(contractLiquidityPoolData.roundLength) / 60 / 60 / 24;
                    liquidityPoolData.stakedThalesMultiplier = bigNumberFormatter(
                        contractLiquidityPoolData.stakedThalesMultiplier
                    );
                    liquidityPoolData.allocationCurrentRound = bigNumberFormatter(
                        contractLiquidityPoolData.allocationCurrentRound,
                        decimals
                    );
                    liquidityPoolData.lifetimePnl =
                        bigNumberFormatter(contractLiquidityPoolData.lifetimePnl, 18) === 0
                            ? 0
                            : bigNumberFormatter(contractLiquidityPoolData.lifetimePnl, 18) - 1;
                    liquidityPoolData.roundEndTime = Number(contractLiquidityPoolData.roundEndTime) * 1000;
                    liquidityPoolData.isRoundEnded = new Date().getTime() > liquidityPoolData.roundEndTime;

                    return liquidityPoolData;
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

export default useParlayLiquidityPoolDataQuery;

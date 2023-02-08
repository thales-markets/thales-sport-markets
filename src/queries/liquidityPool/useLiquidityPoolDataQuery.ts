import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { LiquidityPoolData } from 'types/liquidityPool';

const useLiquidityPoolDataQuery = (networkId: NetworkId, options?: UseQueryOptions<LiquidityPoolData | undefined>) => {
    return useQuery<LiquidityPoolData | undefined>(
        QUERY_KEYS.LiquidityPool.Data(networkId),
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
                utilizationRate: 0,
                priceLowerLimit: 0,
                priceUpperLimit: 0,
                skewImpactLimit: 0,
                allocationLimitsPerMarketPerRound: 0,
                minTradeAmount: 0,
                allocationSpentInARound: 0,
                availableAllocationInARound: 0,
                roundLength: 0,
            };

            try {
                const { liquidityPoolContract } = networkConnector;
                if (liquidityPoolContract) {
                    const [
                        liquidityPoolStarted,
                        maxAllowedDeposit,
                        round,
                        roundEndTime,
                        availableAllocationNextRound,
                        minDepositAmount,
                        maxAllowedUsers,
                        usersCurrentlyInLiquidityPool,
                        canCloseCurrentRound,
                        paused,
                        utilizationRate,
                        priceLowerLimit,
                        priceUpperLimit,
                        skewImpactLimit,
                        allocationLimitsPerMarketPerRound,
                        minTradeAmount,
                        roundLength,
                    ] = await Promise.all([
                        liquidityPoolContract?.vaultStarted(),
                        liquidityPoolContract?.maxAllowedDeposit(),
                        liquidityPoolContract?.round(),
                        liquidityPoolContract?.getCurrentRoundEnd(),
                        liquidityPoolContract?.getAvailableToDeposit(),
                        liquidityPoolContract?.minDepositAmount(),
                        liquidityPoolContract?.maxAllowedUsers(),
                        liquidityPoolContract?.usersCurrentlyInVault(),
                        liquidityPoolContract?.canCloseCurrentRound(),
                        liquidityPoolContract?.paused(),
                        liquidityPoolContract?.utilizationRate(),
                        liquidityPoolContract?.priceLowerLimit(),
                        liquidityPoolContract?.priceUpperLimit(),
                        liquidityPoolContract?.skewImpactLimit(),
                        liquidityPoolContract?.allocationLimitsPerMarketPerRound(),
                        liquidityPoolContract?.minTradeAmount(),
                        liquidityPoolContract?.roundLength(),
                    ]);

                    liquidityPoolData.liquidityPoolStarted = liquidityPoolStarted;
                    liquidityPoolData.maxAllowedDeposit = bigNumberFormatter(maxAllowedDeposit);
                    liquidityPoolData.round = Number(round);
                    liquidityPoolData.roundEndTime = Number(roundEndTime) * 1000;
                    liquidityPoolData.availableAllocationNextRound = bigNumberFormatter(availableAllocationNextRound);
                    liquidityPoolData.isRoundEnded = new Date().getTime() > liquidityPoolData.roundEndTime;
                    liquidityPoolData.minDepositAmount = bigNumberFormatter(minDepositAmount);
                    liquidityPoolData.maxAllowedUsers = Number(maxAllowedUsers);
                    liquidityPoolData.usersCurrentlyInLiquidityPool = Number(usersCurrentlyInLiquidityPool);
                    liquidityPoolData.canCloseCurrentRound = canCloseCurrentRound;
                    liquidityPoolData.paused = paused;
                    liquidityPoolData.utilizationRate = bigNumberFormatter(utilizationRate);
                    liquidityPoolData.priceLowerLimit = bigNumberFormatter(priceLowerLimit);
                    liquidityPoolData.priceUpperLimit = bigNumberFormatter(priceUpperLimit);
                    liquidityPoolData.skewImpactLimit = bigNumberFormatter(skewImpactLimit);
                    liquidityPoolData.allocationLimitsPerMarketPerRound =
                        bigNumberFormatter(allocationLimitsPerMarketPerRound) / 100;
                    liquidityPoolData.minTradeAmount = bigNumberFormatter(minTradeAmount);
                    liquidityPoolData.roundLength = Number(roundLength) / 60 / 60 / 24;

                    const [
                        allocationCurrentRound,
                        allocationNextRound,
                        lifetimePnl,
                        allocationSpentInARound,
                        tradingAllocation,
                    ] = await Promise.all([
                        liquidityPoolContract?.allocationPerRound(liquidityPoolData.round),
                        liquidityPoolContract?.capPerRound(liquidityPoolData.round + 1),
                        liquidityPoolContract?.cumulativeProfitAndLoss(
                            liquidityPoolData.round > 0 ? liquidityPoolData.round - 1 : 0
                        ),
                        liquidityPoolContract?.allocationSpentInARound(liquidityPoolData.round),
                        liquidityPoolContract?.tradingAllocation(),
                    ]);

                    liquidityPoolData.allocationCurrentRound = bigNumberFormatter(allocationCurrentRound);
                    liquidityPoolData.allocationNextRound = bigNumberFormatter(allocationNextRound);
                    liquidityPoolData.allocationNextRoundPercentage =
                        (liquidityPoolData.allocationNextRound / liquidityPoolData.maxAllowedDeposit) * 100;
                    liquidityPoolData.lifetimePnl =
                        bigNumberFormatter(lifetimePnl) === 0 ? 0 : bigNumberFormatter(lifetimePnl) - 1;
                    liquidityPoolData.allocationSpentInARound = bigNumberFormatter(allocationSpentInARound);
                    liquidityPoolData.availableAllocationInARound =
                        bigNumberFormatter(tradingAllocation) - liquidityPoolData.allocationSpentInARound;

                    return liquidityPoolData;
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

export default useLiquidityPoolDataQuery;

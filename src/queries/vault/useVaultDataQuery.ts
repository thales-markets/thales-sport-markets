import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { VaultData } from 'types/vault';
import vaultContract from 'utils/contracts/sportVaultContract';
import { ethers } from 'ethers';

const useVaultDataQuery = (
    vaultAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<VaultData | undefined>
) => {
    return useQuery<VaultData | undefined>(
        QUERY_KEYS.Vault.Data(vaultAddress, networkId),
        async () => {
            const vaultData: VaultData = {
                vaultStarted: false,
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
                usersCurrentlyInVault: 0,
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
                const sportVaultContract = new ethers.Contract(
                    vaultAddress,
                    vaultContract.abi,
                    networkConnector.provider
                );
                if (sportVaultContract) {
                    const [
                        vaultStarted,
                        maxAllowedDeposit,
                        round,
                        roundEndTime,
                        availableAllocationNextRound,
                        minDepositAmount,
                        maxAllowedUsers,
                        usersCurrentlyInVault,
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
                        sportVaultContract?.vaultStarted(),
                        sportVaultContract?.maxAllowedDeposit(),
                        sportVaultContract?.round(),
                        sportVaultContract?.getCurrentRoundEnd(),
                        sportVaultContract?.getAvailableToDeposit(),
                        sportVaultContract?.minDepositAmount(),
                        sportVaultContract?.maxAllowedUsers(),
                        sportVaultContract?.usersCurrentlyInVault(),
                        sportVaultContract?.canCloseCurrentRound(),
                        sportVaultContract?.paused(),
                        sportVaultContract?.utilizationRate(),
                        sportVaultContract?.priceLowerLimit(),
                        sportVaultContract?.priceUpperLimit(),
                        sportVaultContract?.skewImpactLimit(),
                        sportVaultContract?.allocationLimitsPerMarketPerRound(),
                        sportVaultContract?.minTradeAmount(),
                        sportVaultContract?.roundLength(),
                    ]);

                    vaultData.vaultStarted = vaultStarted;
                    vaultData.maxAllowedDeposit = bigNumberFormatter(maxAllowedDeposit);
                    vaultData.round = Number(round);
                    vaultData.roundEndTime = Number(roundEndTime) * 1000;
                    vaultData.availableAllocationNextRound = bigNumberFormatter(availableAllocationNextRound);
                    vaultData.isRoundEnded = new Date().getTime() > vaultData.roundEndTime;
                    vaultData.minDepositAmount = bigNumberFormatter(minDepositAmount);
                    vaultData.maxAllowedUsers = Number(maxAllowedUsers);
                    vaultData.usersCurrentlyInVault = Number(usersCurrentlyInVault);
                    vaultData.canCloseCurrentRound = canCloseCurrentRound;
                    vaultData.paused = paused;
                    vaultData.utilizationRate = bigNumberFormatter(utilizationRate);
                    vaultData.priceLowerLimit = bigNumberFormatter(priceLowerLimit);
                    vaultData.priceUpperLimit = bigNumberFormatter(priceUpperLimit);
                    vaultData.skewImpactLimit = bigNumberFormatter(skewImpactLimit);
                    vaultData.allocationLimitsPerMarketPerRound =
                        bigNumberFormatter(allocationLimitsPerMarketPerRound) / 100;
                    vaultData.minTradeAmount = bigNumberFormatter(minTradeAmount);
                    vaultData.roundLength = Number(roundLength) / 60 / 60 / 24;

                    const [
                        allocationCurrentRound,
                        allocationNextRound,
                        lifetimePnl,
                        allocationSpentInARound,
                        tradingAllocation,
                    ] = await Promise.all([
                        sportVaultContract?.allocationPerRound(vaultData.round),
                        sportVaultContract?.capPerRound(vaultData.round + 1),
                        sportVaultContract?.cumulativeProfitAndLoss(vaultData.round > 0 ? vaultData.round - 1 : 0),
                        sportVaultContract?.allocationSpentInARound(vaultData.round),
                        sportVaultContract?.tradingAllocation(),
                    ]);

                    vaultData.allocationCurrentRound = bigNumberFormatter(allocationCurrentRound);
                    vaultData.allocationNextRound = bigNumberFormatter(allocationNextRound);
                    vaultData.allocationNextRoundPercentage =
                        (vaultData.allocationNextRound / vaultData.maxAllowedDeposit) * 100;
                    vaultData.lifetimePnl =
                        bigNumberFormatter(lifetimePnl) === 0 ? 0 : bigNumberFormatter(lifetimePnl) - 1;
                    vaultData.allocationSpentInARound = bigNumberFormatter(allocationSpentInARound);
                    vaultData.availableAllocationInARound =
                        bigNumberFormatter(tradingAllocation) - vaultData.allocationSpentInARound;

                    return vaultData;
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

export default useVaultDataQuery;

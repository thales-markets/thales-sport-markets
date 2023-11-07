import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import networkConnector from 'utils/networkConnector';
import { Network } from 'enums/network';
import { VaultData } from 'types/vault';
import { isParlayVault } from 'constants/vault';

const useVaultDataQuery = (
    vaultAddress: string,
    networkId: Network,
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
                const { sportVaultDataContract } = networkConnector;
                if (sportVaultDataContract) {
                    const contractVaultData = isParlayVault(vaultAddress, networkId)
                        ? await sportVaultDataContract.getParlayVaultData(vaultAddress)
                        : await sportVaultDataContract.getSportVaultData(vaultAddress);

                    vaultData.vaultStarted = contractVaultData.vaultStarted;
                    vaultData.maxAllowedDeposit = bigNumberFormatter(
                        contractVaultData.maxAllowedDeposit,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    vaultData.round = Number(contractVaultData.round);
                    vaultData.roundEndTime = Number(contractVaultData.roundEndTime) * 1000;
                    vaultData.availableAllocationNextRound = bigNumberFormatter(
                        contractVaultData.availableAllocationNextRound,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    vaultData.isRoundEnded = new Date().getTime() > vaultData.roundEndTime;
                    vaultData.minDepositAmount = bigNumberFormatter(
                        contractVaultData.minDepositAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    vaultData.maxAllowedUsers = Number(contractVaultData.maxAllowedUsers);
                    vaultData.usersCurrentlyInVault = Number(contractVaultData.usersCurrentlyInVault);
                    vaultData.canCloseCurrentRound = contractVaultData.canCloseCurrentRound;
                    vaultData.paused = contractVaultData.paused;
                    vaultData.utilizationRate = bigNumberFormatter(contractVaultData.utilizationRate);
                    vaultData.priceLowerLimit = bigNumberFormatter(contractVaultData.priceLowerLimit);
                    vaultData.priceUpperLimit = bigNumberFormatter(contractVaultData.priceUpperLimit);
                    vaultData.skewImpactLimit = bigNumberFormatter(contractVaultData.skewImpactLimit);
                    vaultData.allocationLimitsPerMarketPerRound = isParlayVault(vaultAddress, networkId)
                        ? bigNumberFormatter(contractVaultData.maxTradeRate)
                        : bigNumberFormatter(contractVaultData.allocationLimitsPerMarketPerRound) / 100;
                    vaultData.minTradeAmount = isParlayVault(vaultAddress, networkId)
                        ? bigNumberFormatter(contractVaultData.minTradeAmount, getDefaultDecimalsForNetwork(networkId))
                        : bigNumberFormatter(contractVaultData.minTradeAmount);
                    vaultData.roundLength = Number(contractVaultData.roundLength) / 60 / 60 / 24;
                    vaultData.allocationCurrentRound = bigNumberFormatter(
                        contractVaultData.allocationCurrentRound,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    vaultData.allocationNextRound = bigNumberFormatter(
                        contractVaultData.allocationNextRound,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    vaultData.allocationNextRoundPercentage =
                        (vaultData.allocationNextRound / vaultData.maxAllowedDeposit) * 100;
                    vaultData.lifetimePnl =
                        bigNumberFormatter(contractVaultData.lifetimePnl) === 0
                            ? 0
                            : bigNumberFormatter(contractVaultData.lifetimePnl) - 1;
                    vaultData.allocationSpentInARound = bigNumberFormatter(
                        contractVaultData.allocationSpentInARound,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    vaultData.availableAllocationInARound =
                        bigNumberFormatter(
                            contractVaultData.tradingAllocation,
                            getDefaultDecimalsForNetwork(networkId)
                        ) - vaultData.allocationSpentInARound;

                    return vaultData;
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

export default useVaultDataQuery;

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

                    const [allocationCurrentRound, allocationNextRound, lifetimePnl] = await Promise.all([
                        sportVaultContract?.allocationPerRound(vaultData.round),
                        sportVaultContract?.capPerRound(vaultData.round + 1),
                        sportVaultContract?.cumulativeProfitAndLoss(vaultData.round > 0 ? vaultData.round - 1 : 0),
                    ]);

                    vaultData.allocationCurrentRound = bigNumberFormatter(allocationCurrentRound);
                    vaultData.allocationNextRound = bigNumberFormatter(allocationNextRound);
                    vaultData.allocationNextRoundPercentage =
                        (vaultData.allocationNextRound / vaultData.maxAllowedDeposit) * 100;
                    vaultData.lifetimePnl = bigNumberFormatter(lifetimePnl) - 1;

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

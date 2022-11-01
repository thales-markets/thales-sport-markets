import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { VaultData } from 'types/vault';

const useVaultDataQuery = (networkId: NetworkId, options?: UseQueryOptions<VaultData | undefined>) => {
    return useQuery<VaultData | undefined>(
        QUERY_KEYS.Vault.Data(networkId),
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
            };

            const { sportVaultContract } = networkConnector;
            try {
                if (sportVaultContract) {
                    const [vaultStarted, maxAllowedDeposit, round] = await Promise.all([
                        sportVaultContract?.vaultStarted(),
                        sportVaultContract?.maxAllowedDeposit(),
                        sportVaultContract?.round(),
                    ]);

                    vaultData.vaultStarted = vaultStarted;
                    vaultData.maxAllowedDeposit = bigNumberFormatter(maxAllowedDeposit);
                    vaultData.round = Number(round);

                    const [
                        roundEndTime,
                        allocationCurrentRound,
                        allocationNextRound,
                        availableAllocationNextRound,
                    ] = await Promise.all([
                        sportVaultContract?.getCurrentRoundEnd(),
                        sportVaultContract?.allocationPerRound(vaultData.round),
                        sportVaultContract?.capPerRound(vaultData.round + 1),
                        sportVaultContract?.getAvailableToDeposit(),
                    ]);

                    vaultData.roundEndTime = Number(roundEndTime) * 1000;
                    vaultData.allocationCurrentRound = bigNumberFormatter(allocationCurrentRound);
                    vaultData.allocationNextRound = bigNumberFormatter(allocationNextRound);
                    vaultData.allocationNextRoundPercentage =
                        (vaultData.allocationNextRound / vaultData.maxAllowedDeposit) * 100;
                    vaultData.isRoundEnded = new Date().getTime() > vaultData.roundEndTime;
                    vaultData.availableAllocationNextRound = bigNumberFormatter(availableAllocationNextRound);

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

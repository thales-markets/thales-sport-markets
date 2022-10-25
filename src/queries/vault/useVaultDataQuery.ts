import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { VaultData } from 'types/vault';

const useVaultDataQuery = (networkId: NetworkId, options?: UseQueryOptions<VaultData>) => {
    return useQuery<VaultData>(
        QUERY_KEYS.Vault.Data(networkId),
        async () => {
            const vaultData: VaultData = {
                vaultStarted: false,
                maxAllowedDeposit: 0,
                round: 0,
                roundStartTime: 0,
                roundEndTime: 0,
                allocationNextRound: 0,
                allocationNextRoundPercentage: 0,
            };

            try {
                const { sportVaultContract } = networkConnector;

                const [vaultStarted, maxAllowedDeposit, round] = await Promise.all([
                    sportVaultContract?.vaultStarted(),
                    sportVaultContract?.maxAllowedDeposit(),
                    sportVaultContract?.round(),
                ]);

                vaultData.vaultStarted = true || vaultStarted;
                vaultData.maxAllowedDeposit = bigNumberFormatter(maxAllowedDeposit);
                vaultData.round = 1 || Number(round);

                const [roundStartTime, roundEndTime, allocationNextRound] = await Promise.all([
                    sportVaultContract?.roundStartTime(vaultData.round),
                    sportVaultContract?.roundEndTime(vaultData.round),
                    sportVaultContract?.allocationPerRound(vaultData.round + 1),
                ]);

                vaultData.roundStartTime = Number(roundStartTime);
                vaultData.roundEndTime = Number(1667299471) || Number(roundEndTime);
                vaultData.allocationNextRound = bigNumberFormatter(allocationNextRound);
                vaultData.allocationNextRoundPercentage =
                    (vaultData.allocationNextRound / vaultData.maxAllowedDeposit) * 100;

                return vaultData;
            } catch (e) {
                console.log(e);
            }
            return vaultData;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useVaultDataQuery;

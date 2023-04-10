import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserVaultsData } from 'types/vault';
import { VAULT_MAP, isParlayVault } from 'constants/vault';

const useUserVaultsDataQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<UserVaultsData | undefined>
) => {
    return useQuery<UserVaultsData | undefined>(
        QUERY_KEYS.Vault.AllVaultsUserData(walletAddress, networkId),
        async () => {
            const userVaultData: UserVaultsData = {
                balanceTotal: 0,
            };

            const vaultAddresses: string[] = [];

            for (const vaultId in VAULT_MAP) {
                !!VAULT_MAP[vaultId] ? vaultAddresses.push(VAULT_MAP[vaultId].addresses[networkId]) : '';
            }

            for (const vaultAddress of vaultAddresses) {
                try {
                    const { sportVaultDataContract } = networkConnector;
                    if (sportVaultDataContract) {
                        const contractUserVaultData = isParlayVault(vaultAddress, networkId)
                            ? await sportVaultDataContract.getUserParlayVaultData(vaultAddress, walletAddress)
                            : await sportVaultDataContract.getUserSportVaultData(vaultAddress, walletAddress);

                        userVaultData.balanceTotal += contractUserVaultData.withdrawalRequested
                            ? 0
                            : bigNumberFormatter(contractUserVaultData.balanceCurrentRound) +
                              bigNumberFormatter(contractUserVaultData.balanceNextRound);
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            return userVaultData;
        },
        {
            ...options,
        }
    );
};

export default useUserVaultsDataQuery;

import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserVaultsData } from 'types/vault';
import vaultContract from 'utils/contracts/sportVaultContract';
import { ethers } from 'ethers';
import { VAULT_MAP } from 'constants/vault';

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
                    const sportVaultContract = new ethers.Contract(
                        vaultAddress,
                        vaultContract.abi,
                        networkConnector.provider
                    );
                    if (sportVaultContract) {
                        const [round] = await Promise.all([sportVaultContract?.round()]);

                        const [balanceCurrentRound, balanceNextRound, withdrawalRequested] = await Promise.all([
                            sportVaultContract?.balancesPerRound(Number(round), walletAddress),
                            sportVaultContract?.balancesPerRound(Number(round) + 1, walletAddress),
                            sportVaultContract?.withdrawalRequested(walletAddress),
                        ]);

                        userVaultData.balanceTotal += withdrawalRequested
                            ? 0
                            : bigNumberFormatter(balanceCurrentRound) + bigNumberFormatter(balanceNextRound);
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            return userVaultData;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useUserVaultsDataQuery;

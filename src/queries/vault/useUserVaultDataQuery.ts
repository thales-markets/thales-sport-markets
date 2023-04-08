import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserVaultData } from 'types/vault';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';
import { isParlayVault } from 'constants/vault';

const useUserVaultDataQuery = (
    vaultAddress: string,
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<UserVaultData | undefined>
) => {
    return useQuery<UserVaultData | undefined>(
        QUERY_KEYS.Vault.UserData(vaultAddress, walletAddress, networkId),
        async () => {
            const userVaultData: UserVaultData = {
                balanceCurrentRound: 0,
                balanceNextRound: 0,
                balanceTotal: 0,
                isWithdrawalRequested: false,
                hasDepositForCurrentRound: false,
                hasDepositForNextRound: false,
            };

            try {
                const { sportVaultDataContract } = networkConnector;
                if (sportVaultDataContract) {
                    const contractUserVaultData = isParlayVault(vaultAddress, networkId)
                        ? await sportVaultDataContract.getUserParlayVaultData(vaultAddress, walletAddress)
                        : await sportVaultDataContract.getUserSportVaultData(vaultAddress, walletAddress);

                    userVaultData.balanceCurrentRound = bigNumberFormmaterWithDecimals(
                        contractUserVaultData.balanceCurrentRound,
                        getDefaultDecimalsForNetwork(networkId)
                    );

                    userVaultData.balanceNextRound = bigNumberFormmaterWithDecimals(
                        contractUserVaultData.balanceNextRound,
                        getDefaultDecimalsForNetwork(networkId)
                    );

                    userVaultData.balanceTotal = contractUserVaultData.withdrawalRequested
                        ? 0
                        : userVaultData.balanceCurrentRound + userVaultData.balanceNextRound;
                    userVaultData.isWithdrawalRequested = contractUserVaultData.withdrawalRequested;
                    userVaultData.hasDepositForCurrentRound = userVaultData.balanceCurrentRound > 0;
                    userVaultData.hasDepositForNextRound = userVaultData.balanceNextRound > 0;

                    return userVaultData;
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

export default useUserVaultDataQuery;

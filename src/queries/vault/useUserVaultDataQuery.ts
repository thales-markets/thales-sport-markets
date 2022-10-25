import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserVaultData } from 'types/vault';

const useUserVaultDataQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<UserVaultData>
) => {
    return useQuery<UserVaultData>(
        QUERY_KEYS.Vault.UserData(walletAddress, networkId),
        async () => {
            const userVaultData: UserVaultData = {
                balanceCurrentRound: 0,
                balanceNextRound: 0,
                balanceTotal: 0,
                isWithdrawalRequested: false,
                withdrawalAmount: 0,
            };

            try {
                const { sportVaultContract } = networkConnector;

                const [round] = await Promise.all([sportVaultContract?.round()]);

                const [balanceCurrentRound, balanceNextRound, withdrawalRequest] = await Promise.all([
                    sportVaultContract?.balancesPerRound(Number(round), walletAddress),
                    sportVaultContract?.balancesPerRound(Number(round) + 1, walletAddress),
                    sportVaultContract?.withdrawalQueue(walletAddress),
                ]);

                userVaultData.balanceCurrentRound = bigNumberFormatter(balanceCurrentRound);
                userVaultData.balanceNextRound = bigNumberFormatter(balanceNextRound);
                userVaultData.balanceTotal = userVaultData.balanceCurrentRound + userVaultData.balanceNextRound;
                userVaultData.isWithdrawalRequested = withdrawalRequest.requested;
                userVaultData.withdrawalAmount = bigNumberFormatter(withdrawalRequest.amount);

                return userVaultData;
            } catch (e) {
                console.log(e);
            }
            return userVaultData;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useUserVaultDataQuery;

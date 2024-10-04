import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { StakingData } from '../../types/markets';
import networkConnector from '../../utils/networkConnector';

const useUserStakingDataQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<StakingData | undefined>
) => {
    return useQuery<StakingData | undefined>(
        QUERY_KEYS.Wallet.StakingData(walletAddress, networkId),
        async () => {
            const stakingData: StakingData = {
                isPaused: false,
                isUnstaking: false,
            };
            try {
                const { stakingThalesContract } = networkConnector;
                if (stakingThalesContract) {
                    const [paused, closingPeriodInProgress, unstaking] = await Promise.all([
                        stakingThalesContract.paused(),
                        stakingThalesContract.closingPeriodInProgress(),
                        stakingThalesContract.unstaking(walletAddress),
                    ]);
                    stakingData.isPaused = paused || closingPeriodInProgress;
                    stakingData.isUnstaking = unstaking;

                    return stakingData;
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

export default useUserStakingDataQuery;

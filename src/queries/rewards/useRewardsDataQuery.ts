import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import axios from 'axios';
import { NetworkId } from 'types/network';

const useRewardsDataQuery = (networkId: NetworkId, period: number, options?: UseQueryOptions<number | undefined>) => {
    return useQuery<any>(
        QUERY_KEYS.Rewards(networkId, period),
        async () => {
            try {
                const response = await axios.get(`https://api.thales.market/overtime-rewards/${networkId}/${period}`);

                if (!response?.data?.users) {
                    return undefined;
                }

                return response.data;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

export default useRewardsDataQuery;

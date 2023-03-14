import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery } from 'react-query';

const useGetReffererIdQuery = (walletAddress: string) => {
    return useQuery<string>(QUERY_KEYS.ReferrerID(walletAddress), async () => {
        try {
            const response = await axios.get(`${generalConfig.API_URL}/get-address-refferer-id/${walletAddress}`);
            return response.data;
        } catch (e) {
            return null;
        }
    });
};

export default useGetReffererIdQuery;

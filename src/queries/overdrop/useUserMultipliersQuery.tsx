import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { OverdropIcon } from 'layouts/DappLayout/DappHeader/styled-components';
import { useQuery, UseQueryOptions } from 'react-query';
import { OverdropMultiplier } from 'types/overdrop';

const useUserMultipliersQuery = (walletAddress: string, options?: UseQueryOptions<OverdropMultiplier[]>) => {
    return useQuery<OverdropMultiplier[]>(
        QUERY_KEYS.Overdrop.UserMultipliers(walletAddress),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/user-multipliers/${walletAddress}`);

                return Object.keys(response.data).map((key) => ({ multiplier: response.data[key], name: key }));
            } catch (e) {
                console.error(e);
                return [
                    {
                        name: 'dailyMultiplier',
                        label: 'Days in a row',
                        multiplier: 0,
                        icon: <>0</>,
                    },
                    {
                        name: 'weeklyMultiplier',
                        label: 'Weeks in a row',
                        multiplier: 0,
                        icon: <>0</>,
                    },
                    {
                        name: 'loyaltyMultiplier',
                        label: 'Loyalty boost',
                        multiplier: 0,
                        icon: <>0</>,
                    },
                    {
                        name: 'twitterMultiplier',
                        label: 'Twitter share',
                        multiplier: 0,
                        icon: <OverdropIcon className="icon icon--x-twitter" />,
                    },
                ];
            }
        },
        {
            ...options,
        }
    );
};

export default useUserMultipliersQuery;

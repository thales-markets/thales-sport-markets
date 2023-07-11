import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { Network } from 'enums/network';
import networkConnector from 'utils/networkConnector';

type FavoriteTeamData = {
    isEligible: boolean;
    favoriteTeam: number;
};

const useFavoriteTeamDataQuery = (walletAddress: string, networkId: Network, options?: UseQueryOptions<any>) => {
    return useQuery<FavoriteTeamData>(
        QUERY_KEYS.FavoriteTeam(walletAddress, networkId),
        async () => {
            const favoriteTeamData = { isEligible: false, favoriteTeam: 0 };

            const favoriteTeamDataContract = networkConnector.favoriteTeamContract;

            if (favoriteTeamDataContract && walletAddress !== '') {
                const favoriteTeam = await favoriteTeamDataContract.getFavoriteTeamForUser(walletAddress);

                favoriteTeamData.favoriteTeam = Number(favoriteTeam[0]);
            }

            return favoriteTeamData;
        },
        {
            ...options,
            // team is not changed, no need to refresh data
            staleTime: Infinity,
            cacheTime: Infinity,
        }
    );
};

export default useFavoriteTeamDataQuery;

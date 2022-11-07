import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';

type FavoriteTeamData = {
    isEligible: boolean;
    favoriteTeam: number;
};

const useFavoriteTeamDataQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<FavoriteTeamData>(
        QUERY_KEYS.FavoriteTeam(walletAddress, networkId),
        async () => {
            const favoriteTeamData = { isEligible: false, favoriteTeam: 0 };

            const favoriteTeamDataContract = networkConnector.favoriteTeamContract;

            if (favoriteTeamDataContract && walletAddress !== '') {
                const [isEligible, favoriteTeam] = await Promise.all([
                    await favoriteTeamDataContract.isMinterEligibleToMint(walletAddress),
                    await favoriteTeamDataContract.getFavoriteTeamForUser(walletAddress),
                ]);

                favoriteTeamData.isEligible = isEligible;
                favoriteTeamData.favoriteTeam = Number(favoriteTeam[0]);
            }

            return favoriteTeamData;
        },
        options
    );
};

export default useFavoriteTeamDataQuery;

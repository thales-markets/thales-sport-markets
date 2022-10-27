import QUERY_KEYS from 'constants/queryKeys';
import { useQuery } from 'react-query';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';

type FavoriteTeamData = {
    isEligible: boolean;
};

const useFavoriteTeamDataQuery = (walletAddress: string, networkId: NetworkId) => {
    return useQuery<FavoriteTeamData>(QUERY_KEYS.FavoriteTeam(walletAddress, networkId), async () => {
        const favoriteTeamData = { isEligible: false };

        const favoriteTeamDataContract = networkConnector.favoriteTeamContract;

        if (favoriteTeamDataContract && walletAddress !== '') {
            const isEligible = await favoriteTeamDataContract.isMinterEligibleToMint(walletAddress);
            favoriteTeamData.isEligible = isEligible;
        }

        return favoriteTeamData;
    });
};

export default useFavoriteTeamDataQuery;

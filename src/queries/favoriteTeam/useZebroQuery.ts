import QUERY_KEYS from 'constants/queryKeys';
import { useQuery } from 'react-query';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';

type Zebro = {
    id: string;
    owner: string;
    tokenId: number;
    countryName: string;
    url: string;
    country: number;
};

const useZebroQuery = (walletAddress: string, networkId: NetworkId) => {
    return useQuery<[Zebro]>(QUERY_KEYS.Zebro(walletAddress, networkId), async () => {
        const zebros = await thalesData.sportMarkets.zebros({
            account: walletAddress,
            network: networkId,
        });

        return zebros;
    });
};

export default useZebroQuery;

import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { AccountPositions, AccountPositionsMap } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import { keyBy } from 'lodash';

const useAccountPositionsQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<AccountPositionsMap | undefined>
) => {
    return useQuery<AccountPositionsMap | undefined>(
        QUERY_KEYS.AccountPositions(walletAddress, networkId),
        async () => {
            try {
                const positions: AccountPositions = await thalesData.exoticMarkets.positions({
                    account: walletAddress,
                    network: networkId,
                });

                const positionsMap: AccountPositionsMap = keyBy(positions, 'market');

                return positionsMap;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useAccountPositionsQuery;

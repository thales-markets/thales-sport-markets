import QUERY_KEYS from 'constants/queryKeys';
import { QueryClient } from 'react-query';
import { NetworkId } from 'types/network';

type QueryConnector = {
    queryClient: QueryClient;
    setQueryClient: () => void;
};

// @ts-ignore
const queryConnector: QueryConnector = {
    setQueryClient: function () {
        this.queryClient = new QueryClient();
    },
};

export const refetchMarketData = (marketAddress: string, walletAddress: string, isSell?: boolean) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Market(marketAddress, !!isSell));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountMarketTicketData(marketAddress, walletAddress));
};

export const refetchMarkets = (networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.SportMarkets(networkId));
};

export default queryConnector;

import QUERY_KEYS from 'constants/queryKeys';
import { QueryClient } from 'react-query';

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

export const refetchMarketData = (marketAddress: string, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Market(marketAddress));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountMarketTicketData(marketAddress, walletAddress));
};

export default queryConnector;

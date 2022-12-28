import { Currency } from '@socket.tech/plugin';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';

export interface TokenListOutput {
    success: boolean;
    result: Currency[];
}

export const SOURCE_NETWORK_IDS = [1, 56, 100, 137, 250, 43114, 42161, 1313161554];

// Check docs on: https://docs.socket.tech/socket-api/versioning
const baseUrl = 'https://api.socket.tech/v2/token-lists/from-token-list';
const queryParamFromChainId = '?fromChainId=';
const queryParamToChainId = '&toChainId=';
const queryParamShortList = '&isShortList=true';

const useAllSourceTokensQuery = (apiKey: string, toNetworkId: number, options?: UseQueryOptions<Currency[]>) => {
    return useQuery<Currency[]>(
        QUERY_KEYS.Bungee.Tokens(),
        async () => {
            const promises: any[] = [];
            const headers = { accept: 'application/json', 'API-KEY': apiKey };

            SOURCE_NETWORK_IDS.forEach((networkId: number) => {
                const url =
                    baseUrl +
                    queryParamFromChainId +
                    networkId +
                    queryParamToChainId +
                    toNetworkId +
                    queryParamShortList;

                promises.push(fetch(url, { headers }));
            });

            const responses = await Promise.all(promises);

            const results: Currency[] = [];
            for (const response of responses) {
                const body: TokenListOutput = JSON.parse(await response.text());
                results.push(...body.result);
            }

            return results;
        },
        options
    );
};
export default useAllSourceTokensQuery;

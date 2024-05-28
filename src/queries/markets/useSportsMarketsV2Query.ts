import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { StatusFilter } from 'enums/markets';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarkets } from 'types/markets';

const useSportsMarketsV2Query = (
    statusFilter: StatusFilter,
    networkId: Network,
    options?: UseQueryOptions<SportMarkets>
) => {
    return useQuery<SportMarkets>(
        QUERY_KEYS.SportMarketsV2(statusFilter, networkId),
        async () => {
            let markets = [];
            let response;
            try {
                // const today = new Date();
                // // thales-data takes timestamp argument in seconds
                // const minMaturityDate = Math.round(new Date(new Date().setDate(today.getDate() - 7)).getTime() / 1000); // show history for 7 days in the past
                // const todaysDate = Math.round(today.getTime() / 1000);

                switch (statusFilter) {
                    case StatusFilter.OPEN_MARKETS:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=open&ungroup=true`,
                            { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                        );
                        markets = response.data;
                        break;
                    case StatusFilter.RESOLVED_MARKETS:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=resolved&ungroup=true`,
                            { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                        );
                        markets = response.data;
                        break;
                    case StatusFilter.CANCELLED_MARKETS:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=cancelled&ungroup=true`,
                            { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                        );
                        markets = response.data;
                        break;
                    case StatusFilter.PAUSED_MARKETS:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=paused&ungroup=true`,
                            { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                        );
                        markets = response.data;
                        break;
                    case StatusFilter.ONGOING_MARKETS:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=ongoing&ungroup=true`,
                            { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                        );
                        markets = response.data;
                        break;
                    default:
                        break;
                }

                markets = markets.map((market: any) => {
                    return {
                        ...market,
                        maturityDate: new Date(market.maturityDate),
                        odds: market.odds.map((odd: any) => odd.normalizedImplied),
                        childMarkets: orderBy(
                            market.childMarkets
                                .filter((childMarket: any) => market.status === childMarket.status)
                                .map((childMarket: any) => {
                                    return {
                                        ...childMarket,
                                        maturityDate: new Date(childMarket.maturityDate),
                                        odds: childMarket.odds.map((odd: any) => odd.normalizedImplied),
                                    };
                                }),
                            ['typeId'],
                            ['asc']
                        ),
                    };
                });
            } catch (e) {
                console.log(e);
            }
            return markets;
        },
        {
            refetchInterval: 60 * 1000,
            ...options,
        }
    );
};

export default useSportsMarketsV2Query;

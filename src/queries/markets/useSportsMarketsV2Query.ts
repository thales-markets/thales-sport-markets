import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { GlobalFiltersEnum } from 'enums/markets';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarkets } from 'types/markets';

const marketsCache = {
    [GlobalFiltersEnum.OpenMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.Canceled]: [] as SportMarkets,
    [GlobalFiltersEnum.ResolvedMarkets]: [] as SportMarkets,
    [GlobalFiltersEnum.PendingMarkets]: [] as SportMarkets,
};

// TODO - there is a problem when return type is SportMarkets (some problem with SGP mapping and query is stuck in fetching), keep logic with typeof marketsCache for now
const useSportsMarketsV2Query = (
    globalFilter: GlobalFiltersEnum,
    networkId: Network,
    options?: UseQueryOptions<typeof marketsCache>
) => {
    return useQuery<typeof marketsCache>(
        QUERY_KEYS.SportMarketsV2(globalFilter, networkId),
        async () => {
            let markets: any[] = [];
            let response;
            try {
                // const today = new Date();
                // // thales-data takes timestamp argument in seconds
                // const minMaturityDate = Math.round(new Date(new Date().setDate(today.getDate() - 7)).getTime() / 1000); // show history for 7 days in the past
                // const todaysDate = Math.round(today.getTime() / 1000);

                switch (globalFilter) {
                    case GlobalFiltersEnum.OpenMarkets:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/markets/?status=open&ungroup=true`
                        );
                        markets = response.data;
                        break;
                    case GlobalFiltersEnum.ResolvedMarkets:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/markets/?status=resolved&ungroup=true`
                        );
                        markets = response.data;
                        break;
                    case GlobalFiltersEnum.Canceled:
                        const [canceledMarkets, pausedMarkets] = await Promise.all([
                            axios.get(`${generalConfig.API_URL}/overtime-v2/markets/?status=paused&ungroup=true`),
                            axios.get(`${generalConfig.API_URL}/overtime-v2/markets/?status=canceled&ungroup=true`),
                        ]);
                        markets = [...canceledMarkets.data, ...pausedMarkets.data];
                        // markets = uniqBy([...canceledMarkets, ...pausedMarkets], 'address');
                        break;
                    case GlobalFiltersEnum.PendingMarkets:
                        response = await axios.get(
                            `${generalConfig.API_URL}/overtime-v2/markets/?status=ongoing&ungroup=true`
                        );
                        markets = response.data;
                        break;
                    default:
                        break;
                }

                marketsCache[globalFilter] = markets.map((market: any) => {
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
            return marketsCache;
        },
        {
            refetchInterval: 60 * 1000,
            ...options,
        }
    );
};

export default useSportsMarketsV2Query;

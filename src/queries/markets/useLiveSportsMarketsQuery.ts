import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarket, SportMarketError, SportMarkets } from 'types/markets';
import { QueryConfig } from 'types/network';

// without this every request is treated as new even though it has the same response
const marketsCache = { live: [] as SportMarkets };

const useLiveSportsMarketsQuery = (
    isLiveSelected: boolean,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<{ live: SportMarkets }>({
        queryKey: QUERY_KEYS.LiveSportMarkets(queryConfig.networkId),
        queryFn: async () => {
            try {
                const response = await axios.get<
                    undefined,
                    { data: { errors: SportMarketError[]; markets: SportMarkets } }
                >(`${generalConfig.API_URL}/overtime-v2/networks/${queryConfig.networkId}/live-markets`, noCacheConfig);

                const markets: SportMarkets = response?.data?.markets || marketsCache.live;
                const errors = response?.data?.errors;

                const marketsFlattened: SportMarkets = markets
                    .reduce((accumulator: SportMarkets, value) => accumulator.concat(value), [])
                    .map((game: SportMarket) => {
                        const gameErrors = errors.find((error) => error.gameId === game.gameId);
                        if (gameErrors) {
                            gameErrors.errorsDetails = gameErrors.errorsDetails
                                .filter((errorDetails) => {
                                    // get only errors from last processing
                                    const lastError = gameErrors.errorsDetails.at(-1);
                                    return errorDetails.processingTime === lastError?.processingTime;
                                })
                                .map((errorDetails) => ({
                                    ...errorDetails,
                                    processingTime: new Date(errorDetails.processingTime).getTime(),
                                    errorTime: new Date(errorDetails.errorTime).getTime(),
                                }));
                        }

                        game.childMarkets = game.childMarkets.map((childMarket: any) => {
                            return {
                                ...childMarket,
                                live: true, // TODO: remove this property from business logic on UI
                                maturityDate: new Date(childMarket.maturityDate),
                                odds: childMarket.odds.map((odd: any) => odd.normalizedImplied),
                            };
                        });

                        return {
                            ...game,
                            live: true, // TODO: remove this property from business logic on UI(we can leave this one for parent, but child markets shouldnt have live flag)
                            maturityDate: new Date(game.maturityDate),
                            odds: game.odds.map((odd: any) => odd.normalizedImplied),
                            errors: gameErrors?.errorsDetails || [],
                        };
                    });
                marketsCache.live = marketsFlattened;
                return { live: marketsFlattened };
            } catch (e) {
                console.log(e);
            }

            return marketsCache;
        },
        refetchInterval: secondsToMilliseconds(isLiveSelected ? 2 : 10),
        ...options,
    });
};

export default useLiveSportsMarketsQuery;

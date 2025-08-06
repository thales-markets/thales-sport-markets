import { UseQueryOptions, UseQueryResult, useQueries } from '@tanstack/react-query';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds } from 'date-fns';
import { NetworkId, bigNumberFormatter } from 'thales-utils';
import { getBenchmarksPriceFeeds, getPriceConnection } from 'utils/pyth';

type PriceRequest = {
    priceId: string;
    publishTime: number;
};

const usePythPriceQueries = (
    networkId: NetworkId,
    priceRequests: PriceRequest[],
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
): UseQueryResult<number>[] => {
    const fetchPythPrice = async (priceRequest: PriceRequest) => {
        const priceConnection = getPriceConnection(networkId);

        let price = 0;
        try {
            const priceFeed = await priceConnection.getPriceUpdatesAtTimestamp(priceRequest.publishTime, [
                priceRequest.priceId,
            ]);
            price = priceFeed.parsed
                ? bigNumberFormatter(BigInt(priceFeed.parsed[0].price.price), PYTH_CURRENCY_DECIMALS)
                : 0;
        } catch (e) {
            console.log('Pyth price feed error', e);
            const unavailablePrice: PriceRequest = {
                priceId: priceRequest.priceId.replace('0x', ''),
                publishTime: priceRequest.publishTime,
            };
            // Secondary API for fetching prices using Pyth benchmarks in case that primary fails
            const benchmarksPriceFeeds = await getBenchmarksPriceFeeds([unavailablePrice]);
            price = benchmarksPriceFeeds.length ? benchmarksPriceFeeds[0].price : 0;
        }

        return price;
    };

    return useQueries({
        queries: priceRequests.map((priceRequest) => ({
            queryKey: QUERY_KEYS.Prices.PythPrices(priceRequest.priceId, priceRequest.publishTime),
            queryFn: () => fetchPythPrice(priceRequest),
            cacheTime: hoursToMilliseconds(10),
            staleTime: hoursToMilliseconds(10),
            ...options,
        })),
    });
};

export default usePythPriceQueries;

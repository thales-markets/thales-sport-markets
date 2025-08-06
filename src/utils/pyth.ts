import { HermesClient } from '@pythnetwork/hermes-client';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { LINKS } from 'constants/links';
import { TEST_NETWORKS } from 'constants/network';
import {
    CONNECTION_TIMEOUT_MS,
    PRICE_ID,
    PRICE_SERVICE_ENDPOINTS,
    PYTH_CURRENCY_DECIMALS,
    SUPPORTED_ASSETS,
} from 'constants/pyth';
import { NetworkId, bigNumberFormatter, floorNumberToDecimals } from 'thales-utils';
import { parseUnits } from 'viem';

const getPriceServiceEndpoint = (networkId: NetworkId) => {
    if (TEST_NETWORKS.includes(networkId)) {
        return PRICE_SERVICE_ENDPOINTS.testnet;
    } else {
        return PRICE_SERVICE_ENDPOINTS.mainnet;
    }
};

export const getPriceConnection = (networkId: NetworkId) => {
    return new HermesClient(getPriceServiceEndpoint(networkId), { timeout: CONNECTION_TIMEOUT_MS });
};

export const getPriceId = (networkId: NetworkId, currency: typeof CRYPTO_CURRENCY_MAP[number]) => {
    if (TEST_NETWORKS.includes(networkId)) {
        return PRICE_ID.testnet[currency];
    } else {
        return PRICE_ID.mainnet[currency];
    }
};

const getCurrencyByPriceId = (networkId: NetworkId, priceId: string) => {
    if (TEST_NETWORKS.includes(networkId)) {
        return (
            Object.keys(PRICE_ID.testnet).find((key) => PRICE_ID.testnet[key] === '0x' + priceId) || 'currencyNotFound'
        );
    } else {
        return (
            Object.keys(PRICE_ID.mainnet).find((key) => PRICE_ID.mainnet[key] === '0x' + priceId) || 'currencyNotFound'
        );
    }
};

export const getSupportedAssetsAsObject = () => SUPPORTED_ASSETS.reduce((acc, asset) => ({ ...acc, [asset]: 0 }), {});

export const getCurrentPrices = async (connection: HermesClient, networkId: NetworkId, priceIds: string[]) => {
    let currentPrices = getSupportedAssetsAsObject();

    try {
        const priceFeeds = await connection.getLatestPriceUpdates(priceIds);

        if (priceFeeds.parsed) {
            currentPrices = priceFeeds.parsed.reduce(
                (accumulator, priceFeed) => ({
                    ...accumulator,
                    [getCurrencyByPriceId(networkId, priceFeed.id)]: bigNumberFormatter(
                        BigInt(priceFeed.price.price),
                        PYTH_CURRENCY_DECIMALS
                    ),
                }),
                {}
            );
        }
    } catch (e) {
        console.log('Error while fetching Pyth latest price feeds', e);
    }

    return currentPrices;
};

/*
 * Fetching historical prices for a given array of objects with price ID and publish time
 * using Pyth benchmarks API.
 *
 * Pyth benchmarks API - for given price ID and publish time returns single historical price
 * as object 'parsed' with array of prices which contains parsed object with id and price data.
 *
 * Parametar Price ID is without starting chars 0x
 * Has limitations of 30 requests per 10 seconds.
 */
export const getBenchmarksPriceFeeds = async (priceFeeds: { priceId: string; publishTime: number }[]) => {
    const benchmarksPriceFeeds: { priceId: string; publishTime: number; price: number }[] = [];

    if (priceFeeds.length) {
        const benchmarksPricePromises = priceFeeds.map((data: any) =>
            fetch(`${LINKS.Pyth.BenchmarksPrice}${data.publishTime}?ids=${data.priceId}`).catch((e) =>
                console.log('Pyth price benchmarks error', e)
            )
        );

        const benchmarksPriceResponses = await Promise.allSettled(benchmarksPricePromises);
        const benchmarksResponseBodies: (Promise<any> | undefined)[] = benchmarksPriceResponses.map(
            (benchmarksPriceResponse) => {
                if (benchmarksPriceResponse.status === 'fulfilled') {
                    if (benchmarksPriceResponse.value) {
                        if (benchmarksPriceResponse.value.status == 200) {
                            return benchmarksPriceResponse.value.text();
                        } else {
                            console.log('Failed to fetch Pyth benchmarks data', benchmarksPriceResponse.value.status);
                        }
                    }
                }
            }
        );

        const responses = await Promise.all(benchmarksResponseBodies);
        responses.map((response, index) => {
            // parsed[0] - always fetching one price ID
            const bodyTextParsed = response ? JSON.parse(response).parsed[0] : undefined;

            benchmarksPriceFeeds.push({
                priceId: priceFeeds[index].priceId,
                publishTime: priceFeeds[index].publishTime, // requested publish time
                price: bodyTextParsed ? bigNumberFormatter(bodyTextParsed.price.price, PYTH_CURRENCY_DECIMALS) : 0,
            });
        });
    }

    return benchmarksPriceFeeds;
};

export const priceParser = (value: number) =>
    parseUnits(floorNumberToDecimals(value, PYTH_CURRENCY_DECIMALS).toString(), PYTH_CURRENCY_DECIMALS);

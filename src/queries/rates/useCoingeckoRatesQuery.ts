import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { Coins } from 'thales-utils';

type CoingeckoRates = Record<Coins, number>;

const COINGECKO_CURRENCY_ID_MAP = {
    [CRYPTO_CURRENCY_MAP.ARB]: 'arbitrum',
    [CRYPTO_CURRENCY_MAP.OP]: 'optimism',
    [CRYPTO_CURRENCY_MAP.ETH]: 'ethereum',
    [CRYPTO_CURRENCY_MAP.WETH]: 'weth',
    [CRYPTO_CURRENCY_MAP.THALES]: 'thales',
};

const useCoingeckoRatesQuery = (options?: UseQueryOptions<CoingeckoRates>) => {
    return useQuery<CoingeckoRates>(
        QUERY_KEYS.Rates.CoingeckoRates(),
        async () => {
            const rates: CoingeckoRates = {
                ARB: 0,
                OP: 0,
                ETH: 0,
                WETH: 0,
                sUSD: 1,
                DAI: 1,
                USDCe: 1,
                USDC: 1,
                USDT: 1,
                USDbC: 1,
                BUSD: 1,
                THALES: 0,
            };

            const url =
                'https://api.coingecko.com/api/v3/simple/price?ids=thales,ethereum,weth,optimism,arbitrum&vs_currencies=usd&precision=2';
            const options = { method: 'GET', headers: { accept: 'application/json' } };

            try {
                const response = await fetch(url, options);
                const body = await response.json();

                rates[CRYPTO_CURRENCY_MAP.ARB as Coins] = Number(
                    body[COINGECKO_CURRENCY_ID_MAP[CRYPTO_CURRENCY_MAP.ARB]].usd
                );
                rates[CRYPTO_CURRENCY_MAP.OP as Coins] = Number(
                    body[COINGECKO_CURRENCY_ID_MAP[CRYPTO_CURRENCY_MAP.OP]].usd
                );
                rates[CRYPTO_CURRENCY_MAP.ETH as Coins] = Number(
                    body[COINGECKO_CURRENCY_ID_MAP[CRYPTO_CURRENCY_MAP.ETH]].usd
                );
                rates[CRYPTO_CURRENCY_MAP.WETH as Coins] = Number(
                    body[COINGECKO_CURRENCY_ID_MAP[CRYPTO_CURRENCY_MAP.WETH]].usd
                );
                rates[CRYPTO_CURRENCY_MAP.THALES as Coins] = Number(
                    body[COINGECKO_CURRENCY_ID_MAP[CRYPTO_CURRENCY_MAP.THALES]].usd
                );
            } catch (err) {
                console.error('Coingecko price error:' + err);
            }

            return rates;
        },
        {
            refetchOnWindowFocus: false, // due to rate limit
            ...options,
        }
    );
};

export default useCoingeckoRatesQuery;

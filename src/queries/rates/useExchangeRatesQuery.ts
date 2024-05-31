import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, parseBytes32String } from 'thales-utils';
import networkConnector from 'utils/networkConnector';
export type Rates = Record<string, number>;

const useExchangeRatesQuery = (networkId: Network, options?: UseQueryOptions<Rates>) => {
    return useQuery<Rates>(
        QUERY_KEYS.Rates.ExchangeRates(networkId),
        async () => {
            const exchangeRates: Rates = {};

            if (networkConnector.priceFeedContract) {
                const [currencies, rates] = await Promise.all([
                    networkConnector.priceFeedContract.getCurrencies(),
                    networkConnector.priceFeedContract.getRates(),
                ]);
                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                    if (currencyName === CRYPTO_CURRENCY_MAP.USDC) {
                        exchangeRates[`${currencyName}e`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === 'SUSD') {
                        exchangeRates[`sUSD`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                });
            }

            return exchangeRates;
        },
        {
            refetchInterval: 60 * 1000,
            ...options,
        }
    );
};

export default useExchangeRatesQuery;

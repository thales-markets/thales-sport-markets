import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, parseBytes32String } from 'thales-utils';
import networkConnector from 'utils/networkConnector';
import { THALES_CONTRACT_RATE_KEY } from '../../constants/markets';

export type Rates = Record<string, number>;

const useExchangeRatesQuery = (networkId: Network, options?: UseQueryOptions<Rates>) => {
    return useQuery<Rates>(
        QUERY_KEYS.Rates.ExchangeRates(networkId),
        async () => {
            const exchangeRates: Rates = {};

            if (networkConnector.priceFeedContract) {
                const [currencies, rates, thalesPriceResponse] = await Promise.all([
                    networkConnector.priceFeedContract.getCurrencies(),
                    networkConnector.priceFeedContract.getRates(),
                    axios.get(`${generalConfig.API_URL}/token/price`),
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
                exchangeRates[THALES_CONTRACT_RATE_KEY] = exchangeRates['THALES'];
                exchangeRates['THALES'] = Number(thalesPriceResponse.data);
                exchangeRates['sTHALES'] = Number(thalesPriceResponse.data);
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

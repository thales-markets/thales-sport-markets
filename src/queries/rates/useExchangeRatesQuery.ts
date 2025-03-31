import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { minutesToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import { OVER_CONTRACT_RATE_KEY, THALES_CONTRACT_RATE_KEY } from '../../constants/markets';

const useExchangeRatesQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Rates>({
        queryKey: QUERY_KEYS.Rates.ExchangeRates(networkConfig.networkId),
        queryFn: async () => {
            const exchangeRates: Rates = {};

            const priceFeedContract = getContractInstance(ContractType.PRICE_FEED, networkConfig) as ViemContract;

            if (priceFeedContract) {
                const [currencies, rates, thalesPriceResponse, overPriceResponse] = await Promise.all([
                    priceFeedContract.read.getCurrencies(),
                    priceFeedContract.read.getRates(),
                    axios.get(`${generalConfig.API_URL}/token/price`),
                    axios.get(`${generalConfig.API_URL}/over-token/price`),
                ]);

                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                    if (currencyName === CRYPTO_CURRENCY_MAP.USDC) {
                        exchangeRates[`${currencyName}e`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === CRYPTO_CURRENCY_MAP.BTC) {
                        exchangeRates[`cb${currencyName}`] = bigNumberFormatter(rates[idx]);
                        exchangeRates[`w${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                });
                exchangeRates[THALES_CONTRACT_RATE_KEY] = exchangeRates['THALES'];
                exchangeRates['THALES'] = Number(thalesPriceResponse.data);
                exchangeRates['sTHALES'] = Number(thalesPriceResponse.data);
                exchangeRates[OVER_CONTRACT_RATE_KEY] = exchangeRates['OVER'];
                exchangeRates['OVER'] = Number(overPriceResponse.data);
            }

            return exchangeRates;
        },
        refetchInterval: minutesToMilliseconds(1),
        ...options,
    });
};

export default useExchangeRatesQuery;

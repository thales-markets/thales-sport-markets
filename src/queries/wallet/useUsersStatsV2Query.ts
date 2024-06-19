import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { UserStats } from 'types/markets';
import { getCollateralByAddress, isLpSupported, isStableCurrency } from 'utils/collaterals';
import networkConnector from 'utils/networkConnector';
import { Rates } from '../rates/useExchangeRatesQuery';

const useUsersStatsV2Query = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<UserStats | undefined>
) => {
    return useQuery<UserStats | undefined>(
        QUERY_KEYS.Wallet.StatsV2(networkId, walletAddress),
        async () => {
            const { sportsAMMDataContract, priceFeedContract } = networkConnector;
            if (sportsAMMDataContract && priceFeedContract) {
                const [activeTickets, resolvedTickets, currencies, rates, thalesPriceResponse] = await Promise.all([
                    sportsAMMDataContract.getActiveTicketsDataPerUser(walletAddress, 0, BATCH_SIZE),
                    sportsAMMDataContract.getResolvedTicketsDataPerUser(walletAddress, 0, BATCH_SIZE),
                    priceFeedContract.getCurrencies(),
                    priceFeedContract.getRates(),
                    axios.get(`${generalConfig.API_URL}/token/price`),
                ]);

                const exchangeRates: Rates = {};
                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                });
                exchangeRates['THALES'] = Number(thalesPriceResponse.data);

                const tickets = [...activeTickets, ...resolvedTickets];

                let volume = 0;
                let highestWin = 0;
                let lifetimeWins = 0;
                for (let index = 0; index < tickets.length; index++) {
                    const ticket = tickets[index];
                    const collateral = getCollateralByAddress(ticket.collateral, networkId);
                    const convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

                    const buyInAmount = coinFormatter(ticket.buyInAmount, networkId, collateral);
                    const totalQuote = bigNumberFormatter(ticket.totalQuote);
                    const buyInAmountInUsd = convertAmount ? buyInAmount * exchangeRates[collateral] : buyInAmount;
                    const payout = buyInAmountInUsd / totalQuote;

                    volume += buyInAmountInUsd;
                    if (ticket.isUserTheWinner && payout > highestWin) {
                        highestWin = payout;
                    }
                    if (ticket.isUserTheWinner) {
                        lifetimeWins += 1;
                    }
                }

                return {
                    id: walletAddress,
                    volume,
                    trades: tickets.length,
                    highestWin,
                    lifetimeWins,
                };
            }

            return undefined;
        },
        {
            ...options,
        }
    );
};

export default useUsersStatsV2Query;

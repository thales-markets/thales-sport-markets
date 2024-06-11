import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { UserStats } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { CRYPTO_CURRENCY_MAP } from '../../constants/currency';
import { getCollateralByAddress, isLpSupported, isStableCurrency } from '../../utils/collaterals';
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
                const [activeTickets, resolvedTickets, currencies, rates] = await Promise.all([
                    sportsAMMDataContract.getActiveTicketsDataPerUser(walletAddress),
                    sportsAMMDataContract.getResolvedTicketsDataPerUser(walletAddress),
                    priceFeedContract.getCurrencies(),
                    priceFeedContract.getRates(),
                ]);

                const exchangeRates: Rates = {};
                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                });

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
                    const payout = buyInAmount / totalQuote;

                    volume += convertAmount ? buyInAmount * exchangeRates[collateral] : buyInAmount;
                    if (ticket.isUserTheWinner && payout > highestWin) {
                        highestWin = convertAmount ? payout * exchangeRates[collateral] : payout;
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
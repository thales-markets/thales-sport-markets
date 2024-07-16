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
            const { sportsAMMDataContract, priceFeedContract, sportsAMMV2ManagerContract } = networkConnector;
            if (sportsAMMDataContract && priceFeedContract && sportsAMMV2ManagerContract) {
                const [numOfActiveTicketsPerUser, numOfResolvedTicketsPerUser] = await Promise.all([
                    sportsAMMV2ManagerContract.numOfActiveTicketsPerUser(walletAddress),
                    sportsAMMV2ManagerContract.numOfResolvedTicketsPerUser(walletAddress),
                ]);

                const numberOfActiveBatches = Math.trunc(Number(numOfActiveTicketsPerUser) / BATCH_SIZE) + 1;
                const numberOfResolvedBatches = Math.trunc(Number(numOfResolvedTicketsPerUser) / BATCH_SIZE) + 1;

                const promises = [];
                for (let i = 0; i < numberOfActiveBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.getActiveTicketsDataPerUser(walletAddress, i * BATCH_SIZE, BATCH_SIZE)
                    );
                }
                for (let i = 0; i < numberOfResolvedBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.getResolvedTicketsDataPerUser(walletAddress, i * BATCH_SIZE, BATCH_SIZE)
                    );
                }
                promises.push(priceFeedContract.getCurrencies());
                promises.push(priceFeedContract.getRates());
                promises.push(axios.get(`${generalConfig.API_URL}/token/price`));

                const promisesResult = await Promise.all(promises);
                const promisesLength = promises.length;

                const tickets = promisesResult
                    .slice(0, promisesLength - 3)
                    .map((allData) => allData.ticketsData)
                    .flat(1);

                const freeBetTickets = promisesResult
                    .slice(0, promisesLength - 3)
                    .map((allData) => allData.freeBetsData)
                    .flat(1)
                    .map((ticket) => {
                        return { ...ticket, isFreeBet: true };
                    });

                tickets.push(...freeBetTickets);

                const currencies = promisesResult[promisesLength - 3];
                const rates = promisesResult[promisesLength - 2];
                const thalesPriceResponse = promisesResult[promisesLength - 1];

                const exchangeRates: Rates = {};
                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                });
                exchangeRates['THALES'] = Number(thalesPriceResponse.data);

                let volume = 0;
                let highestWin = 0;
                let lifetimeWins = 0;
                let pnl = 0;
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
                        pnl += payout - buyInAmountInUsd;
                    }
                    if (ticket.isLost) {
                        pnl -= buyInAmountInUsd;
                    }
                }

                return {
                    id: walletAddress,
                    volume,
                    trades: tickets.length,
                    highestWin,
                    lifetimeWins,
                    pnl,
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

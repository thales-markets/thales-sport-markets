import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, Coins, parseBytes32String } from 'thales-utils';
import { LpUsersPnl, Ticket } from 'types/markets';
import { SupportedNetwork } from 'types/network';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getLpAddress } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';
import { Rates } from '../rates/useExchangeRatesQuery';

const useLpUsersPnl = (
    lpCollateral: LiquidityPoolCollateral,
    round: number,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<LpUsersPnl[]>
) => {
    return useQuery<LpUsersPnl[]>(
        QUERY_KEYS.Wallet.LpUsersPnl(lpCollateral, round, networkId),
        async () => {
            const { sportsAMMDataContract, liquidityPoolDataContract, priceFeedContract } = networkConnector;
            if (sportsAMMDataContract && liquidityPoolDataContract && priceFeedContract) {
                const [
                    lpTickets,
                    gamesInfoResponse,
                    playersInfoResponse,
                    liveScoresResponse,
                    currencies,
                    rates,
                    thalesPriceResponse,
                ] = await Promise.all([
                    liquidityPoolDataContract.getRoundTickets(getLpAddress(networkId, lpCollateral), round),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
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

                const numberOfBatches = Math.trunc(lpTickets.length / BATCH_SIZE) + 1;

                const promises = [];
                for (let i = 0; i < numberOfBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.getTicketsData(lpTickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE))
                    );
                }

                const promisesResult = await Promise.all(promises);
                const ticketsData = promisesResult.flat(1);

                const mappedTickets: Ticket[] = ticketsData.map((ticket: any) =>
                    mapTicket(
                        ticket,
                        networkId,
                        gamesInfoResponse.data,
                        playersInfoResponse.data,
                        liveScoresResponse.data
                    )
                );

                const finalTickets: Ticket[] = orderBy(
                    updateTotalQuoteAndPayout(mappedTickets),
                    ['timestamp'],
                    ['desc']
                );

                const usersPnl: Record<string, LpUsersPnl> = {};
                finalTickets.forEach((ticket) => {
                    if (usersPnl[ticket.account] === undefined) {
                        usersPnl[ticket.account] = {
                            account: ticket.account,
                            pnl: 0,
                            pnlInUsd: 0,
                        };
                    }
                    if (ticket.isUserTheWinner && !ticket.isCancelled) {
                        usersPnl[ticket.account].pnl += ticket.payout - ticket.buyInAmount;
                    }
                    if (ticket.isLost && !ticket.isCancelled) {
                        usersPnl[ticket.account].pnl -= ticket.buyInAmount;
                    }
                });

                let lpUsersPnl = Object.values(usersPnl);

                const collateral = lpCollateral.toUpperCase() as Coins;
                const convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

                lpUsersPnl.forEach((pnl) => {
                    pnl.pnlInUsd = convertAmount ? pnl.pnl * exchangeRates[collateral] : pnl.pnl;
                });

                lpUsersPnl = orderBy(lpUsersPnl, ['pnl'], ['desc']);

                return lpUsersPnl;
            }

            return [];
        },
        {
            ...options,
        }
    );
};

export default useLpUsersPnl;

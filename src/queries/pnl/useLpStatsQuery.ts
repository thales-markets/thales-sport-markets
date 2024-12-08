import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { Contract } from 'ethers';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, Coins, parseBytes32String } from 'thales-utils';
import { LpStats, Ticket } from 'types/markets';
import { SupportedNetwork } from 'types/network';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getLpAddress } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';
import { League } from '../../enums/sports';
import { Rates } from '../rates/useExchangeRatesQuery';

const getLpStats = async (
    tickets: string[],
    sportsAMMDataContract: Contract,
    networkId: SupportedNetwork,
    exchangeRates: Rates,
    leagueId: League,
    onlyPP: boolean
) => {
    const numberOfBatches = Math.trunc(tickets.length / BATCH_SIZE) + 1;

    const promises = [];
    for (let i = 0; i < numberOfBatches; i++) {
        promises.push(sportsAMMDataContract.getTicketsData(tickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)));
    }

    const promisesResult = await Promise.all(promises);
    const ticketsData = promisesResult.flat(1);

    let pnl = 0;
    let fees = 0;
    let convertAmount = false;
    let collateral = '' as Coins;

    const mappedTickets: Ticket[] = ticketsData.map((ticket: any) => mapTicket(ticket, networkId, [], [], []));

    const finalTickets: Ticket[] = orderBy(
        updateTotalQuoteAndPayout(mappedTickets).filter(
            (ticket) =>
                ((ticket.sportMarkets.length === 1 && ticket.sportMarkets[0].leagueId === leagueId && !!leagueId) ||
                    !leagueId) &&
                ((ticket.sportMarkets.length === 1 && ticket.sportMarkets[0].isPlayerPropsMarket && !!onlyPP) ||
                    !onlyPP)
        ),
        ['timestamp'],
        ['desc']
    );

    for (let index = 0; index < finalTickets.length; index++) {
        const ticket = finalTickets[index];
        collateral = ticket.collateral === 'sTHALES' ? 'THALES' : ticket.collateral;
        convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

        if (ticket.isUserTheWinner && !ticket.isCancelled) {
            pnl -= ticket.payout + ticket.fees - ticket.buyInAmount;
            fees += ticket.fees;
        }
        if (ticket.isLost && !ticket.isCancelled) {
            pnl += ticket.buyInAmount - ticket.fees;
            fees += ticket.fees;
        }
    }

    const lpStats: LpStats = {
        name: collateral.toUpperCase(),
        numberOfTickets: tickets.length,
        pnl,
        fees,
        pnlInUsd: convertAmount ? pnl * exchangeRates[collateral] : pnl,
        feesInUsd: convertAmount ? fees * exchangeRates[collateral] : fees,
    };

    return lpStats;
};

const useLpStatsQuery = (
    round: number,
    leagueId: League,
    onlyPP: boolean,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<LpStats[]>
) => {
    return useQuery<LpStats[]>(
        QUERY_KEYS.Pnl.LpStats(round, leagueId, onlyPP, networkId),
        async () => {
            const { sportsAMMDataContract, liquidityPoolDataContract, priceFeedContract } = networkConnector;
            if (sportsAMMDataContract && liquidityPoolDataContract && priceFeedContract) {
                const [
                    usdcTickets,
                    wethTickets,
                    thalesTickets,
                    currencies,
                    rates,
                    thalesPriceResponse,
                ] = await Promise.all([
                    liquidityPoolDataContract.getRoundTickets(
                        getLpAddress(networkId, LiquidityPoolCollateral.USDC),
                        round
                    ),
                    liquidityPoolDataContract.getRoundTickets(
                        getLpAddress(networkId, LiquidityPoolCollateral.WETH),
                        round
                    ),
                    liquidityPoolDataContract.getRoundTickets(
                        getLpAddress(networkId, LiquidityPoolCollateral.THALES),
                        round
                    ),
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

                const usdcLpStats = await getLpStats(
                    usdcTickets,
                    sportsAMMDataContract,
                    networkId,
                    exchangeRates,
                    leagueId,
                    onlyPP
                );
                const wethLpStats = await getLpStats(
                    wethTickets,
                    sportsAMMDataContract,
                    networkId,
                    exchangeRates,
                    leagueId,
                    onlyPP
                );
                const thalesLpStats = await getLpStats(
                    thalesTickets,
                    sportsAMMDataContract,
                    networkId,
                    exchangeRates,
                    leagueId,
                    onlyPP
                );

                const lpStats: LpStats = {
                    name: 'TOTAL',
                    numberOfTickets:
                        usdcLpStats.numberOfTickets + wethLpStats.numberOfTickets + thalesLpStats.numberOfTickets,
                    pnl: usdcLpStats.pnlInUsd + wethLpStats.pnlInUsd + thalesLpStats.pnlInUsd,
                    fees: usdcLpStats.feesInUsd + wethLpStats.feesInUsd + thalesLpStats.feesInUsd,
                    pnlInUsd: usdcLpStats.pnlInUsd + wethLpStats.pnlInUsd + thalesLpStats.pnlInUsd,
                    feesInUsd: usdcLpStats.feesInUsd + wethLpStats.feesInUsd + thalesLpStats.feesInUsd,
                };

                return [usdcLpStats, wethLpStats, thalesLpStats, lpStats];
            }

            return [];
        },
        {
            ...options,
        }
    );
};

export default useLpStatsQuery;

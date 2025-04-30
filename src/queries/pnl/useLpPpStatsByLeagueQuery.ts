import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { groupBy, orderBy, uniq } from 'lodash';
import { League } from 'overtime-utils';
import { bigNumberFormatter, Coins, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { LpStats, Ticket } from 'types/markets';
import { NetworkConfig, SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getLpAddress, getRoundWithOffset, isLpAvailableForNetwork } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { mapTicket } from 'utils/tickets';

const getLpStats = async (
    tickets: string[],
    sportsAMMDataContract: ViemContract,
    networkId: SupportedNetwork,
    exchangeRates: Rates,
    leagueId: League,
    onlyPP: boolean,
    name: LiquidityPoolCollateral
) => {
    const numberOfBatches = Math.trunc(tickets.length / BATCH_SIZE) + 1;

    const promises = [];
    for (let i = 0; i < numberOfBatches; i++) {
        promises.push(sportsAMMDataContract.read.getTicketsData([tickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)]));
    }

    const promisesResult = await Promise.all(promises);
    const ticketsData = promisesResult.flat(1);

    const mappedTickets: Ticket[] = ticketsData.map((ticket: any) => mapTicket(ticket, networkId, [], [], []));

    const finalTickets: Ticket[] = orderBy(
        updateTotalQuoteAndPayout(mappedTickets).filter(
            (ticket) =>
                ticket.sportMarkets.length === 1 &&
                ((ticket.sportMarkets[0].leagueId === leagueId && !!leagueId) || !leagueId) &&
                ((ticket.sportMarkets[0].isPlayerPropsMarket && !!onlyPP) || !onlyPP)
        ),
        ['timestamp'],
        ['desc']
    );

    const finalTicketsByLeague = groupBy(finalTickets, (ticket) => ticket.sportMarkets[0].leagueId);

    const lpStatsByLeague: Record<number, LpStats> = {};

    Object.keys(finalTicketsByLeague).forEach((league) => {
        let pnl = 0;
        let fees = 0;
        let convertAmount = false;
        let collateral = '' as Coins;

        const ticketsByLeague = finalTicketsByLeague[league];

        for (let index = 0; index < ticketsByLeague.length; index++) {
            const ticket = ticketsByLeague[index];
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
            name: name.toUpperCase(),
            numberOfTickets: ticketsByLeague.length,
            pnl,
            fees,
            pnlInUsd: convertAmount ? pnl * exchangeRates[collateral] : pnl,
            feesInUsd: convertAmount ? fees * exchangeRates[collateral] : fees,
        };

        lpStatsByLeague[Number(league)] = lpStats;
    });

    return lpStatsByLeague;
};

const useLpPpStatsByLeagueQuery = (
    round: number,
    leagueId: League,
    onlyPP: boolean,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<Record<number, LpStats[]>>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Record<number, LpStats[]>>({
        queryKey: QUERY_KEYS.Pnl.LpPpStatsByLeague(round, leagueId, onlyPP, networkConfig.networkId),
        queryFn: async () => {
            try {
                const [sportsAMMDataContract, liquidityPoolDataContract, priceFeedContract] = [
                    getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig),
                    getContractInstance(ContractType.LIQUIDITY_POOL_DATA, networkConfig),
                    getContractInstance(ContractType.PRICE_FEED, networkConfig),
                ];

                if (sportsAMMDataContract && liquidityPoolDataContract && priceFeedContract) {
                    const [
                        usdcTickets,
                        wethTickets,
                        thalesTickets,
                        overTickets,
                        cbbtcTickets,
                        wbtcTickets,
                        currencies,
                        rates,
                        thalesPriceResponse,
                        overPriceResponse,
                    ] = await Promise.all([
                        liquidityPoolDataContract.read.getRoundTickets([
                            getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.USDC),
                            getRoundWithOffset(round, networkConfig.networkId, LiquidityPoolCollateral.USDC),
                        ]),
                        liquidityPoolDataContract.read.getRoundTickets([
                            getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.WETH),
                            getRoundWithOffset(round, networkConfig.networkId, LiquidityPoolCollateral.WETH),
                        ]),
                        isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.THALES)
                            ? liquidityPoolDataContract.read.getRoundTickets([
                                  getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.THALES),
                                  getRoundWithOffset(round, networkConfig.networkId, LiquidityPoolCollateral.THALES),
                              ])
                            : [],
                        isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.OVER)
                            ? liquidityPoolDataContract.read.getRoundTickets([
                                  getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.OVER),
                                  getRoundWithOffset(round, networkConfig.networkId, LiquidityPoolCollateral.OVER),
                              ])
                            : [],
                        isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.cbBTC)
                            ? liquidityPoolDataContract.read.getRoundTickets([
                                  getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.cbBTC),
                                  getRoundWithOffset(round, networkConfig.networkId, LiquidityPoolCollateral.cbBTC),
                              ])
                            : [],
                        isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.wBTC)
                            ? liquidityPoolDataContract.read.getRoundTickets([
                                  getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.wBTC),
                                  getRoundWithOffset(round, networkConfig.networkId, LiquidityPoolCollateral.wBTC),
                              ])
                            : [],
                        priceFeedContract.read.getCurrencies(),
                        priceFeedContract.read.getRates(),
                        axios.get(`${generalConfig.API_URL}/token/price`),
                        axios.get(`${generalConfig.API_URL}/over-token/price`),
                    ]);

                    const exchangeRates: Rates = {};
                    currencies.forEach((currency: string, idx: number) => {
                        const currencyName = parseBytes32String(currency);
                        exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                        if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                            exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                        }
                        if (currencyName === CRYPTO_CURRENCY_MAP.BTC) {
                            exchangeRates[`cb${currencyName}`] = bigNumberFormatter(rates[idx]);
                            exchangeRates[`w${currencyName}`] = bigNumberFormatter(rates[idx]);
                        }
                    });
                    exchangeRates['THALES'] = Number(thalesPriceResponse.data);
                    exchangeRates['OVER'] = Number(overPriceResponse.data);

                    const usdcLpStats = await getLpStats(
                        Array.isArray(usdcTickets) ? usdcTickets : [usdcTickets],
                        sportsAMMDataContract,
                        networkConfig.networkId,
                        exchangeRates,
                        leagueId,
                        onlyPP,
                        LiquidityPoolCollateral.USDC
                    );
                    const wethLpStats = await getLpStats(
                        Array.isArray(wethTickets) ? wethTickets : [wethTickets],
                        sportsAMMDataContract,
                        networkConfig.networkId,
                        exchangeRates,
                        leagueId,
                        onlyPP,
                        LiquidityPoolCollateral.WETH
                    );
                    const thalesLpStats = await getLpStats(
                        Array.isArray(thalesTickets) ? thalesTickets : [thalesTickets],
                        sportsAMMDataContract,
                        networkConfig.networkId,
                        exchangeRates,
                        leagueId,
                        onlyPP,
                        LiquidityPoolCollateral.THALES
                    );
                    const overLpStats = await getLpStats(
                        Array.isArray(overTickets) ? overTickets : [overTickets],
                        sportsAMMDataContract,
                        networkConfig.networkId,
                        exchangeRates,
                        leagueId,
                        onlyPP,
                        LiquidityPoolCollateral.OVER
                    );
                    const cbbtcLpStats = await getLpStats(
                        Array.isArray(cbbtcTickets) ? cbbtcTickets : [cbbtcTickets],
                        sportsAMMDataContract,
                        networkConfig.networkId,
                        exchangeRates,
                        leagueId,
                        onlyPP,
                        LiquidityPoolCollateral.cbBTC
                    );
                    const wbtcLpStats = await getLpStats(
                        Array.isArray(wbtcTickets) ? wbtcTickets : [wbtcTickets],
                        sportsAMMDataContract,
                        networkConfig.networkId,
                        exchangeRates,
                        leagueId,
                        onlyPP,
                        LiquidityPoolCollateral.wBTC
                    );

                    const allLeagues = uniq(
                        Object.keys(usdcLpStats).concat(
                            Object.keys(wethLpStats),
                            Object.keys(thalesLpStats),
                            Object.keys(overLpStats),
                            Object.keys(cbbtcLpStats),
                            Object.keys(wbtcLpStats)
                        )
                    );

                    const lpStatsByLeague: Record<number, LpStats[]> = {};

                    allLeagues.forEach((league) => {
                        const usdcLpStatsLeague = usdcLpStats[Number(league)];
                        const wethLpStatsLeague = wethLpStats[Number(league)];
                        const thalesLpStatsLeague = thalesLpStats[Number(league)];
                        const overLpStatsLeague = overLpStats[Number(league)];
                        const cbbtcLpStatsLeague = cbbtcLpStats[Number(league)];
                        const wbtcLpStatsLeague = wbtcLpStats[Number(league)];

                        const totalLpStats: LpStats = {
                            name: 'TOTAL',
                            numberOfTickets:
                                (usdcLpStatsLeague?.numberOfTickets || 0) +
                                (wethLpStatsLeague?.numberOfTickets || 0) +
                                (thalesLpStatsLeague?.numberOfTickets || 0) +
                                (overLpStatsLeague?.numberOfTickets || 0) +
                                (cbbtcLpStatsLeague?.numberOfTickets || 0) +
                                (wbtcLpStatsLeague?.numberOfTickets || 0),
                            pnl:
                                (usdcLpStatsLeague?.pnl || 0) +
                                (wethLpStatsLeague?.pnl || 0) +
                                (thalesLpStatsLeague?.pnl || 0) +
                                (overLpStatsLeague?.pnl || 0) +
                                (cbbtcLpStatsLeague?.pnl || 0) +
                                (wbtcLpStatsLeague?.pnl || 0),
                            fees:
                                (usdcLpStatsLeague?.fees || 0) +
                                (wethLpStatsLeague?.fees || 0) +
                                (thalesLpStatsLeague?.fees || 0) +
                                (overLpStatsLeague?.fees || 0) +
                                (cbbtcLpStatsLeague?.fees || 0) +
                                (wbtcLpStatsLeague?.fees || 0),
                            pnlInUsd:
                                (usdcLpStatsLeague?.pnlInUsd || 0) +
                                (wethLpStatsLeague?.pnlInUsd || 0) +
                                (thalesLpStatsLeague?.pnlInUsd || 0) +
                                (overLpStatsLeague?.pnlInUsd || 0) +
                                (cbbtcLpStatsLeague?.pnlInUsd || 0) +
                                (wbtcLpStatsLeague?.pnlInUsd || 0),
                            feesInUsd:
                                (usdcLpStatsLeague?.feesInUsd || 0) +
                                (wethLpStatsLeague?.feesInUsd || 0) +
                                (thalesLpStatsLeague?.feesInUsd || 0) +
                                (overLpStatsLeague?.feesInUsd || 0) +
                                (cbbtcLpStatsLeague?.feesInUsd || 0) +
                                (wbtcLpStatsLeague?.feesInUsd || 0),
                        };

                        const lpStats = [usdcLpStatsLeague, wethLpStatsLeague, overLpStatsLeague];
                        if (isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.THALES)) {
                            lpStats.push(thalesLpStatsLeague);
                        }
                        if (isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.cbBTC)) {
                            lpStats.push(cbbtcLpStatsLeague);
                        }
                        if (isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.wBTC)) {
                            lpStats.push(wbtcLpStatsLeague);
                        }
                        lpStats.push(totalLpStats);

                        lpStatsByLeague[Number(league)] = lpStats;
                    });

                    return lpStatsByLeague;
                }

                return {};
            } catch (e) {
                console.error('Error fetching LP PP stats by league:', e);
                return {};
            }
        },
        ...options,
    });
};

export default useLpPpStatsByLeagueQuery;

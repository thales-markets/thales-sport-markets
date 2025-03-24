import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
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
        name: name.toUpperCase(),
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
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<LpStats[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LpStats[]>({
        queryKey: QUERY_KEYS.Pnl.LpStats(round, leagueId, onlyPP, networkConfig.networkId),
        queryFn: async () => {
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
                // TODO hardcode OVER price
                exchangeRates['OVER'] = Number(thalesPriceResponse.data);

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

                const totalLpStats: LpStats = {
                    name: 'TOTAL',
                    numberOfTickets:
                        usdcLpStats.numberOfTickets +
                        wethLpStats.numberOfTickets +
                        thalesLpStats.numberOfTickets +
                        overLpStats.numberOfTickets +
                        cbbtcLpStats.numberOfTickets +
                        wbtcLpStats.numberOfTickets,
                    pnl:
                        usdcLpStats.pnlInUsd +
                        wethLpStats.pnlInUsd +
                        thalesLpStats.pnlInUsd +
                        overLpStats.pnlInUsd +
                        cbbtcLpStats.pnlInUsd +
                        wbtcLpStats.pnlInUsd,
                    fees:
                        usdcLpStats.feesInUsd +
                        wethLpStats.feesInUsd +
                        thalesLpStats.feesInUsd +
                        overLpStats.feesInUsd +
                        cbbtcLpStats.feesInUsd +
                        wbtcLpStats.feesInUsd,
                    pnlInUsd:
                        usdcLpStats.pnlInUsd +
                        wethLpStats.pnlInUsd +
                        thalesLpStats.pnlInUsd +
                        overLpStats.pnlInUsd +
                        cbbtcLpStats.pnlInUsd +
                        wbtcLpStats.pnlInUsd,
                    feesInUsd:
                        usdcLpStats.feesInUsd +
                        wethLpStats.feesInUsd +
                        thalesLpStats.feesInUsd +
                        overLpStats.feesInUsd +
                        cbbtcLpStats.feesInUsd +
                        wbtcLpStats.feesInUsd,
                };

                const lpStats = [usdcLpStats, wethLpStats, overLpStats];
                if (isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.THALES)) {
                    lpStats.push(thalesLpStats);
                }
                if (isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.cbBTC)) {
                    lpStats.push(cbbtcLpStats);
                }
                if (isLpAvailableForNetwork(networkConfig.networkId, LiquidityPoolCollateral.wBTC)) {
                    lpStats.push(wbtcLpStats);
                }
                lpStats.push(totalLpStats);

                return lpStats;
            }

            return [];
        },
        ...options,
    });
};

export default useLpStatsQuery;

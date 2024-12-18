import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { bigNumberFormatter, Coins, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { LpStats, Ticket } from 'types/markets';
import { NetworkConfig, SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getLpAddress } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { mapTicket } from 'utils/tickets';
import { League } from '../../enums/sports';

const getLpStats = async (
    tickets: string[],
    sportsAMMDataContract: ViemContract,
    networkId: SupportedNetwork,
    exchangeRates: Rates,
    leagueId: League,
    onlyPP: boolean
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
                    currencies,
                    rates,
                    thalesPriceResponse,
                ] = await Promise.all([
                    liquidityPoolDataContract.read.getRoundTickets([
                        getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.USDC),
                        round,
                    ]),
                    liquidityPoolDataContract.read.getRoundTickets([
                        getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.WETH),
                        round,
                    ]),
                    liquidityPoolDataContract.read.getRoundTickets([
                        getLpAddress(networkConfig.networkId, LiquidityPoolCollateral.THALES),
                        round,
                    ]),
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
                });
                exchangeRates['THALES'] = Number(thalesPriceResponse.data);

                const usdcLpStats = await getLpStats(
                    usdcTickets,
                    sportsAMMDataContract,
                    networkConfig.networkId,
                    exchangeRates,
                    leagueId,
                    onlyPP
                );
                const wethLpStats = await getLpStats(
                    wethTickets,
                    sportsAMMDataContract,
                    networkConfig.networkId,
                    exchangeRates,
                    leagueId,
                    onlyPP
                );
                const thalesLpStats = await getLpStats(
                    thalesTickets,
                    sportsAMMDataContract,
                    networkConfig.networkId,
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
        ...options,
    });
};

export default useLpStatsQuery;

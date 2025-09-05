import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'utils/clientTotp';
import { generalConfig, noCacheConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { League } from 'overtime-utils';
import { bigNumberFormatter, Coins, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { LpUsersPnl, Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getLpAddress, getRoundWithOffset, isLpAvailableForNetwork } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { mapTicket } from 'utils/tickets';

const FREE_BET_TICKETS_BATCH_SIZE = 500;

const useLpUsersPnlQuery = (
    lpCollateral: LiquidityPoolCollateral,
    round: number,
    leagueId: League,
    onlyPP: boolean,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<LpUsersPnl[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LpUsersPnl[]>({
        queryKey: QUERY_KEYS.Pnl.LpUsersPnl(lpCollateral, round, leagueId, onlyPP, networkConfig.networkId),
        queryFn: async () => {
            const sportsAMMDataContract = getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig);
            const liquidityPoolDataContract = getContractInstance(ContractType.LIQUIDITY_POOL_DATA, networkConfig);
            const priceFeedContract = getContractInstance(ContractType.PRICE_FEED, networkConfig);
            const freeBetContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);

            if (sportsAMMDataContract && liquidityPoolDataContract && priceFeedContract) {
                const [
                    lpTickets,
                    gamesInfoResponse,
                    playersInfoResponse,
                    liveScoresResponse,
                    currencies,
                    rates,
                    thalesPriceResponse,
                    overPriceResponse,
                ] = await Promise.all([
                    isLpAvailableForNetwork(networkConfig.networkId, lpCollateral)
                        ? liquidityPoolDataContract.read.getRoundTickets([
                              getLpAddress(networkConfig.networkId, lpCollateral),
                              getRoundWithOffset(round, networkConfig.networkId, lpCollateral),
                          ])
                        : [],
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
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

                const tickets = Array.isArray(lpTickets) ? lpTickets : [lpTickets];

                const numberOfBatches = Math.trunc(tickets.length / BATCH_SIZE) + 1;

                const promises = [];
                for (let i = 0; i < numberOfBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.read.getTicketsData([tickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)])
                    );
                }

                const promisesResult = await Promise.all(promises);
                const ticketsData = promisesResult.flat(1);

                const mappedTickets: Ticket[] = ticketsData.map((ticket: any) =>
                    mapTicket(
                        ticket,
                        networkConfig.networkId,
                        gamesInfoResponse.data,
                        playersInfoResponse.data,
                        liveScoresResponse.data
                    )
                );

                const freeBetTickets = mappedTickets.filter(
                    (ticket) => ticket.account.toLowerCase() === freeBetContract?.address.toLowerCase()
                );

                let freeBetPromises = [];
                const freeBetTicketsData: any = [];
                for (let i = 0; i < freeBetTickets.length; i++) {
                    freeBetPromises.push(freeBetContract?.read.ticketToUser([freeBetTickets[i].id]));
                    if ((i + 1) % FREE_BET_TICKETS_BATCH_SIZE == 0 || i == freeBetTickets.length - 1) {
                        const stakingPromisesResult = await Promise.all(freeBetPromises);
                        freeBetTicketsData.push(...stakingPromisesResult.flat(1));
                        freeBetPromises = [];
                    }
                }

                const mappedTicketsWithFreeBet: Ticket[] = mappedTickets.map((ticket: any) => {
                    let owner = ticket.account;
                    const freeBetUserIndex = freeBetTickets.findIndex(
                        (stakingTicket) => ticket.id.toLowerCase() === stakingTicket.id.toLowerCase()
                    );
                    if (freeBetUserIndex > -1) {
                        owner = freeBetTicketsData[freeBetUserIndex];
                    }

                    return {
                        ...ticket,
                        account: owner,
                    };
                });

                const finalTickets: Ticket[] = orderBy(
                    updateTotalQuoteAndPayout(mappedTicketsWithFreeBet).filter(
                        (ticket) =>
                            ((ticket.sportMarkets.length === 1 &&
                                ticket.sportMarkets[0].leagueId === leagueId &&
                                !!leagueId) ||
                                !leagueId) &&
                            ((ticket.sportMarkets.length === 1 &&
                                ticket.sportMarkets[0].isPlayerPropsMarket &&
                                !!onlyPP) ||
                                !onlyPP)
                    ),
                    ['timestamp'],
                    ['desc']
                );

                let collateral = '' as Coins;
                const usersPnl: Record<string, LpUsersPnl> = {};
                finalTickets.forEach((ticket) => {
                    collateral = ticket.collateral;
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
                const convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

                lpUsersPnl.forEach((pnl) => {
                    pnl.pnlInUsd = convertAmount ? pnl.pnl * exchangeRates[collateral] : pnl.pnl;
                });

                lpUsersPnl = orderBy(lpUsersPnl, ['pnl'], ['desc']);

                return lpUsersPnl;
            }

            return [];
        },
        ...options,
    });
};

export default useLpUsersPnlQuery;

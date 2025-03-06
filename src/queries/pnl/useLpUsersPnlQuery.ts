import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { bigNumberFormatter, Coins, NetworkId, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { LpUsersPnl, Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getLpAddress, getRoundWithOffset, isLpAvailableForNetwork } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { mapTicket } from 'utils/tickets';
import { League } from '../../enums/sports';

const STAKING_TICKETS_BATCH_SIZE = 500;

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
            const stakingThalesBettingProxy = getContractInstance(
                ContractType.STAKING_THALES_BETTING_PROXY,
                networkConfig
            );

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

                const stakingTickets =
                    networkConfig.networkId === NetworkId.Base
                        ? []
                        : mappedTickets.filter(
                              (ticket) =>
                                  ticket.account.toLowerCase() === stakingThalesBettingProxy?.address.toLowerCase()
                          );

                let stakingPromises = [];
                const stakingTicketsData: any = [];
                for (let i = 0; i < stakingTickets.length; i++) {
                    stakingPromises.push(stakingThalesBettingProxy?.read.ticketToUser([stakingTickets[i].id]));
                    if ((i + 1) % STAKING_TICKETS_BATCH_SIZE == 0 || i == stakingTickets.length - 1) {
                        const stakingPromisesResult = await Promise.all(stakingPromises);
                        stakingTicketsData.push(...stakingPromisesResult.flat(1));
                        stakingPromises = [];
                    }
                }

                const mappedTicketsWithStaking: Ticket[] = mappedTickets.map((ticket: any) => {
                    let owner = ticket.account;
                    const stakingUserIndex = stakingTickets.findIndex(
                        (stakingTicket) => ticket.id.toLowerCase() === stakingTicket.id.toLowerCase()
                    );
                    if (stakingUserIndex > -1) {
                        owner = stakingTicketsData[stakingUserIndex];
                    }

                    return {
                        ...ticket,
                        account: owner,
                    };
                });

                const finalTickets: Ticket[] = orderBy(
                    updateTotalQuoteAndPayout(mappedTicketsWithStaking).filter(
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
        ...options,
    });
};

export default useLpUsersPnlQuery;

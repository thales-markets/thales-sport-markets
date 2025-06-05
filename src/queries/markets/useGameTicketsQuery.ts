import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { groupBy, orderBy } from 'lodash';
import { bigNumberFormatter, Coins, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { GameData, GameStats, MarketStats, PositionStats, Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import { mapTicket } from 'utils/tickets';

export const useGameTicketsQuery = (
    gameId: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<GameData | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GameData | undefined>({
        queryKey: QUERY_KEYS.GameTickets(networkConfig.networkId, gameId),
        queryFn: async () => {
            try {
                const contractInstances = [
                    getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig),
                    getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, networkConfig),
                ] as ViemContract[];
                const priceFeedContract = getContractInstance(ContractType.PRICE_FEED, networkConfig);

                const [sportsAMMDataContract, sportsAMMV2ManagerContract] = contractInstances;

                if (sportsAMMDataContract && sportsAMMV2ManagerContract && priceFeedContract) {
                    const numOfActiveTicketsPerGame = await sportsAMMV2ManagerContract.read.numOfTicketsPerGame([
                        gameId,
                    ]);
                    const numberOfActiveBatches = Math.trunc(Number(numOfActiveTicketsPerGame) / BATCH_SIZE) + 1;

                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(networkConfig.networkId)}`;

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.read.getTicketsDataPerGame([gameId, i * BATCH_SIZE, BATCH_SIZE])
                        );
                    }
                    promises.push(axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig));
                    promises.push(
                        axios.get(
                            `${generalConfig.API_URL}/overtime-v2/players-info?${playersInfoQueryParam}`,
                            noCacheConfig
                        )
                    );
                    promises.push(axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig));
                    promises.push(priceFeedContract.read.getCurrencies());
                    promises.push(priceFeedContract.read.getRates());
                    promises.push(axios.get(`${generalConfig.API_URL}/token/price`));
                    promises.push(axios.get(`${generalConfig.API_URL}/over-token/price`));

                    const promisesResult = await Promise.all(promises);
                    const promisesLength = promises.length;

                    const tickets = promisesResult.slice(0, promisesLength - 7).flat(1);
                    const gamesInfoResponse = promisesResult[promisesLength - 7];
                    const playersInfoResponse = promisesResult[promisesLength - 6];
                    const liveScoresResponse = promisesResult[promisesLength - 5];
                    const currencies = promisesResult[promisesLength - 4];
                    const rates = promisesResult[promisesLength - 3];
                    const thalesPriceResponse = promisesResult[promisesLength - 2];
                    const overPriceResponse = promisesResult[promisesLength - 1];

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

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                        mapTicket(
                            ticket,
                            networkConfig.networkId,
                            gamesInfoResponse.data,
                            playersInfoResponse.data,
                            liveScoresResponse.data
                        )
                    );

                    const mappedTicketsByMarket = groupBy(
                        mappedTickets.filter((ticket) => ticket.sportMarkets.length === 1),
                        (ticket: any) =>
                            `${ticket.sportMarkets[0].type}-${ticket.sportMarkets[0].line}-${ticket.sportMarkets[0].playerProps.playerId}`
                    );

                    const gameStats: GameStats = {
                        totalValume: 0,
                        marketsStats: [],
                    };

                    Object.keys(mappedTicketsByMarket).forEach((id: string) => {
                        const mappedMarketTickets = mappedTicketsByMarket[id];
                        const market = mappedMarketTickets[0].sportMarkets[0];
                        const marketStats: MarketStats = {
                            id,
                            market,
                            positionStats: [],
                            totalBuyIn: 0,
                        };

                        const mappedTicketsByPosition = groupBy(
                            mappedMarketTickets,
                            (ticket: any) => ticket.sportMarkets[0].position
                        );

                        Object.keys(mappedTicketsByPosition).forEach((position) => {
                            let buyIn = 0;
                            let risk = 0;
                            let convertAmount = false;
                            let collateral = '' as Coins;

                            const ticketsByPosition = mappedTicketsByPosition[position];
                            const positionMarket = ticketsByPosition[0].sportMarkets[0];

                            for (let index = 0; index < ticketsByPosition.length; index++) {
                                const ticket = ticketsByPosition[index];
                                collateral = ticket.collateral === 'sTHALES' ? 'THALES' : ticket.collateral;
                                convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

                                buyIn += convertAmount
                                    ? exchangeRates[collateral] * ticket.buyInAmount
                                    : ticket.buyInAmount;
                                risk += convertAmount
                                    ? exchangeRates[collateral] * (ticket.payout - ticket.buyInAmount + ticket.fees)
                                    : ticket.payout - ticket.buyInAmount + ticket.fees;
                            }

                            const positionStats: PositionStats = {
                                position: Number(position),
                                buyIn,
                                risk,
                                pnlIfWin: 0,
                                isWinning: !!positionMarket.isWinning,
                                isResolved: !!positionMarket.isResolved,
                            };

                            marketStats.positionStats.push(positionStats);
                            marketStats.totalBuyIn += buyIn;
                        });

                        marketStats.positionStats.forEach((stats) => {
                            stats.pnlIfWin = marketStats.totalBuyIn - stats.buyIn - stats.risk;
                        });

                        gameStats.marketsStats.push(marketStats);
                        gameStats.totalValume += marketStats.totalBuyIn;
                    });

                    return {
                        tickets: orderBy(updateTotalQuoteAndPayout(mappedTickets), ['timestamp'], ['desc']),
                        gameStats,
                    };
                }
                return undefined;
            } catch (e) {
                console.log('E ', e);
            }
        },
        ...options,
    });
};

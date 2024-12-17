import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { orderBy } from 'lodash';
import { bigNumberFormatter, parseBytes32String } from 'thales-utils';
import { Rates } from 'types/collateral';
import { Ticket, UserStats } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { isLpSupported, isStableCurrency } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { mapTicket } from 'utils/tickets';

const useUsersStatsV2Query = (
    user: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserStats | undefined>({
        queryKey: QUERY_KEYS.Wallet.StatsV2(networkConfig.networkId, user),
        queryFn: async () => {
            const sportsAMMDataContract = getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig);
            const priceFeedContract = getContractInstance(ContractType.PRICE_FEED, networkConfig);
            const sportsAMMV2ManagerContract = getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, networkConfig);
            const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);
            const stakingThalesBettingProxy = getContractInstance(
                ContractType.STAKING_THALES_BETTING_PROXY,
                networkConfig
            );

            if (
                sportsAMMDataContract &&
                priceFeedContract &&
                sportsAMMV2ManagerContract &&
                freeBetHolderContract &&
                stakingThalesBettingProxy
            ) {
                const [
                    numOfActiveTicketsPerUser,
                    numOfResolvedTicketsPerUser,
                    numOfActiveFreeBetTicketsPerUser,
                    numOfResolvedFreeBetTicketsPerUser,
                    numOfActiveStakedThalesTicketsPerUser,
                    numOfResolvedStakedThalesTicketsPerUser,
                ] = await Promise.all([
                    sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([user]),
                    sportsAMMV2ManagerContract.read.numOfResolvedTicketsPerUser([user]),
                    freeBetHolderContract.read.numOfActiveTicketsPerUser([user]),
                    freeBetHolderContract.read.numOfResolvedTicketsPerUser([user]),
                    stakingThalesBettingProxy.read.numOfActiveTicketsPerUser([user]),
                    stakingThalesBettingProxy.read.numOfResolvedTicketsPerUser([user]),
                ]);

                const numberOfActiveBatches =
                    Math.trunc(
                        (Number(numOfActiveTicketsPerUser) > Number(numOfActiveFreeBetTicketsPerUser) &&
                        Number(numOfActiveTicketsPerUser) > Number(numOfActiveStakedThalesTicketsPerUser)
                            ? Number(numOfActiveTicketsPerUser)
                            : Number(numOfActiveFreeBetTicketsPerUser) > Number(numOfActiveStakedThalesTicketsPerUser)
                            ? Number(numOfActiveFreeBetTicketsPerUser)
                            : Number(numOfActiveStakedThalesTicketsPerUser)) / BATCH_SIZE
                    ) + 1;
                const numberOfResolvedBatches =
                    Math.trunc(
                        (Number(numOfResolvedTicketsPerUser) > Number(numOfResolvedFreeBetTicketsPerUser) &&
                        Number(numOfResolvedTicketsPerUser) > Number(numOfResolvedStakedThalesTicketsPerUser)
                            ? Number(numOfResolvedTicketsPerUser)
                            : Number(numOfResolvedFreeBetTicketsPerUser) >
                              Number(numOfResolvedStakedThalesTicketsPerUser)
                            ? Number(numOfResolvedFreeBetTicketsPerUser)
                            : Number(numOfResolvedStakedThalesTicketsPerUser)) / BATCH_SIZE
                    ) + 1;

                const promises = [];
                for (let i = 0; i < numberOfActiveBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.read.getActiveTicketsDataPerUser([user, i * BATCH_SIZE, BATCH_SIZE])
                    );
                }
                for (let i = 0; i < numberOfResolvedBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.read.getResolvedTicketsDataPerUser([user, i * BATCH_SIZE, BATCH_SIZE])
                    );
                }
                promises.push(priceFeedContract.read.getCurrencies());
                promises.push(priceFeedContract.read.getRates());
                promises.push(axios.get(`${generalConfig.API_URL}/token/price`));

                const promisesResult = await Promise.all(promises);
                const promisesLength = promises.length;

                const tickets = promisesResult
                    .slice(0, promisesLength - 3)
                    .map((allData) => [
                        ...allData.ticketsData,
                        ...allData.freeBetsData,
                        ...allData.stakingBettingProxyData,
                    ])
                    .flat(1);

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
                exchangeRates['sTHALES'] = Number(thalesPriceResponse.data);

                let volume = 0;
                let highestWin = 0;
                let lifetimeWins = 0;

                let pnl = 0;

                const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                    mapTicket(ticket, networkConfig.networkId, [], [], [])
                );

                const finalTickets: Ticket[] = orderBy(
                    updateTotalQuoteAndPayout(mappedTickets),
                    ['timestamp'],
                    ['desc']
                );

                for (let index = 0; index < finalTickets.length; index++) {
                    const ticket = finalTickets[index];
                    const collateral = ticket.collateral;
                    const convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

                    const buyInAmountInUsd = convertAmount
                        ? ticket.buyInAmount * exchangeRates[collateral]
                        : ticket.buyInAmount;
                    const payoutInUsd = convertAmount ? ticket.payout * exchangeRates[collateral] : ticket.payout;

                    volume += buyInAmountInUsd;
                    if (ticket.isUserTheWinner && payoutInUsd > highestWin && !ticket.isCancelled) {
                        highestWin = payoutInUsd;
                    }
                    if (ticket.isUserTheWinner && !ticket.isCancelled) {
                        lifetimeWins += 1;
                        pnl += payoutInUsd - buyInAmountInUsd;
                    }
                    if (ticket.isLost && !ticket.isCancelled && !ticket.isFreeBet) {
                        pnl -= buyInAmountInUsd;
                    }
                }

                return {
                    id: user,
                    volume,
                    trades: tickets.length,
                    highestWin,
                    lifetimeWins,
                    pnl,
                };
            }

            return undefined;
        },
        ...options,
    });
};

export default useUsersStatsV2Query;

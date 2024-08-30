import axios from 'axios';
import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { Contract } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, coinFormatter, Coins, parseBytes32String } from 'thales-utils';
import { LpStats } from 'types/markets';
import { getCollateralByAddress, isLpSupported, isStableCurrency } from 'utils/collaterals';
import networkConnector from 'utils/networkConnector';
import { LiquidityPoolCollateral } from '../../enums/liquidityPool';
import { SupportedNetwork } from '../../types/network';
import { getLpAddress } from '../../utils/liquidityPool';
import { Rates } from '../rates/useExchangeRatesQuery';

const getLpStats = async (
    tickets: string[],
    sportsAMMDataContract: Contract,
    networkId: SupportedNetwork,
    exchangeRates: Rates
) => {
    const numberOfBatches = Math.trunc(tickets.length / BATCH_SIZE) + 1;

    const promises = [];
    for (let i = 0; i < numberOfBatches; i++) {
        promises.push(sportsAMMDataContract.getTicketsData(tickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)));
    }

    const promisesResult = await Promise.all(promises);
    const ticketsData = promisesResult.flat(1);

    let pnl = 0;
    let convertAmount = false;
    let collateral = '' as Coins;
    for (let index = 0; index < ticketsData.length; index++) {
        const ticket = ticketsData[index];
        collateral = getCollateralByAddress(ticket.collateral, networkId);
        convertAmount = isLpSupported(collateral) && !isStableCurrency(collateral);

        const buyInAmount = coinFormatter(ticket.buyInAmount, networkId, collateral);
        const fees = coinFormatter(ticket.fees, networkId, collateral);
        const totalQuote = bigNumberFormatter(ticket.totalQuote);
        const payout = buyInAmount / totalQuote;

        if (ticket.isUserTheWinner) {
            pnl -= payout + fees - buyInAmount;
        }
        if (ticket.isLost) {
            pnl += buyInAmount - fees;
        }
    }

    const lpStats: LpStats = {
        name: collateral.toUpperCase(),
        numberOfTickets: tickets.length,
        pnl,
        pnlInUsd: convertAmount ? pnl * exchangeRates[collateral] : pnl,
    };

    return lpStats;
};

const useLpStatsV2Query = (networkId: SupportedNetwork, options?: UseQueryOptions<LpStats[]>) => {
    return useQuery<LpStats[]>(
        QUERY_KEYS.Wallet.LpStatsV2(networkId),
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
                    liquidityPoolDataContract.getCurrentRoundTickets(
                        getLpAddress(networkId, LiquidityPoolCollateral.USDC)
                    ),
                    liquidityPoolDataContract.getCurrentRoundTickets(
                        getLpAddress(networkId, LiquidityPoolCollateral.WETH)
                    ),
                    liquidityPoolDataContract.getCurrentRoundTickets(
                        getLpAddress(networkId, LiquidityPoolCollateral.THALES)
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

                const usdcLpStats = await getLpStats(usdcTickets, sportsAMMDataContract, networkId, exchangeRates);
                const wethLpStats = await getLpStats(wethTickets, sportsAMMDataContract, networkId, exchangeRates);
                const thalesLpStats = await getLpStats(thalesTickets, sportsAMMDataContract, networkId, exchangeRates);

                const lpStats: LpStats = {
                    name: 'TOTAL',
                    numberOfTickets:
                        usdcLpStats.numberOfTickets + wethLpStats.numberOfTickets + thalesLpStats.numberOfTickets,
                    pnl: usdcLpStats.pnlInUsd + wethLpStats.pnlInUsd + thalesLpStats.pnlInUsd,
                    pnlInUsd: usdcLpStats.pnlInUsd + wethLpStats.pnlInUsd + thalesLpStats.pnlInUsd,
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

export default useLpStatsV2Query;

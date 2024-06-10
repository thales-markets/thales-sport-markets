import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Position } from 'enums/markets';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { MarketTransaction, ParlayMarket, WinningInfo } from 'types/markets';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    isParlayClaimable,
    updateTotalQuoteAndAmountFromContract,
} from 'utils/markets';

const useWinningInfoQuery = (walletAddress: string, networkId: Network, options?: UseQueryOptions<WinningInfo>) => {
    return useQuery<WinningInfo>(
        QUERY_KEYS.WinningInfo(walletAddress, networkId),
        async () => {
            try {
                const [marketTransactionsRequest, parlayMarketsRequest] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/${API_ROUTES.Transactions}/${networkId}?account=${walletAddress}`
                    ),
                    axios.get(`${generalConfig.API_URL}/${API_ROUTES.Parlays}/${networkId}?account=${walletAddress}`),
                ]);

                const marketTransactions = marketTransactionsRequest?.data ? marketTransactionsRequest.data : [];
                const parlayMarkets = parlayMarketsRequest?.data ? parlayMarketsRequest.data : [];

                const allSinglesWinningAmounts = marketTransactions
                    .map((tx: MarketTransaction) => ({
                        ...tx,
                        position: Position[tx.position],
                    }))
                    .filter(
                        (tx: any) =>
                            convertPositionNameToPosition(tx.position) ===
                                convertFinalResultToResultType(tx.wholeMarket.finalResult) && tx.type === 'buy'
                    )
                    .map((tx: MarketTransaction) => tx.amount);

                const highestWinningSingle =
                    allSinglesWinningAmounts.length > 0 ? Math.max(...allSinglesWinningAmounts) : 0;

                const allParlaysWinningAmounts = updateTotalQuoteAndAmountFromContract(parlayMarkets)
                    .filter((parlayMarket: ParlayMarket) => parlayMarket.won || isParlayClaimable(parlayMarket))
                    .map((parlayMarket: ParlayMarket) => parlayMarket.totalAmount);

                const highestWinningParlay =
                    allParlaysWinningAmounts.length > 0 ? Math.max(...allParlaysWinningAmounts) : 0;

                const highestWin =
                    highestWinningSingle > highestWinningParlay ? highestWinningSingle : highestWinningParlay;

                return {
                    highestWin: highestWin,
                    lifetimeWins: allSinglesWinningAmounts.length + allParlaysWinningAmounts.length,
                };
            } catch (e) {
                console.log(e);
                return { highestWin: 0, lifetimeWins: 0 };
            }
        },
        {
            ...options,
        }
    );
};

export default useWinningInfoQuery;

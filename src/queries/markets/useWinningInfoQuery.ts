import { Position } from 'constants/options';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { MarketTransaction, ParlayMarket, WinningInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import {
    convertPositionNameToPosition,
    convertFinalResultToResultType,
    updateTotalQuoteAndAmountFromContract,
    isParlayClaimable,
} from 'utils/markets';

const useWinningInfoQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<WinningInfo>) => {
    return useQuery<WinningInfo>(
        QUERY_KEYS.WinningInfo(walletAddress, networkId),
        async () => {
            try {
                const marketTransactions = await thalesData.sportMarkets.marketTransactions({
                    account: walletAddress,
                    network: networkId,
                });

                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    account: walletAddress,
                    network: networkId,
                });

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
                const highestWinningSingle = Math.max(...allSinglesWinningAmounts);

                const allParlaysWinningAmounts = updateTotalQuoteAndAmountFromContract(parlayMarkets)
                    .filter((parlayMarket: ParlayMarket) => parlayMarket.won || isParlayClaimable(parlayMarket))
                    .map((parlayMarket: ParlayMarket) => parlayMarket.totalAmount);

                const highestWinningParlay = Math.max(...allParlaysWinningAmounts);
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
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useWinningInfoQuery;

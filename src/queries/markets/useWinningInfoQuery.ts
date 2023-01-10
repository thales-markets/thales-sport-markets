import { Position } from 'constants/options';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { MarketTransaction, ParlayMarket, WinningInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    isParlayClaimable,
    updateTotalQuoteAndAmountFromContract,
} from 'utils/markets';

const useWinningInfoQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<WinningInfo>) => {
    return useQuery<WinningInfo>(
        QUERY_KEYS.WinningInfo(walletAddress, networkId),
        async () => {
            try {
                const [marketTransactions, parlayMarkets] = await Promise.all([
                    thalesData.sportMarkets.marketTransactions({
                        account: walletAddress,
                        network: networkId,
                    }),
                    thalesData.sportMarkets.parlayMarkets({
                        account: walletAddress,
                        network: networkId,
                    }),
                ]);

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
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useWinningInfoQuery;

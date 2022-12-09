import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ParlayMarket, PositionBalance } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import { isParlayClaimable, isSportMarketExpired } from 'utils/markets';

const useClaimablePositionCountQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<number | null>
) => {
    return useQuery<number | null>(
        QUERY_KEYS.ClaimableCount(walletAddress, networkId),
        async () => {
            try {
                if (!walletAddress) return null;

                const positionBalances: PositionBalance[] = thalesData.sportMarkets.positionBalances({
                    account: walletAddress,
                    network: networkId,
                    onlyClaimable: true,
                });

                const parlayMarkets = thalesData.sportMarkets.parlayMarkets({
                    account: walletAddress,
                    network: networkId,
                });

                const [positionBalanceData, parlayMarketsData] = await Promise.all([positionBalances, parlayMarkets]);

                const onlyNonZeroPositions: PositionBalance[] = positionBalanceData.filter(
                    (positionBalance) =>
                        positionBalance.amount > 0 && !isSportMarketExpired(positionBalance.position.market)
                );

                const onlyClaimableParlays = parlayMarketsData.filter((parlayMarket: ParlayMarket) => {
                    if (isParlayClaimable(parlayMarket)) {
                        return parlayMarket;
                    }
                });

                return Number(onlyNonZeroPositions.length + onlyClaimableParlays.length);
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useClaimablePositionCountQuery;

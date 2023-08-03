import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ParlayMarket, PositionBalance } from 'types/markets';
import thalesData from 'thales-data';
import { Network } from 'enums/network';
import { isParlayClaimable, isSportMarketExpired } from 'utils/markets';

const useClaimablePositionCountQuery = (
    walletAddress: string,
    networkId: Network,
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
                    isClaimable: true,
                    isClaimed: false,
                });

                const parlayMarkets = thalesData.sportMarkets.parlayMarkets({
                    account: walletAddress,
                    network: networkId,
                });

                const [positionBalanceData, parlayMarketsData] = await Promise.all([positionBalances, parlayMarkets]);

                const onlyNonExpiredPositions: PositionBalance[] = positionBalanceData.filter(
                    (positionBalance) => !isSportMarketExpired(positionBalance.position.market)
                );

                const onlyClaimableParlays = parlayMarketsData.filter((parlayMarket: ParlayMarket) => {
                    if (isParlayClaimable(parlayMarket)) {
                        return parlayMarket;
                    }
                });

                return Number(onlyNonExpiredPositions.length + onlyClaimableParlays.length);
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        {
            ...options,
        }
    );
};

export default useClaimablePositionCountQuery;

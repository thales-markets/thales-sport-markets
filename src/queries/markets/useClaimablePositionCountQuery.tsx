import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket, PositionBalance } from 'types/markets';
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
                const positionBalanceRequest = axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.PositionBalance}/${networkId}?account=${walletAddress}&filter=claimable`
                );
                const parlaysRequest = axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.Parlays}/${networkId}?account=${walletAddress}`
                );

                const [positionBalanceResponse, parlayMarketsResponse] = await Promise.all([
                    positionBalanceRequest,
                    parlaysRequest,
                ]);

                const positionBalanceData: PositionBalance[] = positionBalanceResponse?.data
                    ? positionBalanceResponse.data
                    : [];
                const parlayMarketsData = parlayMarketsResponse?.data ? parlayMarketsResponse.data : [];

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

import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
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
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.PositionBalance}/${networkId}?account=${walletAddress}&filter=claimable`
                );

                const positionBalances: PositionBalance[] = response?.data ? response.data : [];

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

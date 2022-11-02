import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ParlayMarket, PositionBalance } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import { isParlayClaimable } from 'utils/markets';

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
                    (positionBalance) => positionBalance.amount > 0
                );

                console.log('positionBalanceData ', positionBalanceData);
                console.log('parlayMarketsData ', parlayMarketsData);
                console.log('onlyNonZeroPositions ', onlyNonZeroPositions);

                const onlyClaimableParlays = parlayMarketsData.filter((parlayMarket: ParlayMarket) => {
                    if (isParlayClaimable(parlayMarket)) {
                        return parlayMarket;
                    }
                });

                console.log('onlyClaimableParlays ', onlyClaimableParlays?.length);
                return Number(onlyNonZeroPositions.length + onlyClaimableParlays.length);
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

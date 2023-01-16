import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { PositionBalance, PositionType, SportMarketInfo } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { fixApexName, fixDuplicatedTeamName } from 'utils/formatters/string';

export type AccountPositionProfile = {
    sUSDPaid: number;
    id: string;
    account: string;
    amount: number;
    claimable: boolean;
    open: boolean;
    market: SportMarketInfo;
    side: PositionType;
};

const useAccountMarketsQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<AccountPositionProfile[]>
) => {
    return useQuery<AccountPositionProfile[]>(
        QUERY_KEYS.AccountPositionsProfile(walletAddress, networkId),
        async () => {
            try {
                const positionBalances: PositionBalance[] = await thalesData.sportMarkets.positionBalances({
                    account: walletAddress,
                    network: networkId,
                });

                const onlyNonZeroPositions: PositionBalance[] = positionBalances.filter(
                    (positionBalance) => positionBalance.amount > 0
                );

                const positions: AccountPositionProfile[] = onlyNonZeroPositions.map((position) => {
                    return {
                        id: position.id,
                        account: position.account,
                        amount: bigNumberFormatter(position.amount),
                        claimable: position.position.claimable,
                        open: !position.position.market.isCanceled && !position.position.market.isResolved,
                        market: {
                            ...position.position.market,
                            homeTeam: position.position.market.isApex
                                ? fixApexName(position.position.market.homeTeam)
                                : fixDuplicatedTeamName(position.position.market?.homeTeam),
                            awayTeam: position.position.market.isApex
                                ? fixApexName(position.position.market.awayTeam)
                                : fixDuplicatedTeamName(position.position.market?.awayTeam),
                            spread: Number(position.position.market.spread),
                            total: Number(position.position.market.total),
                        },
                        side: position.position.side,
                        sUSDPaid: position.sUSDPaid,
                    };
                });

                return positions;
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useAccountMarketsQuery;

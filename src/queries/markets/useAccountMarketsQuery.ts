import QUERY_KEYS from 'constants/queryKeys';
import { ENETPULSE_SPORTS, GOLF_TOURNAMENT_WINNER_TAG, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP } from 'constants/tags';
import { PositionName } from 'enums/markets';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { PositionBalance, SportMarketInfo } from 'types/markets';
import { Network } from 'enums/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';

export type AccountPositionProfile = {
    sUSDPaid: number;
    id: string;
    account: string;
    amount: number;
    claimable: boolean;
    open: boolean;
    market: SportMarketInfo;
    side: PositionName;
};

const useAccountMarketsQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<AccountPositionProfile[]>
) => {
    return useQuery<AccountPositionProfile[]>(
        QUERY_KEYS.AccountPositions(walletAddress, networkId),
        async () => {
            try {
                const positionBalances: PositionBalance[] = await thalesData.sportMarkets.positionBalances({
                    account: walletAddress,
                    network: networkId,
                    isClaimed: false,
                });

                const positions: AccountPositionProfile[] = positionBalances.map((position) => {
                    const isOneSideMarket =
                        (SPORTS_TAGS_MAP['Motosport'].includes(Number(position.position.market.tags[0])) &&
                            ENETPULSE_SPORTS.includes(Number(position.position.market.tags[0]))) ||
                        (Number(position.position.market.tags[0]) == GOLF_TOURNAMENT_WINNER_TAG &&
                            JSON_ODDS_SPORTS.includes(Number(position.position.market.tags[0])));
                    return {
                        id: position.id,
                        account: position.account,
                        amount: bigNumberFormatter(position.amount),
                        claimable: position.position.claimable,
                        open: !position.position.market.isCanceled && !position.position.market.isResolved,
                        market: {
                            ...position.position.market,
                            homeTeam: position.position.market.homeTeam,
                            awayTeam: position.position.market.awayTeam,
                            spread: Number(position.position.market.spread),
                            total: Number(position.position.market.total),
                            isOneSideMarket: isOneSideMarket,
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
            ...options,
        }
    );
};

export default useAccountMarketsQuery;

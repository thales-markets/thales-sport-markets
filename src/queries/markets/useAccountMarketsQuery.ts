import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { ENETPULSE_SPORTS } from 'constants/tags';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter } from 'thales-utils';
import { AccountPositionProfile, PositionBalance } from 'types/markets';
import { fixDuplicatedTeamName } from 'utils/formatters/string';
import { getIsOneSideMarket } from '../../utils/markets';

const useAccountMarketsQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<AccountPositionProfile[]>
) => {
    return useQuery<AccountPositionProfile[]>(
        QUERY_KEYS.AccountPositions(walletAddress, networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.PositionBalance}/${networkId}?account=${walletAddress}`
                );

                const positionBalances: PositionBalance[] = response?.data ? response.data : [];

                const positions: AccountPositionProfile[] = positionBalances.map((position) => {
                    return {
                        id: position.id,
                        account: position.account,
                        amount: bigNumberFormatter(position.amount),
                        claimable: position.position.claimable,
                        open: !position.position.market.isCanceled && !position.position.market.isResolved,
                        market: {
                            ...position.position.market,
                            homeTeam: fixDuplicatedTeamName(
                                position.position.market.homeTeam,
                                ENETPULSE_SPORTS.includes(Number(position.position.market.tags[0]))
                            ),
                            awayTeam: fixDuplicatedTeamName(
                                position.position.market.awayTeam,
                                ENETPULSE_SPORTS.includes(Number(position.position.market.tags[0]))
                            ),
                            spread: Number(position.position.market.spread),
                            total: Number(position.position.market.total),
                            isOneSideMarket: getIsOneSideMarket(Number(position.position.market.tags[0])),
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

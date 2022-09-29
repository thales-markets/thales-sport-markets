import { useQuery, UseQueryOptions } from 'react-query';
import { Position, Side } from '../../constants/options';
import { AvailablePerSide } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';

const useAvailablePerSideQuery = (marketAddress: string, side: Side, options?: UseQueryOptions<AvailablePerSide>) => {
    return useQuery<AvailablePerSide>(
        QUERY_KEYS.AvailablePerSide(marketAddress, side),
        async () => {
            const sportsAMMContract = networkConnector.sportsAMMContract;

            if (side === Side.BUY) {
                const [availableToBuyHome, availableToBuyAway, availableToBuyDraw] = await Promise.all([
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.HOME),
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.AWAY),
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.DRAW),
                ]);
                return {
                    positions: {
                        [Position.HOME]: {
                            available: bigNumberFormatter(availableToBuyHome),
                        },
                        [Position.AWAY]: {
                            available: bigNumberFormatter(availableToBuyAway),
                        },
                        [Position.DRAW]: {
                            available: bigNumberFormatter(availableToBuyDraw),
                        },
                    },
                };
            } else {
                const [availableToBSellHome, availableToBSellAway, availableToBSellDraw] = await Promise.all([
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, Position.HOME),
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, Position.AWAY),
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, Position.DRAW),
                ]);
                return {
                    positions: {
                        [Position.HOME]: {
                            available: bigNumberFormatter(availableToBSellHome),
                        },
                        [Position.AWAY]: {
                            available: bigNumberFormatter(availableToBSellAway),
                        },
                        [Position.DRAW]: {
                            available: bigNumberFormatter(availableToBSellDraw),
                        },
                    },
                };
            }
        },
        {
            ...options,
        }
    );
};

export default useAvailablePerSideQuery;

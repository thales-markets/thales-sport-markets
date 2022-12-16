import { useQuery, UseQueryOptions } from 'react-query';
import { Position, Side } from '../../constants/options';
import { AvailablePerSide } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { ethers } from 'ethers';

const useAvailablePerSideQuery = (marketAddress: string, side: Side, options?: UseQueryOptions<AvailablePerSide>) => {
    return useQuery<AvailablePerSide>(
        QUERY_KEYS.AvailablePerSide(marketAddress, side),
        async () => {
            const sportsAMMContract = networkConnector.sportsAMMContract;

            if (side === Side.BUY) {
                const [
                    availableToBuyHome,
                    availableToBuyAway,
                    availableToBuyDraw,
                    homePositionPriceImpact,
                    awayPositionPriceImpact,
                    drawPositionPriceImpact,
                ] = await Promise.all([
                    sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.HOME),
                    sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.AWAY),
                    sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.DRAW),
                    sportsAMMContract?.buyPriceImpact(marketAddress, Position.HOME, ethers.utils.parseEther('1')),
                    sportsAMMContract?.buyPriceImpact(marketAddress, Position.AWAY, ethers.utils.parseEther('1')),
                    sportsAMMContract?.buyPriceImpact(marketAddress, Position.DRAW, ethers.utils.parseEther('1')),
                ]);
                return {
                    positions: {
                        [Position.HOME]: {
                            available: bigNumberFormatter(availableToBuyHome),
                            buyImpactPrice: bigNumberFormatter(homePositionPriceImpact),
                        },
                        [Position.AWAY]: {
                            available: bigNumberFormatter(availableToBuyAway),
                            buyImpactPrice: bigNumberFormatter(awayPositionPriceImpact),
                        },
                        [Position.DRAW]: {
                            available: bigNumberFormatter(availableToBuyDraw),
                            buyImpactPrice: bigNumberFormatter(drawPositionPriceImpact),
                        },
                    },
                };
            } else {
                const [availableToBSellHome, availableToBSellAway, availableToBSellDraw] = await Promise.all([
                    sportsAMMContract?.availableToSellToAMM(marketAddress, Position.HOME),
                    sportsAMMContract?.availableToSellToAMM(marketAddress, Position.AWAY),
                    sportsAMMContract?.availableToSellToAMM(marketAddress, Position.DRAW),
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

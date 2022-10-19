import { useQuery } from 'react-query';
import { Position, Side } from '../../constants/options';
import { AvailablePerSide } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { ethers } from 'ethers';

const useAvailablePerSideQuery = (marketAddress: string, side: Side) => {
    return useQuery<AvailablePerSide>(QUERY_KEYS.AvailablePerSide(marketAddress, side), async () => {
        const sportsAMMContract = networkConnector.sportsAMMContract;

        if (side === Side.BUY) {
            const [
                availableToBuyHome,
                availableToBuyAway,
                availableToBuyDraw,
                buyImpactHome,
                buyImpactAway,
                buyImpactDraw,
            ] = await Promise.all([
                await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.HOME),
                await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.AWAY),
                await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.DRAW),
                await sportsAMMContract?.buyPriceImpact(marketAddress, Position.HOME, ethers.utils.parseEther('1')),
                await sportsAMMContract?.buyPriceImpact(marketAddress, Position.AWAY, ethers.utils.parseEther('1')),
                await sportsAMMContract?.buyPriceImpact(marketAddress, Position.DRAW, ethers.utils.parseEther('1')),
            ]);

            return {
                positions: {
                    [Position.HOME]: {
                        available: bigNumberFormatter(availableToBuyHome),
                        buyImpactPrice: bigNumberFormatter(buyImpactHome) * 100,
                    },
                    [Position.AWAY]: {
                        available: bigNumberFormatter(availableToBuyAway),
                        buyImpactPrice: bigNumberFormatter(buyImpactAway) * 100,
                    },
                    [Position.DRAW]: {
                        available: bigNumberFormatter(availableToBuyDraw),
                        buyImpactPrice: bigNumberFormatter(buyImpactDraw) * 100,
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
    });
};

export default useAvailablePerSideQuery;

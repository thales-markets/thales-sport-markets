import { useQuery } from 'react-query';
import { Position, Side } from '../../constants/options';
import { AMMPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { ethers } from 'ethers';
import { bigNumberFormatter } from '../../utils/formatters/ethers';

const usePositionPriceDetailsQuery = (marketAddress: string, position: Position, amount: number) => {
    return useQuery<AMMPosition>(QUERY_KEYS.PositionDetails(marketAddress, position, amount), async () => {
        const sportsAMMContract = networkConnector.sportsAMMContract;
        const parsedAmount = ethers.utils.parseEther(amount.toString());

        const [
            availableToBuy,
            availableToSell,
            buyFromAmmQuote,
            sellToAmmQuote,
            buyPriceImpact,
            sellPriceImpact,
        ] = await Promise.all([
            await sportsAMMContract?.availableToBuyFromAMM(marketAddress, position),
            await sportsAMMContract?.availableToSellToAMM(marketAddress, position),
            await sportsAMMContract?.buyFromAmmQuote(marketAddress, position, parsedAmount),
            await sportsAMMContract?.sellToAmmQuote(marketAddress, position, parsedAmount),
            await sportsAMMContract?.buyPriceImpact(marketAddress, position, parsedAmount),
            await sportsAMMContract?.sellPriceImpact(marketAddress, position, parsedAmount),
        ]);

        return {
            sides: {
                [Side.BUY]: {
                    available: bigNumberFormatter(availableToBuy),
                    quote: bigNumberFormatter(buyFromAmmQuote),
                    priceImpact: bigNumberFormatter(buyPriceImpact),
                },
                [Side.SELL]: {
                    available: bigNumberFormatter(availableToSell),
                    quote: bigNumberFormatter(sellToAmmQuote),
                    priceImpact: bigNumberFormatter(sellPriceImpact),
                },
            },
        };
    });
};

export default usePositionPriceDetailsQuery;

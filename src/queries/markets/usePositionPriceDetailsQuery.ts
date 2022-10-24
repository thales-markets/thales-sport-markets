import { useQuery } from 'react-query';
import { Position, Side } from '../../constants/options';
import { AMMPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { ethers } from 'ethers';
import { bigNumberFormatter, bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from 'utils/collaterals';

const usePositionPriceDetailsQuery = (
    marketAddress: string,
    position: Position,
    amount: number,
    stableIndex: number,
    networkId: NetworkId
) => {
    return useQuery<AMMPosition>(
        QUERY_KEYS.PositionDetails(marketAddress, position, amount, stableIndex, networkId),
        async () => {
            try {
                const sportsAMMContract = networkConnector.sportsAMMContract;
                const parsedAmount = ethers.utils.parseEther(amount.toString());
                const collateralAddress = getCollateralAddress(
                    true,
                    stableIndex ? stableIndex !== 0 : false,
                    networkId,
                    stableIndex
                );
                const [
                    availableToBuy,
                    availableToSell,
                    buyFromAmmQuote,
                    sellToAmmQuote,
                    buyPriceImpact,
                    sellPriceImpact,
                    buyFromAMMQuoteCollateral,
                ] = await Promise.all([
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, position),
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, position),
                    await sportsAMMContract?.buyFromAmmQuote(marketAddress, position, parsedAmount),
                    await sportsAMMContract?.sellToAmmQuote(marketAddress, position, parsedAmount),
                    await sportsAMMContract?.buyPriceImpact(marketAddress, position, parsedAmount),
                    await sportsAMMContract?.sellPriceImpact(marketAddress, position, parsedAmount),
                    collateralAddress
                        ? await sportsAMMContract?.buyFromAmmQuoteWithDifferentCollateral(
                              marketAddress,
                              position,
                              parsedAmount,
                              collateralAddress
                          )
                        : 0,
                ]);

                return {
                    sides: {
                        [Side.BUY]: {
                            available: bigNumberFormatter(availableToBuy),
                            quote: bigNumberFormmaterWithDecimals(
                                stableIndex == 0 ? buyFromAmmQuote : buyFromAMMQuoteCollateral[0],
                                stableIndex == 0 || stableIndex == 1 ? 18 : 6
                            ),
                            priceImpact: bigNumberFormatter(buyPriceImpact),
                        },
                        [Side.SELL]: {
                            available: bigNumberFormatter(availableToSell),
                            quote: bigNumberFormatter(sellToAmmQuote),
                            priceImpact: bigNumberFormatter(sellPriceImpact),
                        },
                    },
                };
            } catch (e) {
                console.log('Error ', e);
                return {
                    sides: {
                        [Side.BUY]: {
                            available: 0,
                            quote: 0,
                            priceImpact: 0,
                        },
                        [Side.SELL]: {
                            available: 0,
                            quote: 0,
                            priceImpact: 0,
                        },
                    },
                };
            }
        }
    );
};

export default usePositionPriceDetailsQuery;

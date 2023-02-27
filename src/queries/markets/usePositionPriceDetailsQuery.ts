import { useQuery, UseQueryOptions } from 'react-query';
import { Position } from '../../constants/options';
import { AMMPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter, bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress, getDecimalsByStableCoinIndex, getDefaultDecimalsForNetwork } from 'utils/collaterals';
import { isMultiCollateralSupportedForNetwork } from 'utils/network';
import { ethers } from 'ethers';

const usePositionPriceDetailsQuery = (
    marketAddress: string,
    position: Position,
    amount: number,
    stableIndex: number,
    networkId: NetworkId,
    options?: UseQueryOptions<AMMPosition>
) => {
    return useQuery<AMMPosition>(
        QUERY_KEYS.PositionDetails(marketAddress, position, amount, stableIndex, networkId),
        async () => {
            try {
                const isMultiCollateral = isMultiCollateralSupportedForNetwork(networkId) && stableIndex !== 0;

                const sportsAMMContract = networkConnector.sportsAMMContract;
                const parsedAmount = ethers.utils.parseEther(amount.toString());

                const collateralAddress = isMultiCollateral && getCollateralAddress(true, networkId, stableIndex);
                const [availableToBuy, buyFromAmmQuote, buyPriceImpact, buyFromAMMQuoteCollateral] = await Promise.all([
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, position),
                    await sportsAMMContract?.buyFromAmmQuote(marketAddress, position, parsedAmount),
                    await sportsAMMContract?.buyPriceImpact(marketAddress, position, parsedAmount),
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
                    available: bigNumberFormatter(availableToBuy),
                    quote: bigNumberFormmaterWithDecimals(
                        isMultiCollateral ? buyFromAMMQuoteCollateral[0] : buyFromAmmQuote,
                        isMultiCollateral
                            ? getDecimalsByStableCoinIndex(stableIndex)
                            : getDefaultDecimalsForNetwork(networkId)
                    ),
                    priceImpact: bigNumberFormatter(buyPriceImpact),
                };
            } catch (e) {
                console.log('Error ', e);
                return {
                    available: 0,
                    quote: 0,
                    priceImpact: 0,
                };
            }
        },
        {
            ...options,
        }
    );
};

export default usePositionPriceDetailsQuery;

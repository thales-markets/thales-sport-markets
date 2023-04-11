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
import { ZERO_ADDRESS } from 'constants/network';

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

                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
                const parsedAmount = ethers.utils.parseEther(amount.toString());

                const collateralAddress = isMultiCollateral && getCollateralAddress(true, networkId, stableIndex);
                const positionDetails = await sportPositionalMarketDataContract?.getPositionDetails(
                    marketAddress,
                    position,
                    parsedAmount,
                    collateralAddress || ZERO_ADDRESS
                );

                return {
                    available: bigNumberFormatter(positionDetails.liquidity),
                    quote: bigNumberFormmaterWithDecimals(
                        isMultiCollateral ? positionDetails.quoteDifferentCollateral : positionDetails.quote,
                        isMultiCollateral
                            ? getDecimalsByStableCoinIndex(stableIndex)
                            : getDefaultDecimalsForNetwork(networkId)
                    ),
                    priceImpact: bigNumberFormatter(positionDetails.priceImpact),
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

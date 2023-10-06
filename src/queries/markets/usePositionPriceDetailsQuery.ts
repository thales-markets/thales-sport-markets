import { useQuery, UseQueryOptions } from 'react-query';
import { AMMPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { Network } from 'enums/network';
import { getCollateralAddress, getCollateralDecimals, getCollateralIndex } from 'utils/collaterals';
import { getDefaultDecimalsForNetwork, getIsMultiCollateralSupported } from 'utils/network';
import { ethers } from 'ethers';
import { ZERO_ADDRESS } from 'constants/network';
import { Position } from 'enums/markets';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { Coins } from '../../types/tokens';

const usePositionPriceDetailsQuery = (
    marketAddress: string,
    position: Position,
    amount: number,
    stableIndex: number,
    networkId: Network,
    options?: UseQueryOptions<AMMPosition>
) => {
    return useQuery<AMMPosition>(
        QUERY_KEYS.PositionDetails(marketAddress, position, amount, stableIndex, networkId),
        async () => {
            try {
                const isMultiCollateral = getIsMultiCollateralSupported(networkId) && stableIndex !== 0;

                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
                const parsedAmount = ethers.utils.parseEther(amount.toString());

                let collateralAddress = isMultiCollateral && getCollateralAddress(networkId, stableIndex);
                const isEth = collateralAddress === ZERO_ADDRESS;

                if (isEth) {
                    collateralAddress = getCollateralAddress(
                        networkId,
                        getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
                    );
                }
                const positionDetails = await sportPositionalMarketDataContract?.getPositionDetails(
                    marketAddress,
                    position,
                    parsedAmount,
                    collateralAddress || ZERO_ADDRESS
                );

                return {
                    available: bigNumberFormatter(positionDetails.liquidity),
                    quote: bigNumberFormatter(
                        isMultiCollateral ? positionDetails.quoteDifferentCollateral : positionDetails.quote,
                        isMultiCollateral
                            ? getCollateralDecimals(networkId, stableIndex)
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

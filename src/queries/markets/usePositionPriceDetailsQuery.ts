import { useQuery, UseQueryOptions } from 'react-query';
import { AMMPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { Network } from 'enums/network';
import { ethers } from 'ethers';
import { ZERO_ADDRESS } from 'constants/network';
import { Position } from 'enums/markets';
import { Coins } from 'types/tokens';

const usePositionPriceDetailsQuery = (
    marketAddress: string,
    position: Position,
    amount: number,
    selectedCollateral: string,
    collateralAddress: string,
    isDefaultCollateral: boolean,
    networkId: Network,
    options?: UseQueryOptions<AMMPosition>
) => {
    return useQuery<AMMPosition>(
        QUERY_KEYS.PositionDetails(marketAddress, position, amount, selectedCollateral, networkId),
        async () => {
            try {
                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
                const parsedAmount = ethers.utils.parseEther(amount.toString());

                const positionDetails = await sportPositionalMarketDataContract?.getPositionDetails(
                    marketAddress,
                    position,
                    parsedAmount,
                    isDefaultCollateral ? ZERO_ADDRESS : collateralAddress
                );

                return {
                    available: bigNumberFormatter(positionDetails.liquidity),
                    quote: coinFormatter(
                        isDefaultCollateral ? positionDetails.quote : positionDetails.quoteDifferentCollateral,
                        networkId,
                        selectedCollateral as Coins
                    ),
                    priceImpact: bigNumberFormatter(positionDetails.priceImpact),
                    usdQuote: coinFormatter(positionDetails.quote, networkId),
                };
            } catch (e) {
                console.log('Error ', e);
                return {
                    available: 0,
                    quote: 0,
                    priceImpact: 0,
                    usdQuote: 0,
                };
            }
        },
        {
            ...options,
        }
    );
};

export default usePositionPriceDetailsQuery;

import { useQuery, UseQueryOptions } from 'react-query';
import { AMMPosition, MultiSingleAmounts, ParlaysMarket } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { ethers } from 'ethers';
import { bigNumberFormatter, bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from 'utils/collaterals';
import { ZERO_ADDRESS } from 'constants/network';

const usePositionPriceDetailsMultiMarketsQuery = (
    markets: ParlaysMarket[],
    amounts: MultiSingleAmounts[],
    stableIndex: number,
    networkId: NetworkId,
    options?: UseQueryOptions<Record<string, AMMPosition> | undefined>
) => {
    return useQuery<Record<string, AMMPosition> | undefined>(
        QUERY_KEYS.MultiplePositionDetails(markets, amounts, stableIndex, networkId),
        async () => {
            const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
            const collateralAddress = getCollateralAddress(
                stableIndex ? stableIndex !== 0 : false,
                networkId,
                stableIndex
            );

            const ammPositionsMap = {} as Record<string, AMMPosition>;

            for (let i = 0; i < amounts.length; i++) {
                const parsedAmount = ethers.utils.parseEther(
                    amounts[i].amountToBuy > 0 ? amounts[i].amountToBuy.toString() : '1'
                );

                const address = amounts[i].sportMarketAddress;

                const market = markets.find((p) => p.address === address);

                if (market === undefined) {
                    ammPositionsMap[address] = {
                        available: 0,
                        quote: 0,
                        priceImpact: 0,
                    } as AMMPosition;

                    return;
                }

                try {
                    const positionDetails = await sportPositionalMarketDataContract?.getPositionDetails(
                        market.address,
                        market.position,
                        parsedAmount,
                        collateralAddress || ZERO_ADDRESS
                    );

                    ammPositionsMap[address] = {
                        available: bigNumberFormatter(positionDetails.liquidity),
                        quote: bigNumberFormmaterWithDecimals(
                            stableIndex == 0 ? positionDetails.quote : positionDetails.quoteDifferentCollateral,
                            stableIndex == 0 || stableIndex == 1 ? 18 : 6
                        ),
                        priceImpact: bigNumberFormatter(positionDetails.priceImpact),
                    };
                } catch (e) {
                    console.log('Error ', e);
                }
            }

            return ammPositionsMap;
        },
        {
            ...options,
        }
    );
};

export default usePositionPriceDetailsMultiMarketsQuery;

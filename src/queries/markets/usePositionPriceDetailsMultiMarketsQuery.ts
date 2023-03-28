import { useQuery, UseQueryOptions } from 'react-query';
import { AMMPosition, MultiSingleAmounts, ParlaysMarket } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { ethers } from 'ethers';
import { bigNumberFormatter, bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from 'utils/collaterals';

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
            const sportsAMMContract = networkConnector.sportsAMMContract;
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
                    const [
                        availableToBuy,
                        buyFromAmmQuote,
                        buyPriceImpact,
                        buyFromAMMQuoteCollateral,
                    ] = await Promise.all([
                        await sportsAMMContract?.availableToBuyFromAMM(market.address, market.position),
                        await sportsAMMContract?.buyFromAmmQuote(market.address, market.position, parsedAmount),
                        await sportsAMMContract?.buyPriceImpact(market.address, market.position, parsedAmount),
                        collateralAddress
                            ? await sportsAMMContract?.buyFromAmmQuoteWithDifferentCollateral(
                                  market.address,
                                  market.position,
                                  parsedAmount,
                                  collateralAddress
                              )
                            : 0,
                    ]);

                    ammPositionsMap[address] = {
                        available: bigNumberFormatter(availableToBuy),
                        quote: bigNumberFormmaterWithDecimals(
                            stableIndex == 0 ? buyFromAmmQuote : buyFromAMMQuoteCollateral[0],
                            stableIndex == 0 || stableIndex == 1 ? 18 : 6
                        ),
                        priceImpact: bigNumberFormatter(buyPriceImpact),
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

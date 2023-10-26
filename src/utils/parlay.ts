import { CombinedMarketPosition, ParlaysMarketPosition } from 'types/markets';

export const getHasCombinedMarketsParentMarketAddress = (
    combinedPositions: CombinedMarketPosition[],
    parentMarket: string
) => {
    return !!combinedPositions.find((combinedPosition) => {
        if (!!combinedPosition.markets.find((market) => market.parentMarket == parentMarket)) {
            return combinedPosition;
        }
    });
};

export const hasParlayDataParentMarketAddress = (
    parlayData: ParlaysMarketPosition[],
    parentMarketAddress: string
): boolean => {
    return !!parlayData.find((market) => market.parentMarket == parentMarketAddress);
};

export const getParentMarketAddressFromCombinedMarketPositionType = (
    combinedPosition: CombinedMarketPosition
): string | undefined => {
    const positionWithParentMarketAddress = combinedPosition.markets.find((market) => market.parentMarket);
    if (positionWithParentMarketAddress) return positionWithParentMarketAddress.parentMarket;
};

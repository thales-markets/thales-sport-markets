import { OddsType } from 'enums/markets';
import { CombinedMarketPosition, ParlaysMarketPosition } from 'types/markets';
import { formatMarketOdds } from './markets';

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

export const getParlayQuote = (paid: number, payout: number) => 1 / (payout / paid);

export const formatParlayOdds = (oddsType: OddsType, paid: number, payout: number) =>
    formatMarketOdds(oddsType, getParlayQuote(paid, payout));

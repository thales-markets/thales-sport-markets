import { MarketStatus } from 'constants/markets';
import { AccountPosition, MarketInfo, SportMarketInfo } from 'types/markets';

export const getRoi = (ticketPrice: number, potentialWinnings: number, showRoi: boolean) =>
    showRoi ? (potentialWinnings - ticketPrice) / ticketPrice : 0;

export const isClaimAvailable = (market: SportMarketInfo, accountPosition?: AccountPosition) =>
    // !market.isPaused &&
    !!accountPosition &&
    // market.canUsersClaim &&
    accountPosition.position > 0 &&
    accountPosition.position === market.finalResult; //||
// market.status === MarketStatus.CancelledConfirmed ||
// market.noWinners);

export const getMarketStatus = (market: MarketInfo) => {
    if (market.isPaused) {
        return MarketStatus.Paused;
    } else {
        if (market.isResolved) {
            if (market.winningPosition === 0) {
                if (market.canUsersClaim || market.cancelledByCreator) {
                    return MarketStatus.CancelledConfirmed;
                } else {
                    return MarketStatus.CancelledPendingConfirmation;
                }
            } else {
                if (market.canUsersClaim) {
                    return MarketStatus.ResolvedConfirmed;
                } else {
                    return MarketStatus.ResolvedPendingConfirmation;
                }
            }
        } else {
            if (market.canMarketBeResolved) {
                return MarketStatus.ResolvePending;
            } else {
                return MarketStatus.Open;
            }
        }
    }
};

export const isValidHttpsUrl = (text: string) => {
    let url;

    try {
        url = new URL(text);
    } catch (_) {
        return false;
    }

    return url.protocol === 'https:';
};

export const convertFinalResultToResultType = (result: number) => {
    if (result == 1) return 0;
    if (result == 2) return 1;
    if (result == 3) return 2;
};

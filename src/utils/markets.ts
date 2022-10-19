import { ApexBetType, APEX_GAME_MIN_TAG, MarketStatus, OddsType } from 'constants/markets';
import { AccountPosition, MarketData, MarketInfo, SportMarketInfo } from 'types/markets';
import { formatCurrency } from './formatters/number';
import ordinal from 'ordinal';
import { MLS_TAG } from 'constants/tags';

export const getRoi = (ticketPrice: number, potentialWinnings: number, showRoi: boolean) =>
    showRoi ? (potentialWinnings - ticketPrice) / ticketPrice : 0;

export const isClaimAvailable = (accountPositions?: AccountPosition[]) => {
    let isClaimAvailable = false;
    accountPositions?.forEach((accountPosition) =>
        accountPosition.claimable && accountPosition.amount > 0 ? (isClaimAvailable = true) : ''
    );
    return isClaimAvailable;
};

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

export const convertFinalResultToResultType = (result: number, isApexTopGame?: boolean) => {
    if (result == 1 && isApexTopGame) return 3;
    if (result == 2 && isApexTopGame) return 4;
    if (result == 2) return 1;
    if (result == 1) return 0;
    if (result == 2) return 1;
    if (result == 3) return 2;
};

export const formatMarketOdds = (oddsType: OddsType, odds: number | undefined) => {
    if (!odds) {
        return '0';
    }
    switch (oddsType) {
        case OddsType.Decimal:
            return `${formatCurrency(1 / odds, 2)}`;
        case OddsType.American:
            const decimal = 1 / odds;
            if (decimal >= 2) {
                return `+${formatCurrency((decimal - 1) * 100, 0)}`;
            } else {
                return `-${formatCurrency(100 / (decimal - 1), 0)}`;
            }
        case OddsType.AMM:
        default:
            return `${formatCurrency(odds, 2)}`;
    }
};

export const convertFinalResultToWinnerName = (result: number, market: MarketData) => {
    if (result == 1 && getIsApexTopGame(market.isApex, market.betType)) return 'YES';
    if (result == 2 && getIsApexTopGame(market.isApex, market.betType)) return 'NO';
    if (result == 1) return market.homeTeam;
    if (result == 2) return market.awayTeam;
    if (result == 3) return 'DRAW';
};

export const convertPositionToTeamName = (result: number, market: MarketData) => {
    if (result == 0 && getIsApexTopGame(market.isApex, market.betType)) return 'YES';
    if (result == 1 && getIsApexTopGame(market.isApex, market.betType)) return 'NO';
    if (result == 0) return market.homeTeam;
    if (result == 1) return market.awayTeam;
    if (result == 2) return 'DRAW';
};

export const isApexGame = (tag: number) => tag >= APEX_GAME_MIN_TAG;

export const getScoreForApexGame = (resultDetails: string, defaultHomeScore: string, defaultAwayScore: string) => {
    if (resultDetails !== null && resultDetails.indexOf('/')) {
        const splittedResultDetails = resultDetails.split('/');
        let homeScore = splittedResultDetails[0];
        let awayScore = splittedResultDetails[1];
        if (!isNaN(parseInt(homeScore))) {
            homeScore = ordinal(Number(homeScore));
        }
        if (!isNaN(parseInt(awayScore))) {
            awayScore = ordinal(Number(awayScore));
        }
        return {
            homeScore,
            awayScore,
        };
    }

    return {
        homeScore: defaultHomeScore,
        awayScore: defaultAwayScore,
    };
};

export const appplyLogicForApexGame = (market: SportMarketInfo) => {
    // parse result and set score
    const score = getScoreForApexGame(market.resultDetails, market.homeScore.toString(), market.awayScore.toString());
    market.homeScore = score.homeScore;
    market.awayScore = score.awayScore;

    // show market as paused if there are no new odds for post qualifying phase
    market.isPaused =
        !!market.qualifyingStartTime &&
        market.qualifyingStartTime < new Date().getTime() &&
        market.maturityDate.getTime() > new Date().getTime() &&
        !market.arePostQualifyingOddsFetched;
    return market;
};

export const getIsApexTopGame = (isApex: boolean, betType: ApexBetType) =>
    isApex && (betType === ApexBetType.TOP3 || betType === ApexBetType.TOP5 || betType === ApexBetType.TOP10);

export const isDiscounted = (priceImpact: number | undefined) => {
    if (priceImpact) {
        return Number(priceImpact) < 0;
    }
    return false;
};

export const isMlsGame = (tag: number) => Number(tag) === MLS_TAG;

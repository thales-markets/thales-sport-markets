import {
    FIFA_WC_TAG,
    FIFA_WC_U20_TAG,
    GOLF_TAGS,
    GOLF_TOURNAMENT_WINNER_TAG,
    IIHF_WC_TAG,
    MATCH_RESOLVE_MAP,
    MOTOSPORT_TAGS,
    SCORING_MAP,
    SPORTS_TAGS_MAP,
    TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS,
    UEFA_TAGS,
} from 'constants/tags';
import i18n from 'i18n';
import { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import {
    CombinedMarketsPositionName,
    MarketData,
    ParlayMarket,
    ParlayMarketWithQuotes,
    ParlayMarketWithRound,
    ParlaysMarket,
    PositionData,
    SportMarketInfo,
} from 'types/markets';
import { addDaysToEnteredTimestamp } from './formatters/date';
import { formatCurrency } from './formatters/number';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import { BetType, DoubleChanceMarketType, OddsType, Position } from 'enums/markets';
import { PARLAY_MAXIMUM_QUOTE } from '../constants/markets';

const EXPIRE_SINGLE_SPORT_MARKET_PERIOD_IN_DAYS = 90;

export const convertFinalResultToResultType = (result: number, isApexTopGame?: boolean) => {
    if (result == 1 && isApexTopGame) return 3;
    if (result == 2 && isApexTopGame) return 4;
    if (result == 1) return 0;
    if (result == 2) return 1;
    if (result == 3) return 2;
    return -1;
};

export const getSymbolText = (
    position: Position,
    market: SportMarketInfo | MarketData,
    combinedMarketPositionSymbol?: CombinedMarketsPositionName
) => {
    if (combinedMarketPositionSymbol) {
        return combinedMarketPositionSymbol;
    }

    if (market.isOneSideMarket) {
        return 'YES';
    }
    switch (position) {
        case Position.HOME:
            switch (Number(market.betType)) {
                case BetType.SPREAD:
                    return 'H1';
                case BetType.TOTAL:
                    return 'O';
                case BetType.DOUBLE_CHANCE:
                    switch (market.doubleChanceMarketType) {
                        case DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE:
                            return '1X';
                        case DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE:
                            return 'X2';
                        case DoubleChanceMarketType.NO_DRAW:
                            return '12';
                        default:
                            return '';
                    }
                default:
                    return '1';
            }
        case Position.AWAY:
            switch (Number(market.betType)) {
                case BetType.SPREAD:
                    return 'H2';
                case BetType.TOTAL:
                    return 'U';
                default:
                    return '2';
            }
        case Position.DRAW:
            return 'X';
        default:
            return '';
    }
};

export const getSpreadTotalText = (market: SportMarketInfo | MarketData, position: Position) => {
    switch (Number(market.betType)) {
        case BetType.SPREAD:
            return position === Position.HOME
                ? `${Number(market.spread) > 0 ? '+' : '-'}${Math.abs(Number(market.spread)) / 100}`
                : `${Number(market.spread) > 0 ? '-' : '+'}${Math.abs(Number(market.spread)) / 100}`;
        case BetType.TOTAL:
            return `${Number(market.total) / 100}`;
        default:
            return undefined;
    }
};

export const getTotalText = (market: SportMarketInfo) => {
    if (market.betType == BetType.TOTAL) return `${Number(market.total) / 100}`;
    return undefined;
};

const getSpreadText = (market: SportMarketInfo, position: Position) => {
    if (market.betType == BetType.SPREAD) {
        return position === Position.HOME
            ? `${Number(market.spread) > 0 ? '+' : '-'}${Math.abs(Number(market.spread)) / 100}`
            : `${Number(market.spread) > 0 ? '-' : '+'}${Math.abs(Number(market.spread)) / 100}`;
    }
    return undefined;
};

export const getSpreadAndTotalTextForCombinedMarket = (
    markets: SportMarketInfo[],
    positions: Position[]
): { total: string; spread: string } => {
    const result = {
        total: '',
        spread: '',
    };

    const totalMarket = markets.find((market) => market.betType == BetType.TOTAL);
    const spreadMarket = markets.findIndex((market) => market.betType == BetType.SPREAD);

    if (totalMarket) result.total = (getTotalText(totalMarket) ? getTotalText(totalMarket) : '') as string;
    if (spreadMarket !== -1)
        result.spread = (getSpreadText(markets[spreadMarket], positions[spreadMarket])
            ? getSpreadText(markets[spreadMarket], positions[spreadMarket])
            : '') as string;
    return result;
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
            return `${formatCurrency(odds, odds < 0.1 ? 4 : 2)}`;
    }
};

export const convertPositionNameToPosition = (positionName: string) => {
    if (positionName?.toUpperCase() == 'HOME') return 0;
    if (positionName?.toUpperCase() == 'AWAY') return 1;
    if (positionName?.toUpperCase() == 'DRAW') return 2;
    return 1;
};

export const convertPositionNameToPositionType = (positionName: string) => {
    if (positionName?.toUpperCase() == 'HOME') return Position.HOME;
    if (positionName?.toUpperCase() == 'AWAY') return Position.AWAY;
    if (positionName?.toUpperCase() == 'DRAW') return Position.DRAW;
    return Position.HOME;
};

export const getCanceledGameClaimAmount = (position: AccountPositionProfile) => {
    const positionType = convertPositionNameToPositionType(position.side);

    if (positionType == Position.HOME) return position.market.homeOdds * position.amount;
    if (positionType == Position.AWAY) return position.market.awayOdds * position.amount;
    if (positionType == Position.DRAW) return position.market.drawOdds ? position.market.drawOdds * position.amount : 0;
    return 0;
};

export const getPositionOdds = (market: ParlaysMarket) => {
    return market.position === Position.HOME
        ? market.homeOdds
        : market.position === Position.AWAY
        ? market.awayOdds
        : market.drawOdds
        ? market.drawOdds
        : 0;
};

export const getVisibilityOfDrawOption = (tags: Array<number>, betType: BetType) => {
    const tag = tags.find((element) => TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS.includes(Number(element)));
    if (tag || betType === BetType.TOTAL || betType === BetType.SPREAD) return false;
    return true;
};

export const hasBonus = (bonus: number | undefined) => Number(bonus) > 0;

export const getFormattedBonus = (bonus: number | undefined) => `+${Math.ceil(Number(bonus))}%`;

export const isFifaWCGame = (tag: number) => Number(tag) === FIFA_WC_TAG || Number(tag) === FIFA_WC_U20_TAG;

export const isIIHFWCGame = (tag: number) => Number(tag) === IIHF_WC_TAG;

export const isUEFAGame = (tag: number) => UEFA_TAGS.includes(tag);

export const isMotosport = (tag: number) => MOTOSPORT_TAGS.includes(tag);

export const isGolf = (tag: number) => GOLF_TAGS.includes(tag);

export const isParlayWon = (parlayMarket: ParlayMarket) =>
    parlayMarket.positions.every(
        (position) =>
            convertPositionNameToPosition(position.side) ===
                convertFinalResultToResultType(position.market.finalResult) || position.market.isCanceled
    );

export const isParlayLost = (parlayMarket: ParlayMarket) =>
    parlayMarket.positions.some(
        (position) =>
            convertPositionNameToPosition(position.side) !==
                convertFinalResultToResultType(position.market.finalResult) && position.market.isResolved
    );

export const isParlayClaimable = (parlayMarket: ParlayMarket) => {
    const lastGameStartsExpiryDate = addDaysToEnteredTimestamp(
        EXPIRE_SINGLE_SPORT_MARKET_PERIOD_IN_DAYS,
        parlayMarket.lastGameStarts
    );
    const isMarketExpired = lastGameStartsExpiryDate < new Date().getTime();

    return isParlayWon(parlayMarket) && !isMarketExpired && !parlayMarket.claimed;
};

export const isParlayOpen = (parlayMarket: ParlayMarket) => {
    const parlayHasOpenMarkets = parlayMarket.positions.some((position) => position.market.isOpen);
    return parlayHasOpenMarkets && !isParlayLost(parlayMarket);
};

export const isSportMarketExpired = (sportMarket: SportMarketInfo) => {
    const maturyDatePlusExpirationPeriod = addDaysToEnteredTimestamp(
        EXPIRE_SINGLE_SPORT_MARKET_PERIOD_IN_DAYS,
        new Date(sportMarket.maturityDate).getTime()
    );

    return maturyDatePlusExpirationPeriod < new Date().getTime();
};

export const updateTotalQuoteAndAmountFromContract = (
    parlayMarkets: ParlayMarket[] | ParlayMarketWithRound[]
): ParlayMarket[] | ParlayMarketWithRound[] => {
    const modifiedParlays = parlayMarkets.map((parlay) => {
        let totalQuote = parlay.totalQuote;
        let totalAmount = parlay.totalAmount;

        let realQuote = 1;
        parlay.marketQuotes.map((quote) => {
            realQuote = realQuote * quote;
        });

        parlay.sportMarketsFromContract.forEach((address, index) => {
            const market = parlay.sportMarkets.find((market) => market.address === address);

            if (market && market.isCanceled) {
                realQuote = realQuote / parlay.marketQuotes[index];
                const maximumQuote = PARLAY_MAXIMUM_QUOTE;
                totalQuote = realQuote < maximumQuote ? maximumQuote : realQuote;
                totalAmount = totalAmount * parlay.marketQuotes[index];
            }
        });

        return {
            ...parlay,
            totalQuote,
            totalAmount,
        };
    });
    return modifiedParlays;
};

export const getBonus = (market: ParlaysMarket): number => {
    switch (market.position) {
        case Position.HOME:
            return hasBonus(market.homeBonus) ? Number(market.homeBonus) : 0;
        case Position.AWAY:
            return hasBonus(market.awayBonus) ? Number(market.awayBonus) : 0;
        case Position.DRAW:
            return hasBonus(market.drawBonus) ? Number(market.drawBonus) : 0;
        default:
            return 0;
    }
};

export const getParentMarketAddress = (parentMarketAddress: string, marketAddress: string) =>
    parentMarketAddress !== null && parentMarketAddress !== '' ? parentMarketAddress : marketAddress;

export const getOddTooltipText = (position: Position, market: SportMarketInfo | MarketData) => {
    const spread = Math.abs(Number(market.spread) / 100);
    const total = Number(market.total) / 100;
    const team =
        position === Position.AWAY || market.doubleChanceMarketType === DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE
            ? market.awayTeam
            : market.isOneSideMarket
            ? fixOneSideMarketCompetitorName(market.homeTeam)
            : market.homeTeam;
    const team2 = market.awayTeam;
    const scoring =
        SCORING_MAP[market.tags[0]] !== ''
            ? i18n.t(`markets.market-card.odd-tooltip.scoring.${SCORING_MAP[market.tags[0]]}`)
            : '';
    const matchResolve =
        MATCH_RESOLVE_MAP[market.tags[0]] !== ''
            ? i18n.t(`markets.market-card.odd-tooltip.match-resolve.${MATCH_RESOLVE_MAP[market.tags[0]]}`)
            : '';
    let translationKey = '';

    switch (position) {
        case Position.HOME:
            switch (Number(market.betType)) {
                case BetType.SPREAD:
                    translationKey = Number(market.spread) < 0 ? 'spread.minus' : 'spread.plus';
                    break;
                case BetType.TOTAL:
                    translationKey = 'total.over';
                    break;
                case BetType.DOUBLE_CHANCE:
                    switch (market.doubleChanceMarketType) {
                        case DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE:
                            translationKey = 'double-chance.1x2';
                            break;
                        case DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE:
                            translationKey = 'double-chance.1x2';
                            break;
                        case DoubleChanceMarketType.NO_DRAW:
                            translationKey = 'double-chance.12';
                            break;
                        default:
                            translationKey = '';
                    }
                    break;
                default:
                    translationKey = market.isOneSideMarket
                        ? Number(market.tags[0]) == GOLF_TOURNAMENT_WINNER_TAG
                            ? 'tournament-winner'
                            : 'race-winner'
                        : 'winner';
            }
            break;
        case Position.AWAY:
            switch (Number(market.betType)) {
                case BetType.SPREAD:
                    translationKey = Number(market.spread) < 0 ? 'spread.plus' : 'spread.minus';
                    break;
                case BetType.TOTAL:
                    translationKey = 'total.under';
                    break;
                default:
                    translationKey = market.isOneSideMarket
                        ? Number(market.tags[0]) == GOLF_TOURNAMENT_WINNER_TAG
                            ? 'tournament-winner'
                            : 'race-winner'
                        : 'winner';
            }
            break;
        case Position.DRAW:
            translationKey = 'draw';
            break;
    }
    return i18n.t(`markets.market-card.odd-tooltip.${translationKey}`, {
        team,
        team2,
        spread,
        total,
        scoring,
        matchResolve,
    });
};

export const getCombinedOddTooltipText = (markets: SportMarketInfo[], positions: Position[]) => {
    let fullTooltipText = '';

    const matchResolve =
        MATCH_RESOLVE_MAP[markets[0].tags[0]] !== ''
            ? i18n.t(`markets.market-card.odd-tooltip.match-resolve.${MATCH_RESOLVE_MAP[markets[0].tags[0]]}`)
            : '';
    const scoring =
        SCORING_MAP[markets[0].tags[0]] !== ''
            ? i18n.t(`markets.market-card.odd-tooltip.scoring.${SCORING_MAP[markets[0].tags[0]]}`)
            : '';

    if (markets[0].betType == BetType.WINNER) {
        let team = '';
        let translationKey = '';
        switch (positions[0]) {
            case Position.HOME:
                translationKey = markets[0].isOneSideMarket
                    ? Number(markets[0].tags[0]) == GOLF_TOURNAMENT_WINNER_TAG
                        ? 'tournament-winner'
                        : 'race-winner'
                    : 'winner';
                team = markets[0].homeTeam;
                break;
            case Position.DRAW:
                translationKey = 'draw';
                break;
            case Position.AWAY:
                translationKey = markets[0].isOneSideMarket
                    ? Number(markets[0].tags[0]) == GOLF_TOURNAMENT_WINNER_TAG
                        ? 'tournament-winner'
                        : 'race-winner'
                    : 'winner';
                team = markets[0].awayTeam;
                break;
        }

        fullTooltipText += i18n.t(`markets.market-card.odd-tooltip.${translationKey}`, {
            team,
            scoring,
            matchResolve,
        });
    }

    if (markets[0].betType == BetType.SPREAD) {
        let team = '';
        const spread = Math.abs(Number(markets[0].spread) / 100);
        let translationKey = '';
        switch (positions[0]) {
            case Position.HOME:
                team = markets[0].homeTeam;
                translationKey = Number(markets[0].spread) < 0 ? 'spread.minus' : 'spread.plus';
                break;
            case Position.AWAY:
                team = markets[0].awayTeam;
                translationKey = Number(markets[0].spread) < 0 ? 'spread.plus' : 'spread.minus';
                break;
        }
        fullTooltipText += i18n.t(`markets.market-card.odd-tooltip.${translationKey}`, {
            spread,
            team,
            scoring,
            matchResolve,
        });
    }

    if (fullTooltipText.trim().endsWith('.')) fullTooltipText = fullTooltipText.slice(0, -1);

    if (fullTooltipText !== '') fullTooltipText += ` ${i18n.t('markets.market-card.odd-tooltip.and')} `;

    if (markets[1].betType == BetType.TOTAL) {
        const total = Number(markets[1].total) / 100;
        let translationKey = '';
        switch (positions[1]) {
            case Position.HOME:
                translationKey = 'total.over';
                break;
            case Position.AWAY:
                translationKey = 'total.under';
                break;
        }
        fullTooltipText += i18n
            .t(`markets.market-card.odd-tooltip.${translationKey}`, {
                total,
                scoring,
                matchResolve,
            })
            .toLowerCase();
    }

    return fullTooltipText;
};

export const convertPriceImpactToBonus = (priceImpact: number): number => -((priceImpact / (1 + priceImpact)) * 100);

export const syncPositionsAndMarketsPerContractOrderInParlay = (parlayMarket: ParlayMarket): ParlayMarketWithQuotes => {
    const syncedParlayMarket: ParlayMarketWithQuotes = { ...parlayMarket, quotes: [] };

    const positions: PositionData[] = [];
    const markets: SportMarketInfo[] = [];
    const quotes: number[] = [];

    parlayMarket.sportMarketsFromContract.forEach((address, index) => {
        const position = parlayMarket.positions.find((position) => position.market.address == address);
        const market = parlayMarket.sportMarkets.find((market) => market.address == address);

        if (position && market) {
            position.market.isOneSideMarket = getIsOneSideMarket(Number(market.tags[0]));

            positions.push(position);
            markets.push(market);

            const quote = market.isCanceled ? 1 : parlayMarket.marketQuotes[index];
            quotes.push(quote);
        }
    });

    syncedParlayMarket.sportMarkets = markets;
    syncedParlayMarket.positions = positions;
    syncedParlayMarket.quotes = quotes;

    return syncedParlayMarket;
};

export const isParentMarketSameForSportMarkets = (
    firstMarket: SportMarketInfo,
    secondMarket: SportMarketInfo
): boolean => {
    if (firstMarket.parentMarket && secondMarket.parentMarket) {
        return firstMarket.parentMarket == secondMarket.parentMarket;
    }

    if (!firstMarket.parentMarket && secondMarket.parentMarket) {
        return firstMarket.address == secondMarket.parentMarket;
    }

    if (firstMarket.parentMarket && !secondMarket.parentMarket) {
        return firstMarket.parentMarket == secondMarket.address;
    }

    return false;
};

export const getMarketAddressesFromSportMarketArray = (markets: SportMarketInfo[]): string[] => {
    return markets.map((market) => market.address);
};

export const getIsOneSideMarket = (tag: number) =>
    SPORTS_TAGS_MAP['Motosport'].includes(Number(tag)) || Number(tag) == GOLF_TOURNAMENT_WINNER_TAG;

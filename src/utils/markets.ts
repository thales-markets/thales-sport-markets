import { OddsType } from 'constants/markets';
import { Position } from 'constants/options';
import {
    BetType,
    DoubleChanceMarketType,
    FIFA_WC_TAG,
    FIFA_WC_U20_TAG,
    IIHF_WC_TAG,
    MATCH_RESOLVE_MAP,
    MOTOSPORT_TAGS,
    SCORING_MAP,
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
import { fixEnetpulseRacingName } from './formatters/string';

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

    if (market.isEnetpulseRacing) {
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

    const totalMarket = markets.find((_market) => _market.betType == BetType.TOTAL);
    const spreadMarket = markets.findIndex((_market) => _market.betType == BetType.SPREAD);

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

export const isParlayWon = (parlayMarket: ParlayMarket) => {
    const resolvedMarkets = parlayMarket.sportMarkets.filter((market) => market?.isResolved || market?.isCanceled);
    const claimablePositions = parlayMarket.positions.filter((position) => position.claimable);

    return (
        (resolvedMarkets &&
            resolvedMarkets?.length === claimablePositions?.length &&
            resolvedMarkets?.length === parlayMarket.sportMarkets.length) ||
        parlayMarket.won
    );
};

export const isParlayClaimable = (parlayMarket: ParlayMarket) => {
    const resolvedMarkets = parlayMarket.sportMarkets.filter((market) => market?.isResolved || market?.isCanceled);
    const claimablePositions = parlayMarket.positions.filter((position) => position.claimable);

    if (parlayMarket.claimed) return false;

    const lastGameStartsPlusExpirationPeriod = addDaysToEnteredTimestamp(
        EXPIRE_SINGLE_SPORT_MARKET_PERIOD_IN_DAYS,
        parlayMarket.lastGameStarts
    );

    if (lastGameStartsPlusExpirationPeriod < new Date().getTime()) {
        return false;
    }

    if (
        resolvedMarkets?.length == claimablePositions?.length &&
        resolvedMarkets?.length == parlayMarket.sportMarkets.length &&
        !parlayMarket.claimed
    ) {
        return true;
    }

    return false;
};

export const isParlayOpen = (parlayMarket: ParlayMarket) => {
    const resolvedMarkets = parlayMarket.sportMarkets.filter((market) => market?.isResolved);
    const resolvedAndClaimable = parlayMarket.positions.filter(
        (position) => position.claimable && (position.market.isResolved || position.market.isCanceled)
    );

    if (resolvedMarkets?.length == 0) return true;

    if (resolvedMarkets?.length !== resolvedAndClaimable?.length) return false;
    if (resolvedMarkets?.length === parlayMarket.sportMarkets.length) return false;

    return true;
};

const isCanceledMarketInParlay = (parlayMarket: ParlayMarket) => {
    const canceledMarket = parlayMarket.sportMarkets.filter((market) => market?.isCanceled);
    if (canceledMarket) return true;
    return false;
};

export const isSportMarketExpired = (sportMarket: SportMarketInfo) => {
    const maturyDatePlusExpirationPeriod = addDaysToEnteredTimestamp(
        EXPIRE_SINGLE_SPORT_MARKET_PERIOD_IN_DAYS,
        new Date(sportMarket.maturityDate).getTime()
    );

    if (maturyDatePlusExpirationPeriod < new Date().getTime()) {
        return true;
    }

    return false;
};

export const updateTotalQuoteAndAmountFromContract = (
    parlayMarkets: ParlayMarket[] | ParlayMarketWithRound[]
): ParlayMarket[] | ParlayMarketWithRound[] => {
    const modifiedParlays = parlayMarkets.map((parlay) => {
        if (isCanceledMarketInParlay(parlay)) {
            const canceledQuotes = getCanceledGamesPreviousQuotes(parlay);
            let totalQuote = parlay.totalQuote;
            canceledQuotes.forEach((quote) => {
                totalQuote /= quote;
            });
            return {
                ...parlay,
                totalQuote,
                totalAmount: totalQuote ? parlay.sUSDAfterFees / totalQuote : 0,
            };
        } else {
            return parlay;
        }
    });
    return modifiedParlays;
};

const getCanceledGamesPreviousQuotes = (parlay: ParlayMarket): number[] => {
    const quotes: number[] = [];
    parlay.sportMarketsFromContract.forEach((marketAddress, index) => {
        const market = parlay.sportMarkets.find((market) => market.address == marketAddress);
        if (market?.isCanceled && parlay.marketQuotes) {
            quotes.push(parlay.marketQuotes[index]);
        }
    });

    return quotes;
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
            : market.isEnetpulseRacing
            ? fixEnetpulseRacingName(market.homeTeam)
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
                    translationKey = market.isEnetpulseRacing ? 'race-winner' : 'winner';
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
                    translationKey = market.isEnetpulseRacing ? 'race-winner' : 'winner';
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
                translationKey = markets[0].isEnetpulseRacing ? 'race-winner' : 'winner';
                team = markets[0].homeTeam;
                break;
            case Position.DRAW:
                translationKey = 'draw';
                break;
            case Position.AWAY:
                translationKey = markets[0].isEnetpulseRacing ? 'race-winner' : 'winner';
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
    const _parlayMarket: ParlayMarketWithQuotes = { ...parlayMarket, quotes: [] };

    const _positions: PositionData[] = [];
    const _markets: SportMarketInfo[] = [];
    const _quotes: number[] = [];

    parlayMarket.sportMarketsFromContract.forEach((address, index) => {
        const _position = parlayMarket.positions.find((position) => position.market.address == address);
        const _market = parlayMarket.sportMarkets.find((market) => market.address == address);

        _position ? _positions.push(_position) : '';
        _market ? _markets.push(_market) : '';

        const _quote = _market?.isCanceled ? 1 : parlayMarket.marketQuotes ? parlayMarket.marketQuotes[index] : 0;
        _quotes.push(_quote);
    });

    _parlayMarket.sportMarkets = _markets;
    _parlayMarket.positions = _positions;
    _parlayMarket.quotes = _quotes;

    return _parlayMarket;
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

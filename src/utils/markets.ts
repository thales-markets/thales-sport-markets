import {
    BetTypeNameMap,
    FIFA_WC_TAG,
    FIFA_WC_U20_TAG,
    GOLF_TAGS,
    GOLF_TOURNAMENT_WINNER_TAG,
    IIHF_WC_TAG,
    INTERNATIONAL_SPORTS,
    MATCH_RESOLVE_MAP,
    MOTOSPORT_TAGS,
    SCORING_MAP,
    SPORTS_TAGS_MAP,
    TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS,
    UEFA_TAGS,
} from 'constants/tags';
import {
    BetType,
    DoubleChanceMarketType,
    ONE_SIDER_PLAYER_PROPS_BET_TYPES,
    OddsType,
    PLAYER_PROPS_BET_TYPES,
    Position,
    SPECIAL_YES_NO_BET_TYPES,
} from 'enums/markets';
import i18n from 'i18n';
import { addDaysToEnteredTimestamp, formatCurrency } from 'thales-utils';
import {
    AccountPositionProfile,
    CombinedMarketsPositionName,
    MarketData,
    ParlayMarket,
    ParlayMarketWithQuotes,
    ParlayMarketWithRound,
    ParlaysMarket,
    PositionData,
    SportMarketInfo,
} from 'types/markets';
import { PARLAY_MAXIMUM_QUOTE } from '../constants/markets';
import { fixOneSideMarketCompetitorName } from './formatters/string';

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
    const betType = Number(market.betType);
    if (combinedMarketPositionSymbol) {
        return combinedMarketPositionSymbol;
    }

    if (market.isOneSideMarket || isOneSidePlayerProps(Number(betType))) {
        return 'YES';
    }

    if (isSpecialYesNoProp(Number(betType))) {
        return position === Position.HOME ? 'YES' : 'NO';
    }

    if (betType === BetType.SPREAD) return 'H' + (position === Position.HOME ? '1' : '2');
    if (betType === BetType.TOTAL || isPlayerProps(betType)) return position === Position.HOME ? 'O' : 'U';
    if (betType === BetType.DOUBLE_CHANCE)
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
    if (position === Position.DRAW) return 'X';
    return position === Position.HOME ? '1' : '2';
};

export const getSpreadTotalText = (market: SportMarketInfo | MarketData, position: Position) => {
    if (market.betType === BetType.SPREAD)
        return position === Position.HOME
            ? `${Number(market.spread) > 0 ? '+' : '-'}${Math.abs(Number(market.spread)) / 100}`
            : `${Number(market.spread) > 0 ? '-' : '+'}${Math.abs(Number(market.spread)) / 100}`;

    if (market.betType === BetType.TOTAL) return `${Number(market.total) / 100}`;
    if (isPlayerProps(market.betType)) return `${Number(market.playerPropsLine)}`;
    return undefined;
};

export const getTotalText = (market: SportMarketInfo) => {
    if (market.betType == BetType.TOTAL) return `${Number(market.total) / 100}`;
    return undefined;
};

export const getMarketName = (market: SportMarketInfo | MarketData, position?: Position) => {
    if (market.isOneSideMarket) return fixOneSideMarketCompetitorName(market.homeTeam);
    if (isPlayerProps(market.betType)) return `${market.playerName} \n(${BetTypeNameMap[market.betType as BetType]})`;
    return position === Position.HOME ? market.homeTeam : market.awayTeam;
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
    if (tag || betType === BetType.TOTAL || betType === BetType.SPREAD || isPlayerProps(betType)) return false;
    return true;
};

export const hasBonus = (bonus: number | undefined) => Number(bonus) > 0;

export const getFormattedBonus = (bonus: number | undefined) => `+${Math.ceil(Number(bonus))}%`;

export const isFifaWCGame = (tag: number) => Number(tag) === FIFA_WC_TAG || Number(tag) === FIFA_WC_U20_TAG;

export const isIIHFWCGame = (tag: number) => Number(tag) === IIHF_WC_TAG;

export const isUEFAGame = (tag: number) => UEFA_TAGS.includes(tag);

export const isInternationalGame = (tag: number) => INTERNATIONAL_SPORTS.includes(tag);

export const isMotosport = (tag: number) => MOTOSPORT_TAGS.includes(tag);

export const isGolf = (tag: number) => GOLF_TAGS.includes(tag);

export const isParlayWon = (parlayMarket: ParlayMarket) =>
    parlayMarket.positions.length > 0 &&
    parlayMarket.positions.every(
        (position) =>
            convertPositionNameToPosition(position.side) ===
                convertFinalResultToResultType(position.market.finalResult) || position.market.isCanceled
    );

const isParlayLost = (parlayMarket: ParlayMarket) =>
    parlayMarket.positions.some(
        (position) =>
            convertPositionNameToPosition(position.side) !==
                convertFinalResultToResultType(position.market.finalResult) &&
            position.market.isResolved &&
            !position.market.isCanceled
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
        if (parlay.marketQuotes) {
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
        }

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
                case BetType.PLAYER_PROPS_STRIKEOUTS:
                    translationKey = 'player-props.strikeouts-over';
                    break;
                case BetType.PLAYER_PROPS_HOMERUNS:
                    translationKey = 'player-props.home-runs-over';
                    break;
                case BetType.PLAYER_PROPS_PASSING_YARDS:
                    translationKey = 'player-props.passing-yards-over';
                    break;
                case BetType.PLAYER_PROPS_RUSHING_YARDS:
                    translationKey = 'player-props.rushing-yards-over';
                    break;
                case BetType.PLAYER_PROPS_RECEIVING_YARDS:
                    translationKey = 'player-props.receiving-yards-over';
                    break;
                case BetType.PLAYER_PROPS_PASSING_TOUCHDOWNS:
                    translationKey = 'player-props.passing-touchdowns-over';
                    break;
                case BetType.PLAYER_PROPS_TOUCHDOWNS:
                    translationKey = 'player-props.touchdowns';
                    break;
                case BetType.PLAYER_PROPS_FIELD_GOALS_MADE:
                    translationKey = 'player-props.field-goals-made-over';
                    break;
                case BetType.PLAYER_PROPS_PITCHER_HITS_ALLOWED:
                    translationKey = 'player-props.pitcher-hits-allowed-over';
                    break;
                case BetType.PLAYER_PROPS_POINTS:
                    translationKey = 'player-props.points-over';
                    break;
                case BetType.PLAYER_PROPS_SHOTS:
                    translationKey = 'player-props.shots-over';
                    break;
                case BetType.PLAYER_PROPS_GOALS:
                    translationKey = 'player-props.goals';
                    break;
                case BetType.PLAYER_PROPS_HITS_RECORDED:
                    translationKey = 'player-props.hits-recorded-over';
                    break;
                case BetType.PLAYER_PROPS_REBOUNDS:
                    translationKey = 'player-props.rebounds-over';
                    break;
                case BetType.PLAYER_PROPS_ASSISTS:
                    translationKey = 'player-props.assists-over';
                    break;
                case BetType.PLAYER_PROPS_DOUBLE_DOUBLE:
                    translationKey = 'player-props.double-double-yes';
                    break;
                case BetType.PLAYER_PROPS_TRIPLE_DOUBLE:
                    translationKey = 'player-props.triple-double-yes';
                    break;
                case BetType.PLAYER_PROPS_RECEPTIONS:
                    translationKey = 'player-props.receptions-over';
                    break;
                case BetType.PLAYER_PROPS_3PTS_MADE:
                    translationKey = 'player-props.3pts-made-over';
                    break;
                case BetType.PLAYER_PROPS_FIRST_TOUCHDOWN:
                    translationKey = 'player-props.first-touchdown';
                    break;
                case BetType.PLAYER_PROPS_LAST_TOUCHDOWN:
                    translationKey = 'player-props.last-touchdown';
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
                case BetType.PLAYER_PROPS_STRIKEOUTS:
                    translationKey = 'player-props.strikeouts-under';
                    break;
                case BetType.PLAYER_PROPS_HOMERUNS:
                    translationKey = 'player-props.home-runs-under';
                    break;
                case BetType.PLAYER_PROPS_PASSING_YARDS:
                    translationKey = 'player-props.passing-yards-under';
                    break;
                case BetType.PLAYER_PROPS_RUSHING_YARDS:
                    translationKey = 'player-props.rushing-yards-under';
                    break;
                case BetType.PLAYER_PROPS_RECEIVING_YARDS:
                    translationKey = 'player-props.receiving-yards-under';
                    break;
                case BetType.PLAYER_PROPS_PASSING_TOUCHDOWNS:
                    translationKey = 'player-props.passing-touchdowns-under';
                    break;
                case BetType.PLAYER_PROPS_FIELD_GOALS_MADE:
                    translationKey = 'player-props.field-goals-made-under';
                    break;
                case BetType.PLAYER_PROPS_PITCHER_HITS_ALLOWED:
                    translationKey = 'player-props.pitcher-hits-allowed-under';
                    break;
                case BetType.PLAYER_PROPS_POINTS:
                    translationKey = 'player-props.points-under';
                    break;
                case BetType.PLAYER_PROPS_SHOTS:
                    translationKey = 'player-props.shots-under';
                    break;
                case BetType.PLAYER_PROPS_HITS_RECORDED:
                    translationKey = 'player-props.hits-recorded-under';
                    break;
                case BetType.PLAYER_PROPS_REBOUNDS:
                    translationKey = 'player-props.rebounds-under';
                    break;
                case BetType.PLAYER_PROPS_ASSISTS:
                    translationKey = 'player-props.assists-under';
                    break;
                case BetType.PLAYER_PROPS_DOUBLE_DOUBLE:
                    translationKey = 'player-props.double-double-no';
                    break;
                case BetType.PLAYER_PROPS_TRIPLE_DOUBLE:
                    translationKey = 'player-props.triple-double-no';
                    break;
                case BetType.PLAYER_PROPS_RECEPTIONS:
                    translationKey = 'player-props.receptions-under';
                    break;
                case BetType.PLAYER_PROPS_3PTS_MADE:
                    translationKey = 'player-props.3pts-made-under';
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
        team: market.playerName === null ? team : market.playerName,
        team2,
        spread,
        total,
        scoring: market.playerName === null ? scoring : market.playerPropsLine,
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
            position.market = market;
            position.market.isOneSideMarket = getIsOneSideMarket(Number(market.tags[0]));

            positions.push(position);
            markets.push(market);

            const quote = market.isCanceled || !parlayMarket.marketQuotes ? 1 : parlayMarket.marketQuotes[index];
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
    if (isPlayerProps(firstMarket.betType) || isPlayerProps(secondMarket.betType)) return false;
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

export const isPlayerProps = (betType: BetType) => {
    return PLAYER_PROPS_BET_TYPES.includes(betType);
};

export const isOneSidePlayerProps = (betType: BetType) => {
    return ONE_SIDER_PLAYER_PROPS_BET_TYPES.includes(betType);
};

export const isSpecialYesNoProp = (betType: BetType) => {
    return SPECIAL_YES_NO_BET_TYPES.includes(betType);
};

export const fixPlayerPropsLinesFromContract = (market: SportMarketInfo | MarketData) => {
    Number(market.playerPropsLine) % 1 == 0 ? (market.playerPropsLine = Number(market.playerPropsLine) / 100) : '';
};

export const getUpdatedQuote = (
    updateQuotes: number[],
    positionIndex: number,
    isCombinedPosition: boolean,
    combinedPositionsCount: number
) => {
    const startIndex = isCombinedPosition ? positionIndex * 2 : positionIndex;

    return isCombinedPosition
        ? updateQuotes?.[startIndex] * updateQuotes?.[startIndex + 1]
        : updateQuotes?.[combinedPositionsCount * 2 + startIndex];
};

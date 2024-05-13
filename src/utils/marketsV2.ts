import {
    BetTypeMap,
    BetTypeNameMap,
    GOLF_TOURNAMENT_WINNER_TAG,
    MATCH_RESOLVE_MAP,
    SCORING_MAP,
    SPORT_PERIODS_MAP,
} from 'constants/tags';
import { BetType, Position } from 'enums/markets';
import { ethers } from 'ethers';
import i18n from 'i18n';
import { SportMarket, Ticket, TicketMarket, TicketPosition, TradeData } from 'types/markets';
import { TAGS_FLAGS } from '../enums/tags';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import {
    getIsOneSideMarket,
    isBothsTeamsToScore,
    isCombinedPositions,
    isDoubleChance,
    isOneSidePlayerProps,
    isPeriod,
    isPeriod2,
    isPlayerProps,
    isSpecialYesNoProp,
    isSpread,
    isTotal,
    isTotalOddEven,
    isWinner,
} from './markets';

export const getSimpleSymbolText = (
    position: Position,
    betType: number,
    isCombinedPosition?: boolean,
    line?: number
) => {
    if (betType === BetType.SPREAD || betType === BetType.SPREAD2) return `H${position + 1}`;
    if (betType === BetType.TOTAL || betType === BetType.TOTAL2) {
        return isCombinedPosition && line
            ? position === 0
                ? Math.ceil(line).toString()
                : Math.floor(line).toString()
            : position === 0
            ? 'O'
            : 'U';
    }
    if (betType === BetType.DOUBLE_CHANCE) return position === 0 ? '1X' : position === 1 ? '12' : 'X2';

    return position === 0 ? '1' : position === 1 ? '2' : 'X';
};

// TODO: needs refactoring for generic logic
export const getCombinedPositionsSymbolText = (position: Position, market: SportMarket) => {
    const combinedPositions = market.selectedCombinedPositions || market.combinedPositions[position];
    if (!combinedPositions) return '';

    const position1 = combinedPositions[0];
    const position2 = combinedPositions[1];
    const position3 = combinedPositions[2];
    const position4 = combinedPositions[3];

    if (!position2 && market.typeId === BetType.GOALS)
        return `${position1.position === 0 ? '' : '0-'}${getSimpleSymbolText(
            position1.position,
            position1.typeId,
            true,
            position1.line
        )}${position1.position === 0 ? '+' : ''}`;

    let position3Text = '';

    if (!position4 && market.typeId === BetType.HALFTIME_FULLTIME_GOALS) {
        position3Text = `${position1.position === 0 ? '' : '0-'}${getSimpleSymbolText(
            position3.position,
            position3.typeId,
            true,
            position3.line
        )}${position3.position === 0 ? '+' : ''}`;
    }

    return `${getSimpleSymbolText(position1.position, position1.typeId, true, position1.line)}${
        market.typeId === BetType.HALFTIME_FULLTIME ||
        market.typeId === BetType.GOALS ||
        market.typeId === BetType.HALFTIME_FULLTIME_GOALS
            ? '-'
            : '&'
    }${getSimpleSymbolText(
        position2.position,
        position2.typeId,
        true,
        market.typeId === BetType.WINNER_TOTAL ? undefined : position2.line
    )}${market.typeId === BetType.HALFTIME_FULLTIME_GOALS ? '&' : ''}${
        !position4 && market.typeId === BetType.HALFTIME_FULLTIME_GOALS ? position3Text : ''
    }${
        position4 && market.typeId === BetType.HALFTIME_FULLTIME_GOALS
            ? `${getSimpleSymbolText(position3.position, position3.typeId, true, position3.line)}-${getSimpleSymbolText(
                  position4.position,
                  position4.typeId,
                  true,
                  position4.line
              )}`
            : ''
    }
    `;
};

export const getSymbolTextV2 = (position: Position, market: SportMarket) => {
    const betType = market.typeId;

    if (market.isOneSideMarket || market.isOneSidePlayerPropsMarket || market.isYesNoPlayerPropsMarket) {
        return position === 0 ? 'YES' : 'NO';
    }

    if (market.isPlayerPropsMarket) {
        return position === 0 ? 'O' : 'U';
    }

    if (
        betType === BetType.WINNER_TOTAL ||
        betType === BetType.HALFTIME_FULLTIME ||
        betType === BetType.GOALS ||
        betType === BetType.HALFTIME_FULLTIME_GOALS
    )
        return getCombinedPositionsSymbolText(position, market);

    return getSimpleSymbolText(position, betType);
};

export const getSimplePositionText = (
    betType: number,
    position: number,
    line: number,
    homeTeam: string,
    awayTeam: string,
    extendedText?: boolean
) => {
    if (
        getIsOneSideMarket(betType) ||
        isOneSidePlayerProps(betType) ||
        isSpecialYesNoProp(betType) ||
        isBothsTeamsToScore(betType)
    ) {
        return position === 0 ? 'Yes' : 'No';
    }

    if (isTotalOddEven(betType)) {
        return position === 0 ? 'Odd' : 'Even';
    }

    if (isPlayerProps(betType) || isTotal(betType) || isSpread(betType)) {
        return extendedText
            ? isSpread(betType)
                ? `${position === 0 ? homeTeam : awayTeam} (${getLineInfo(betType, position, line)})`
                : `${position === 0 ? 'Over' : 'Under'} ${getLineInfo(betType, position, line)}`
            : getLineInfo(betType, position, line);
    }

    if (isDoubleChance(betType))
        return position === 0
            ? `${homeTeam} or Draw`
            : position === 1
            ? `${homeTeam} or ${awayTeam}`
            : `${awayTeam} or Draw`;
    if (isWinner(betType)) return position === 0 ? homeTeam : position === 1 ? awayTeam : 'Draw';

    return position === 0 ? '1' : position === 1 ? '2' : 'X';
};

export const getCombinedPositionsText = (market: SportMarket, position: number) => {
    const combinedPositions = market.selectedCombinedPositions || market.combinedPositions[position];
    if (!combinedPositions) return '';

    const betType = market.typeId;

    const position1 = combinedPositions[0];
    const position2 = combinedPositions[1];
    if (betType === BetType.HALFTIME_FULLTIME) {
        return `${getSimplePositionText(
            position1.typeId,
            position1.position,
            position1.line,
            market.homeTeam,
            market.awayTeam,
            true
        )}/${getSimplePositionText(
            position2.typeId,
            position2.position,
            position2.line,
            market.homeTeam,
            market.awayTeam,
            true
        )}`;
    }

    if (betType === BetType.WINNER_TOTAL) {
        return `${getSimplePositionText(
            position1.typeId,
            position1.position,
            position1.line,
            market.homeTeam,
            market.awayTeam,
            true
        )} & ${getSimplePositionText(
            position2.typeId,
            position2.position,
            position2.line,
            market.homeTeam,
            market.awayTeam,
            true
        )}`;
    }
};

export const getPositionTextV2 = (market: SportMarket, position: number, extendedText?: boolean) => {
    return isCombinedPositions(market.typeId)
        ? getCombinedPositionsText(market, position)
        : getSimplePositionText(market.typeId, position, market.line, market.homeTeam, market.awayTeam, extendedText);
};

export const getTitleText = (market: SportMarket) => {
    const betType = market.typeId;
    const betTypeName = BetTypeNameMap[betType as BetType];

    let sufix = isPeriod(betType) ? ` ${SPORT_PERIODS_MAP[market.leagueId]}` : isPeriod2(betType) ? ' half' : '';

    if (
        (market.leagueId == TAGS_FLAGS.TENNIS_GS || market.leagueId == TAGS_FLAGS.TENNIS_MASTERS) &&
        (isTotal(betType) || isTotalOddEven(betType) || isSpread(betType))
    ) {
        sufix = `${sufix}${betType === BetType.TOTAL2 || betType === BetType.SPREAD2 ? ' (sets)' : ' (games)'}`;
    }

    return betTypeName ? `${betTypeName}${sufix}` : `${betType}`;
};

export const getSubtitleText = (market: SportMarket, position: Position) => {
    const betType = market.typeId;

    if (market.isPlayerPropsMarket || isTotal(betType)) {
        return position === 0 ? 'Over' : 'Under';
    }

    if (isSpread(betType)) return position === 0 ? market.homeTeam : market.awayTeam;

    return undefined;
};

export const getLineInfo = (typeId: number, position: Position, line: number) => {
    if (isSpread(typeId))
        return position === Position.HOME
            ? `${Number(line) > 0 ? '+' : '-'}${Math.abs(line)}`
            : `${Number(line) > 0 ? '-' : '+'}${Math.abs(line)}`;

    if (isTotal(typeId) || isPlayerProps(typeId)) return `${Number(line)}`;
    return undefined;
};

export const getCombinedPositionsLineInfo = (position: Position, market: SportMarket) => {
    const combinedPositions = market.selectedCombinedPositions || market.combinedPositions[position];
    if (!combinedPositions) return undefined;

    const position1 = combinedPositions[0];
    const position2 = combinedPositions[1];

    const position1LineInfo = getLineInfo(position1.typeId, position1.position, position1.line);

    const position2LineInfo = getLineInfo(position2.typeId, position2.position, position2.line);

    const lineInfo =
        position1LineInfo && position2LineInfo
            ? `${position1LineInfo}/${position2LineInfo}`
            : position1LineInfo || position2LineInfo;

    return lineInfo;
};

export const getLineInfoV2 = (market: SportMarket, position: Position) =>
    isCombinedPositions(market.typeId)
        ? getCombinedPositionsLineInfo(position, market)
        : getLineInfo(market.typeId, position, market.line);

export const getTooltipText = (typeId: number, position: Position, line: number, market: SportMarket) => {
    const team = market.isPlayerPropsMarket
        ? market.playerProps.playerName
        : position === Position.AWAY
        ? market.awayTeam
        : market.isOneSideMarket
        ? fixOneSideMarketCompetitorName(market.homeTeam)
        : market.homeTeam;
    const team2 = market.awayTeam;

    const scoring =
        SCORING_MAP[market.leagueId] !== ''
            ? i18n.t(`markets.market-card.odd-tooltip-v2.scoring.${SCORING_MAP[market.leagueId]}`)
            : '';
    const matchResolve =
        MATCH_RESOLVE_MAP[market.leagueId] !== ''
            ? i18n.t(`markets.market-card.odd-tooltip-v2.match-resolve.${MATCH_RESOLVE_MAP[market.leagueId]}`)
            : '';

    let translationKey = '';

    if (market.isOneSideMarket) {
        translationKey = market.leagueId == GOLF_TOURNAMENT_WINNER_TAG ? 'tournament-winner' : 'race-winner';
    } else if (typeId === BetType.SPREAD) {
        translationKey = line < 0 ? `spread-${position}` : `spread-${position === 1 ? 0 : 1}`;
    } else {
        translationKey = `${BetTypeMap[typeId as BetType]}-${position}`;
    }

    return i18n.t(`markets.market-card.odd-tooltip-v2.${translationKey}`, {
        team,
        team2,
        line: Math.abs(line),
        scoring,
        matchResolve,
    });
};

export const getCombinedPositionsOddTooltipText = (position: Position, market: SportMarket) => {
    const combinedPositions = market.selectedCombinedPositions || market.combinedPositions[position];
    if (!combinedPositions) return '';

    const position1 = combinedPositions[0];
    const position2 = combinedPositions[1];

    let tooltipText = '';

    let position1TooltipText = getTooltipText(position1.typeId, position1.position, position1.line, market);

    if (position1TooltipText.trim().endsWith('.')) {
        position1TooltipText = position1TooltipText.slice(0, -1);
    }

    tooltipText = position1TooltipText;
    if (position1TooltipText !== '') {
        tooltipText = `${tooltipText} ${i18n.t('markets.market-card.odd-tooltip.and')} `;
    }

    const position2TooltipText = getTooltipText(position2.typeId, position2.position, position2.line, market);

    tooltipText = `${tooltipText}${position2TooltipText.charAt(0).toLowerCase()}${position2TooltipText.slice(1)}`;

    return tooltipText;
};

export const getOddTooltipTextV2 = (position: Position, market: SportMarket) =>
    market.typeId === BetType.WINNER_TOTAL
        ? getCombinedPositionsOddTooltipText(position, market)
        : getTooltipText(market.typeId, position, market.line, market);

export const getTeamNameV2 = (market: SportMarket, position?: Position) => {
    if (market.isOneSideMarket) return fixOneSideMarketCompetitorName(market.homeTeam);
    if (market.isPlayerPropsMarket) return market.playerProps.playerName;
    return position === Position.HOME ? market.homeTeam : market.awayTeam;
};

export const getMatchLabel = (market: SportMarket) =>
    `${getTeamNameV2(market, 0)}${
        !market.isOneSideMarket && !market.isPlayerPropsMarket ? ` - ${getTeamNameV2(market, 1)}` : ''
    }`;
export const getPositionOddsV2 = (market: TicketMarket) => market.odd;

export const areSameCombinedPositions = (market: SportMarket, ticketPosition: TicketPosition) => {
    for (let i = 0; i < market.combinedPositions.length; i++) {
        for (let j = 0; j < market.combinedPositions[i].length; j++) {
            const marketCombinedPosition = market.combinedPositions[i][j];
            if (ticketPosition.combinedPositions[i] && ticketPosition.combinedPositions[i][j]) {
                const ticketCombinedPosition = ticketPosition.combinedPositions[i][j];
                if (
                    marketCombinedPosition.typeId !== ticketCombinedPosition.typeId ||
                    marketCombinedPosition.line !== ticketCombinedPosition.line ||
                    marketCombinedPosition.position !== ticketCombinedPosition.position
                ) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
};

export const isSameMarket = (market: SportMarket, ticketPosition: TicketPosition) =>
    market.gameId === ticketPosition.gameId &&
    market.leagueId === ticketPosition.leagueId &&
    market.typeId === ticketPosition.typeId &&
    market.playerProps.playerId === ticketPosition.playerId &&
    market.line === ticketPosition.line &&
    areSameCombinedPositions(market, ticketPosition);

export const getTradeData = (markets: TicketMarket[]): TradeData[] =>
    markets.map((market) => {
        return {
            gameId: market.gameId,
            sportId: market.subLeagueId,
            typeId: market.typeId,
            maturity: market.maturity,
            status: market.status,
            line: market.line * 100,
            playerId: market.playerProps.playerId,
            odds: market.odds.map((odd) => ethers.utils.parseEther(odd.toString()).toString()),
            merkleProof: market.proof,
            position: market.position,
            combinedPositions: market.combinedPositions.map((combinedPositions) =>
                combinedPositions.map((combinedPosition) => ({
                    typeId: combinedPosition.typeId,
                    position: combinedPosition.position,
                    line: combinedPosition.line * 100,
                }))
            ),
            live: market.live,
        };
    });

export const isOddValid = (odd: number) => odd < 1 && odd != 0;

export const isParlayWonV2 = (ticket: Ticket) =>
    ticket.sportMarkets.every((position) => position.position + 1 === position.finalResult || position.isCanceled);

export const isParlayLostV2 = (ticket: Ticket) =>
    ticket.sportMarkets.some(
        (position) => position.position + 1 !== position.finalResult && position.isResolved && !position.isCanceled
    );

export const isParlayOpenV2 = (ticket: Ticket) => {
    const parlayHasOpenMarkets = ticket.sportMarkets.some((position) => position.isOpen);
    return parlayHasOpenMarkets && !isParlayLostV2(ticket);
};

export const updateTotalQuoteAndPayout = (tickets: Ticket[]): Ticket[] => {
    const modifiedTickets = tickets.map((ticket: Ticket) => {
        let totalQuote = ticket.totalQuote;
        let payout = ticket.payout;

        if (ticket.isCancelled) {
            totalQuote = 1;
            payout = ticket.buyInAmount;
        } else {
            ticket.sportMarkets.forEach((market) => {
                if (market.isCanceled) {
                    totalQuote = totalQuote / market.odd;
                    payout = payout * market.odd;
                }
            });
        }

        return {
            ...ticket,
            totalQuote,
            payout,
        };
    });
    return modifiedTickets;
};

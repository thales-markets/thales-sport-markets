import { MarketTypeMap } from 'constants/marketTypes';
import { GOLF_TOURNAMENT_WINNER_TAG } from 'constants/tags';
import { MarketType } from 'enums/marketTypes';
import { Position } from 'enums/markets';
import { League } from 'enums/sports';
import { ethers } from 'ethers';
import i18n from 'i18n';
import { SportMarket, Ticket, TicketMarket, TicketPosition, TradeData } from 'types/markets';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import {
    getMarketTypeName,
    isAwayTeamMarket,
    isBothsTeamsToScoreMarket,
    isCombinedPositionsMarket,
    isDoubleChanceMarket,
    isHomeTeamMarket,
    isOneSideMarket,
    isOneSidePlayerPropsMarket,
    isPeriod2Market,
    isPeriodMarket,
    isPlayerPropsMarket,
    isSpreadMarket,
    isTotalMarket,
    isTotalOddEvenMarket,
    isWinnerMarket,
    isYesNoPlayerPropsMarket,
} from './markets';
import { getLeagueMatchResolveType, getLeaguePeriodType, getLeagueScoringType } from './sports';

export const getSimpleSymbolText = (
    position: Position,
    marketType: number,
    isCombinedPosition?: boolean,
    line?: number
) => {
    if (marketType === MarketType.SPREAD || marketType === MarketType.SPREAD2) return `H${position + 1}`;
    if (marketType === MarketType.TOTAL || marketType === MarketType.TOTAL2) {
        return isCombinedPosition && line
            ? position === 0
                ? Math.ceil(line).toString()
                : Math.floor(line).toString()
            : position === 0
            ? 'O'
            : 'U';
    }
    if (marketType === MarketType.DOUBLE_CHANCE) return position === 0 ? '1X' : position === 1 ? '12' : 'X2';

    return position === 0 ? '1' : position === 1 ? '2' : 'X';
};

export const getSimplePositionText = (
    marketType: number,
    position: number,
    line: number,
    homeTeam: string,
    awayTeam: string,
    extendedText?: boolean
) => {
    if (
        isOneSideMarket(marketType) ||
        isOneSidePlayerPropsMarket(marketType) ||
        isYesNoPlayerPropsMarket(marketType) ||
        isBothsTeamsToScoreMarket(marketType)
    ) {
        return position === 0 ? 'Yes' : 'No';
    }

    if (isTotalOddEvenMarket(marketType)) {
        return position === 0 ? 'Odd' : 'Even';
    }

    if (isPlayerPropsMarket(marketType) || isTotalMarket(marketType) || isSpreadMarket(marketType)) {
        return extendedText
            ? isSpreadMarket(marketType)
                ? `${position === 0 ? homeTeam : awayTeam} (${getLineInfo(marketType, position, line)})`
                : `${position === 0 ? 'Over' : 'Under'} ${getLineInfo(marketType, position, line)}`
            : getLineInfo(marketType, position, line);
    }

    if (isDoubleChanceMarket(marketType))
        return position === 0
            ? `${homeTeam} or Draw`
            : position === 1
            ? `${homeTeam} or ${awayTeam}`
            : `${awayTeam} or Draw`;
    if (isWinnerMarket(marketType)) return position === 0 ? homeTeam : position === 1 ? awayTeam : 'Draw';

    return position === 0 ? '1' : position === 1 ? '2' : 'X';
};

export const getCombinedPositionsText = (market: SportMarket, position: number) => {
    const combinedPositions = market.selectedCombinedPositions || market.combinedPositions[position];
    if (!combinedPositions) return '';

    const marketType = market.typeId;

    const position1 = combinedPositions[0];
    const position2 = combinedPositions[1];
    if (marketType === MarketType.HALFTIME_FULLTIME) {
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

    if (marketType === MarketType.WINNER_TOTAL) {
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
    return isCombinedPositionsMarket(market.typeId)
        ? getCombinedPositionsText(market, position)
        : getSimplePositionText(market.typeId, position, market.line, market.homeTeam, market.awayTeam, extendedText);
};

export const getTitleText = (market: SportMarket) => {
    const marketType = market.typeId as MarketType;
    const marketTypeName = getMarketTypeName(marketType);

    let sufix = isPeriodMarket(marketType)
        ? ` ${getLeaguePeriodType(market.leagueId)}`
        : isPeriod2Market(marketType)
        ? ' half'
        : '';

    if (
        (market.leagueId == League.TENNIS_GS || market.leagueId == League.TENNIS_MASTERS) &&
        (isTotalMarket(marketType) || isTotalOddEvenMarket(marketType) || isSpreadMarket(marketType))
    ) {
        sufix = `${sufix}${
            marketType === MarketType.TOTAL2 || marketType === MarketType.SPREAD2 ? ' (sets)' : ' (games)'
        }`;
    }

    if (isHomeTeamMarket(marketType)) {
        sufix = `${sufix} (${market.homeTeam})`;
    }
    if (isAwayTeamMarket(marketType)) {
        sufix = `${sufix} (${market.awayTeam})`;
    }

    return marketTypeName ? `${marketTypeName}${sufix}` : `${marketType}`;
};

export const getSubtitleText = (market: SportMarket, position: Position) => {
    const marketType = market.typeId;

    if ((market.isPlayerPropsMarket && !market.isYesNoPlayerPropsMarket) || isTotalMarket(marketType)) {
        return position === 0 ? 'Over' : 'Under';
    }

    if (isSpreadMarket(marketType)) return position === 0 ? market.homeTeam : market.awayTeam;

    return undefined;
};

export const getLineInfo = (typeId: number, position: Position, line: number) => {
    if (isSpreadMarket(typeId))
        return position === Position.HOME
            ? `${Number(line) > 0 ? '+' : '-'}${Math.abs(line)}`
            : `${Number(line) > 0 ? '-' : '+'}${Math.abs(line)}`;

    if (isTotalMarket(typeId) || isPlayerPropsMarket(typeId)) return `${Number(line)}`;
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
    isCombinedPositionsMarket(market.typeId)
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

    const scoringType = getLeagueScoringType(market.leagueId);
    const matchResolveType = getLeagueMatchResolveType(market.leagueId);

    const scoring = scoringType !== '' ? i18n.t(`markets.market-card.odd-tooltip-v2.scoring.${scoringType}`) : '';
    const matchResolve =
        matchResolveType !== '' ? i18n.t(`markets.market-card.odd-tooltip-v2.match-resolve.${matchResolveType}`) : '';

    let translationKey = '';

    if (market.isOneSideMarket) {
        translationKey = market.leagueId == GOLF_TOURNAMENT_WINNER_TAG ? 'tournament-winner' : 'race-winner';
    } else if (typeId === MarketType.SPREAD) {
        translationKey = line < 0 ? `spread-${position}` : `spread-${position === 1 ? 0 : 1}`;
    } else {
        translationKey = `${MarketTypeMap[typeId as MarketType]}-${position}`;
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
    market.typeId === MarketType.WINNER_TOTAL
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

export const updateTotalQuoteAndPayout = (tickets: Ticket[]): Ticket[] => {
    const modifiedTickets = tickets.map((ticket: Ticket) => {
        let totalQuote = ticket.totalQuote;
        let payout = ticket.payout;

        if (ticket.isCancelled) {
            totalQuote = 1;
            payout = ticket.buyInAmount;
        } else {
            ticket.sportMarkets.forEach((market) => {
                if (market.isCancelled) {
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

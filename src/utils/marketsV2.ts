import { secondsToMilliseconds } from 'date-fns';
import { MarketType } from 'enums/marketTypes';
import { GameStatus, Position } from 'enums/markets';
import { League } from 'enums/sports';
import { ethers } from 'ethers';
import _ from 'lodash';
import { SerializableSportMarket, SportMarket, Ticket, TicketMarket, TicketPosition, TradeData } from 'types/markets';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import {
    getMarketTypeDescription,
    getMarketTypeName,
    isAwayTeamMarket,
    isBothsTeamsToScoreMarket,
    isCombinedPositionsMarket,
    isDoubleChanceMarket,
    isFuturesMarket,
    isHomeTeamMarket,
    isOneSideMarket,
    isOneSidePlayerPropsMarket,
    isOnlyOverPlayerPropsMarket,
    isOtherYesNoMarket,
    isPeriod2Market,
    isPeriodMarket,
    isPlayerPropsMarket,
    isScoreMarket,
    isSpreadMarket,
    isTotalExactMarket,
    isTotalMarket,
    isTotalOddEvenMarket,
    isUfcSpecificMarket,
    isWinnerMarket,
    isYesNoPlayerPropsMarket,
} from './markets';
import { getLeaguePeriodType, getLeagueScoringType } from './sports';

const getUfcSpecificPositionText = (marketType: number, position: number, homeTeam: string, awayTeam: string) => {
    if (marketType === MarketType.WINNING_ROUND) {
        switch (position) {
            case 0:
                return 'Draw';
            case 1:
                return 'By decision';
            default:
                return `Round ${position - 1}`;
        }
    }
    if (marketType === MarketType.ENDING_METHOD) {
        switch (position) {
            case 0:
                return 'Draw';
            case 1:
                return 'By decision';
            case 2:
                return 'KO/TKO/DQ';
            case 3:
                return 'Submission';
            default:
                return '';
        }
    }
    if (marketType === MarketType.METHOD_OF_VICTORY) {
        switch (position) {
            case 0:
                return 'Draw';
            case 1:
                return `${homeTeam} (Decision)`;
            case 2:
                return `${homeTeam} (KO/TKO/DQ)`;
            case 3:
                return `${homeTeam} (Submission)`;
            case 4:
                return `${awayTeam} (Decision)`;
            case 5:
                return `${awayTeam} (KO/TKO/DQ)`;
            case 6:
                return `${awayTeam} (Submission)`;
            default:
                return '';
        }
    }
    return '';
};

const getSimplePositionText = (
    marketType: number,
    position: number,
    line: number,
    homeTeam: string,
    awayTeam: string,
    leagueId: League,
    extendedText?: boolean,
    positionNames?: string[],
    odds?: number[]
) => {
    if (isFuturesMarket(marketType) && positionNames && positionNames[position]) {
        return positionNames[position];
    }

    if (leagueId === League.US_ELECTION && positionNames && positionNames[position]) {
        const text = positionNames[position]
            .replaceAll('_', ' ')
            .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());

        return marketType >= MarketType.US_ELECTION_WINNING_PARTY_ARIZONA &&
            marketType <= MarketType.US_ELECTION_WINNING_PARTY_NORTH_CAROLINA
            ? text.split(' ')[marketType === MarketType.US_ELECTION_WINNING_PARTY_NORTH_CAROLINA ? 2 : 1]
            : text;
    }
    if (marketType === MarketType.CORRECT_SCORE && positionNames && positionNames[position]) {
        let text = (position < positionNames.length - 1
            ? positionNames[position].slice(positionNames[position].length - 3)
            : positionNames[position]
        )
            .replace('_', ':')
            .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
        text =
            position < 5
                ? `Draw ${text}`
                : position < 15
                ? `${homeTeam} ${text}`
                : position < 25
                ? `${awayTeam} ${text}`
                : text;
        return text;
    }
    if (isTotalExactMarket(marketType) && positionNames && positionNames[position]) {
        const text =
            position < positionNames.length - 3
                ? positionNames[position].slice(positionNames[position].length - 1)
                : positionNames[position].slice(positionNames[position].length - 2);
        return text;
    }
    if (
        isOneSideMarket(marketType) ||
        isOneSidePlayerPropsMarket(marketType) ||
        isYesNoPlayerPropsMarket(marketType) ||
        isBothsTeamsToScoreMarket(marketType) ||
        isOtherYesNoMarket(marketType)
    ) {
        return position === 0 ? 'Yes' : 'No';
    }

    if (isTotalOddEvenMarket(marketType)) {
        return position === 0 ? 'Odd' : 'Even';
    }

    if (isPlayerPropsMarket(marketType) || isTotalMarket(marketType) || isSpreadMarket(marketType)) {
        if (line === Infinity) {
            return '-';
        }
        return extendedText
            ? isSpreadMarket(marketType)
                ? `${position === 0 ? homeTeam : awayTeam} (${getLineInfo(marketType, position, line)})`
                : `${position === 0 ? 'Over' : 'Under'} ${getLineInfo(marketType, position, line)}`
            : isOnlyOverPlayerPropsMarket(marketType, odds || [])
            ? `Over ${getLineInfo(marketType, position, line)}`
            : getLineInfo(marketType, position, line);
    }

    if (isDoubleChanceMarket(marketType))
        return position === 0
            ? `${homeTeam} or Draw`
            : position === 1
            ? `${homeTeam} or ${awayTeam}`
            : `${awayTeam} or Draw`;
    if (isWinnerMarket(marketType)) {
        return position === 0 ? homeTeam : position === 1 ? awayTeam : 'Draw';
    }
    if (isScoreMarket(marketType)) {
        const scoringType = getLeagueScoringType(leagueId);
        const sufix = scoringType.length > 1 ? ` ${scoringType.slice(0, scoringType.length - 1)}` : scoringType;
        return position === 0 ? homeTeam : position === 1 ? awayTeam : `No ${sufix}`;
    }

    if (isUfcSpecificMarket(marketType)) {
        return getUfcSpecificPositionText(marketType, position, homeTeam, awayTeam);
    }

    return position === 0 ? '1' : position === 1 ? '2' : 'X';
};

const getCombinedPositionsText = (market: SportMarket, position: number) => {
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
            market.leagueId,
            true
        )}/${getSimplePositionText(
            position2.typeId,
            position2.position,
            position2.line,
            market.homeTeam,
            market.awayTeam,
            market.leagueId,
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
            market.leagueId,
            true
        )} & ${getSimplePositionText(
            position2.typeId,
            position2.position,
            position2.line,
            market.homeTeam,
            market.awayTeam,
            market.leagueId,
            true
        )}`;
    }
};

export const getPositionTextV2 = (market: SportMarket, position: number, extendedText?: boolean) => {
    return isCombinedPositionsMarket(market.typeId)
        ? getCombinedPositionsText(market, position)
        : getSimplePositionText(
              market.typeId,
              position,
              market.line,
              market.homeTeam,
              market.awayTeam,
              market.leagueId,
              extendedText,
              market.positionNames,
              market.odds
          );
};

export const getTitleText = (market: SportMarket, useDescription?: boolean) => {
    const marketType = market.typeId as MarketType;
    const scoringType = getLeagueScoringType(market.leagueId);
    const marketTypeDescription = getMarketTypeDescription(marketType);
    const marketTypeName =
        useDescription && marketTypeDescription
            ? marketTypeDescription
            : market.leagueId === League.UEFA_SUPER_CUP && marketType === MarketType.WHO_WILL_QUALIFY
            ? 'To win the cup'
            : getMarketTypeName(marketType);

    let sufix = isPeriodMarket(marketType)
        ? ` ${getLeaguePeriodType(market.leagueId)}`
        : isPeriod2Market(marketType)
        ? market.leagueId == League.MLB
            ? ' half (1st 5 innings)'
            : ' half'
        : '';

    if (
        (market.leagueId == League.TENNIS_WTA ||
            market.leagueId == League.TENNIS_GS ||
            market.leagueId == League.TENNIS_MASTERS ||
            market.leagueId == League.SUMMER_OLYMPICS_TENNIS) &&
        (isTotalMarket(marketType) || isTotalOddEvenMarket(marketType) || isSpreadMarket(marketType))
    ) {
        sufix = `${sufix}${
            marketType === MarketType.TOTAL2 || marketType === MarketType.SPREAD2 ? ' (sets)' : ' (games)'
        }`;
    }

    if (
        (market.leagueId == League.SUMMER_OLYMPICS_VOLEYBALL ||
            market.leagueId == League.SUMMER_OLYMPICS_VOLEYBALL_WOMEN) &&
        (isTotalMarket(marketType) || isTotalOddEvenMarket(marketType) || isSpreadMarket(marketType))
    ) {
        sufix = `${sufix}${
            marketType === MarketType.TOTAL2 || marketType === MarketType.SPREAD2 ? ' (sets)' : ' (points)'
        }`;
    }

    if (
        market.leagueId == League.UFC &&
        (isTotalMarket(marketType) || isTotalOddEvenMarket(marketType) || isSpreadMarket(marketType))
    ) {
        sufix = `${sufix}${
            marketType === MarketType.TOTAL2 || marketType === MarketType.SPREAD2 ? ' (points)' : ' (rounds)'
        }`;
    }

    if (
        market.leagueId == League.SUMMER_OLYMPICS_TABLE_TENNIS &&
        (isTotalMarket(marketType) || isTotalOddEvenMarket(marketType) || isSpreadMarket(marketType))
    ) {
        sufix = `${sufix}${
            marketType === MarketType.TOTAL2 || marketType === MarketType.SPREAD2 ? ' (sets)' : ' (points)'
        }`;
    }

    if (isHomeTeamMarket(marketType)) {
        sufix = `${sufix}${isTotalExactMarket(marketType) ? ` ${scoringType}` : ''} (${market.homeTeam})`;
    }
    if (isAwayTeamMarket(marketType)) {
        sufix = `${sufix}${isTotalExactMarket(marketType) ? ` ${scoringType}` : ''} (${market.awayTeam})`;
    }
    if (isScoreMarket(marketType)) {
        sufix = scoringType.length > 1 ? ` ${scoringType.slice(0, scoringType.length - 1)}` : scoringType;
    }

    return marketTypeName ? `${marketTypeName}${sufix}` : `${marketType}`;
};

export const getSubtitleText = (market: SportMarket, position: Position) => {
    const marketType = market.typeId;

    if (
        (market.isPlayerPropsMarket &&
            !isOnlyOverPlayerPropsMarket(marketType, market.odds) &&
            !market.isYesNoPlayerPropsMarket &&
            !market.isOneSidePlayerPropsMarket) ||
        isTotalMarket(marketType)
    ) {
        return position === 0 ? 'Over' : 'Under';
    }

    if (isSpreadMarket(marketType)) return position === 0 ? market.homeTeam : market.awayTeam;

    return undefined;
};

const getLineInfo = (typeId: number, position: Position, line: number) => {
    if (isSpreadMarket(typeId))
        return position === Position.HOME
            ? `${Number(line) > 0 ? '+' : '-'}${Math.abs(line)}`
            : `${Number(line) > 0 ? '-' : '+'}${Math.abs(line)}`;

    if (isTotalMarket(typeId) || isPlayerPropsMarket(typeId)) return `${Number(line)}`;
    return undefined;
};

export const getTeamNameV2 = (market: SportMarket | TicketPosition, position?: Position) => {
    if (market.isOneSideMarket) return fixOneSideMarketCompetitorName(market.homeTeam);
    if (market.isPlayerPropsMarket) return market.playerProps.playerName;
    return position === Position.HOME ? market.homeTeam : market.awayTeam;
};

export const getMatchLabel = (market: SportMarket | TicketPosition) =>
    `${getTeamNameV2(market, 0)}${
        !market.isOneSideMarket && !market.isPlayerPropsMarket ? ` - ${getTeamNameV2(market, 1)}` : ''
    }`;

export const getMatchTeams = (market: SportMarket | TicketPosition) => `${market.homeTeam} - ${market.awayTeam}`;

const areSameCombinedPositions = (market: SportMarket | TicketPosition, ticketPosition: TicketPosition) => {
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

export const isSameMarket = (market: SportMarket | TicketPosition, ticketPosition: TicketPosition) =>
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

export const showLiveInfo = (status: GameStatus | undefined, period: number | undefined) => {
    return (
        status !== GameStatus.RUNDOWN_FINAL &&
        status !== GameStatus.RUNDOWN_FULL_TIME &&
        status !== GameStatus.RUNDOWN_POSTPONED &&
        status !== GameStatus.RUNDOWN_CANCELED &&
        status !== GameStatus.RUNDOWN_DELAYED &&
        status !== GameStatus.RUNDOWN_RAIN_DELAY &&
        status !== GameStatus.RUNDOWN_ABANDONED &&
        status !== GameStatus.RUNDOWN_SCHEDULED &&
        status !== GameStatus.RUNDOWN_PRE_FIGHT &&
        status !== GameStatus.RUNDOWN_FIGHTERS_WALKING &&
        status !== GameStatus.RUNDOWN_FIGHTERS_INTRODUCTION &&
        status !== GameStatus.RUNDOWN_END_OF_ROUND &&
        status !== GameStatus.RUNDOWN_END_OF_FIGHT &&
        status !== GameStatus.OPTICODDS_COMPLETED &&
        status !== GameStatus.OPTICODDS_CANCELLED &&
        status !== GameStatus.OPTICODDS_DELAYED &&
        status !== GameStatus.OPTICODDS_SUSPENDED &&
        (!Number.isNaN(Number(period)) ||
            status === GameStatus.RUNDOWN_HALF_TIME ||
            status === GameStatus.OPTICODDS_HALF)
    );
};

export const showGameScore = (status: GameStatus | undefined) => {
    return (
        status !== GameStatus.RUNDOWN_POSTPONED &&
        status !== GameStatus.RUNDOWN_CANCELED &&
        status !== GameStatus.RUNDOWN_DELAYED &&
        status !== GameStatus.RUNDOWN_RAIN_DELAY &&
        status !== GameStatus.RUNDOWN_ABANDONED &&
        status !== GameStatus.RUNDOWN_SCHEDULED &&
        status !== GameStatus.RUNDOWN_PRE_FIGHT &&
        status !== GameStatus.RUNDOWN_FIGHTERS_WALKING &&
        status !== GameStatus.RUNDOWN_FIGHTERS_INTRODUCTION &&
        status !== GameStatus.RUNDOWN_END_OF_ROUND &&
        status !== GameStatus.RUNDOWN_END_OF_FIGHT &&
        status !== GameStatus.ENETPULSE_INTERRUPTED &&
        status !== GameStatus.ENETPULSE_CANCELED &&
        status !== GameStatus.OPTICODDS_CANCELLED &&
        status !== GameStatus.OPTICODDS_DELAYED &&
        status !== GameStatus.OPTICODDS_SUSPENDED
    );
};

export const ticketMarketAsTicketPosition = (market: TicketMarket) => {
    return {
        gameId: market.gameId,
        leagueId: market.leagueId,
        typeId: market.typeId,
        playerId: market.playerProps.playerId,
        playerName: market.playerProps.playerName,
        line: market.line,
        position: market.position,
        combinedPositions: market.combinedPositions,
        live: market.live,
    } as TicketPosition;
};

export const sportMarketAsSerializable = (market: SportMarket): SerializableSportMarket => {
    const serializableChildMarkets = market.childMarkets
        ? market.childMarkets.map((childMarket) => _.omit(childMarket, 'maturityDate'))
        : market.childMarkets;
    const serializableMarket = {
        ..._.omit(market, 'maturityDate'),
        childMarkets: serializableChildMarkets,
    };
    return serializableMarket;
};

export const serializableSportMarketAsSportMarket = (market: SerializableSportMarket): SportMarket => {
    const childMarkets = market.childMarkets
        ? market.childMarkets.map((childMarket) => ({
              ...childMarket,
              maturityDate: new Date(secondsToMilliseconds(childMarket.maturity)),
          }))
        : market.childMarkets;
    const sportMarket = {
        ...market,
        maturityDate: new Date(secondsToMilliseconds(market.maturity)),
        childMarkets,
    } as SportMarket;

    return sportMarket;
};

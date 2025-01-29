import { Position } from 'enums/markets';
import { MarketType } from 'enums/marketTypes';
import { TicketMarket } from 'types/markets';
import {
    isBothsTeamsToScoreMarket,
    isCombinedPositionsMarket,
    isPlayerPropsMarket,
    isSpreadMarket,
    isTotalExactMarket,
    isTotalMarket,
    isTotalOddEvenMarket,
    isWinnerMarket,
} from './markets';
import { getLineInfo } from './marketsV2';

export const getOpticOddsParamName = (market: TicketMarket) => {
    let paramName = '';

    const teamName = market.position === Position.HOME ? market.homeTeam : market.awayTeam;
    const lineInfo = getLineInfo(market.typeId, market.position, market.line);

    if (isWinnerMarket(market.typeId)) {
        paramName = market.position === Position.DRAW ? 'Draw' : teamName;
    } else if (isTotalMarket(market.typeId)) {
        paramName = `${teamName} ${market.position === Position.HOME ? 'Over' : 'Under'} ${lineInfo}`;
    } else if (isTotalOddEvenMarket(market.typeId)) {
        paramName = market.position === Position.HOME ? 'Odd' : 'Even';
    } else if (isPlayerPropsMarket(market.typeId)) {
        paramName = `${market.playerProps.playerName} ${
            market.position === Position.HOME ? 'Over' : 'Under'
        } ${lineInfo}`;
    } else if (isSpreadMarket(market.typeId)) {
        paramName = `${teamName} ${lineInfo}`;
    } else if (isCombinedPositionsMarket(market.typeId) && market.typeId !== MarketType.WINNER_TOTAL) {
        const combinedPositions = market.selectedCombinedPositions || market.combinedPositions[market.position];
        const position1 = combinedPositions[0].position;
        const position2 = combinedPositions[1].position;

        const name1 =
            position1 === Position.DRAW ? 'Draw' : position1 === Position.HOME ? market.homeTeam : market.awayTeam;
        const name2 =
            position2 === Position.DRAW ? 'Draw' : position2 === Position.HOME ? market.homeTeam : market.awayTeam;

        paramName = `${name1} :: ${name2}`;
    } else if (isBothsTeamsToScoreMarket(market.typeId)) {
        paramName = market.position === Position.HOME ? 'Yes' : 'No';
    } else if (
        market.typeId === MarketType.CORRECT_SCORE &&
        market.positionNames &&
        market.positionNames[market.position]
    ) {
        const position = market.positionNames[market.position];
        const lastIndex = position.lastIndexOf('_');

        paramName = position.slice(0, lastIndex).replaceAll('_', ' ') + position.slice(lastIndex).replace('_', ':');
    } else if (isTotalExactMarket(market.typeId) && market.positionNames && market.positionNames[market.position]) {
        paramName = market.positionNames[market.position].replaceAll('_', ' ');
    }

    return encodeURIComponent(paramName);
};

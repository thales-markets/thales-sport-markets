import { Position } from 'enums/markets';
import { TicketMarket } from 'types/markets';
import {
    isOnlyOverPlayerPropsMarket,
    isPlayerPropsMarket,
    isSpreadMarket,
    isTotalMarket,
    isWinnerMarket,
} from './markets';
import { getLineInfo } from './marketsV2';

export const getOpticOddsParamName = (market: TicketMarket) => {
    const teamName = market.position === Position.HOME ? market.homeTeam : market.awayTeam;
    const lineInfo = getLineInfo(market.typeId, market.position, market.line);

    if (isWinnerMarket(market.typeId)) {
        return market.position === Position.DRAW ? 'Draw' : teamName;
    }
    if (isTotalMarket(market.typeId)) {
        return `${teamName} ${market.position === Position.HOME ? 'Over' : 'Under'} ${lineInfo}`;
    }
    if (isPlayerPropsMarket(market.typeId)) {
        return isOnlyOverPlayerPropsMarket(market.typeId, market.odds || [])
            ? `Over ${lineInfo}`
            : `${market.playerProps.playerName} ${market.position === Position.HOME ? 'Over' : 'Under'} ${lineInfo}`;
    }
    if (isSpreadMarket(market.typeId)) {
        return `${teamName} ${lineInfo}`;
    }
    return '';
};

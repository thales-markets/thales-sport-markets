import { BetTypeMap, SPORTS_MAP } from 'constants/tags';
import { BetType, OddsType } from 'enums/markets';
import { t } from 'i18next';
import { bigNumberFormatter, coinFormatter, formatDateWithTime } from 'thales-utils';
import { CombinedPosition, Team, Ticket, TicketMarket } from 'types/markets';
import { TicketMarketStatus } from '../enums/tickets';
import {
    formatMarketOdds,
    getIsOneSideMarket,
    isOneSidePlayerProps,
    isPlayerProps,
    isSpecialYesNoProp,
} from './markets';

export const mapTicket = (ticket: any, networkId: number, teamNames: any): Ticket => {
    const mappedTicket: Ticket = {
        id: ticket.id,
        txHash: '',
        timestamp: Number(ticket.createdAt) * 1000,
        account: ticket.ticketOwner,
        buyInAmount: coinFormatter(ticket.buyInAmount, networkId),
        buyInAmountAfterFees: coinFormatter(ticket.buyInAmountAfterFees, networkId),
        totalQuote: bigNumberFormatter(ticket.totalQuote),
        payout: coinFormatter(ticket.buyInAmountAfterFees, networkId) / bigNumberFormatter(ticket.totalQuote),
        numOfMarkets: Number(ticket.numOfGames),
        expiry: Number(ticket.expiry) * 1000,
        isResolved: ticket.resolved,
        isPaused: ticket.paused,
        isCancelled: ticket.marketsResult.every(
            (marketResult: any) => Number(marketResult.status) === TicketMarketStatus.Cancelled
        ),
        isLost: ticket.isLost,
        isUserTheWinner: ticket.isUserTheWinner,
        isExercisable: ticket.isExercisable,
        isClaimable: ticket.isUserTheWinner && !ticket.resolved,
        isOpen: !ticket.resolved && !ticket.isExercisable,

        sportMarkets: ticket.marketsData.map((market: any, index: number) => {
            const leagueId = Number(market.sportId);
            // const isEnetpulseSport = ENETPULSE_SPORTS.includes(leagueId);
            const typeId = Number(market.typeId);
            const isPlayerPropsMarket = isPlayerProps(typeId);
            const type = BetTypeMap[typeId as BetType];
            const line = Number(market.line);

            const homeTeam = !!teamNames[market.gameId] && teamNames[market.gameId].find((team: Team) => team.isHome);
            const homeTeamName = homeTeam ? homeTeam.name : 'Home Team';
            const awayTeam = !!teamNames[market.gameId] && teamNames[market.gameId].find((team: Team) => !team.isHome);
            const awayTeamName = awayTeam ? awayTeam.name : 'Away Team';

            const marketResult = ticket.marketsResult[index];
            const marketStatus = Number(marketResult.status);

            return {
                gameId: market.gameId,
                sport: SPORTS_MAP[leagueId],
                leagueId: leagueId,
                // leagueName: getLeagueNameById(leagueId),
                leagueName: '',
                typeId: typeId,
                type: type,
                maturity: Number(market.maturity) * 1000,
                maturityDate: new Date(market.maturity * 1000),
                homeTeam: homeTeamName,
                awayTeam: awayTeamName,
                homeScore: Number(marketResult.results[0]),
                awayScore: Number(marketResult.results[0]),
                finalResult: Number(marketResult.results[0]),
                status: 0,
                isOpen: marketStatus === TicketMarketStatus.Open,
                isResolved: marketStatus !== TicketMarketStatus.Open,
                isCanceled: marketStatus === TicketMarketStatus.Cancelled,
                isWinning: marketStatus === TicketMarketStatus.Winning,
                isPaused: false,
                isOneSideMarket: getIsOneSideMarket(leagueId),
                spread: line / 100,
                total: line / 100,
                line: line / 100,
                isPlayerPropsMarket: isPlayerPropsMarket,
                isOneSidePlayerPropsMarket: isOneSidePlayerProps(typeId),
                isYesNoPlayerPropsMarket: isSpecialYesNoProp(typeId),
                playerProps: {
                    playerId: Number(market.playerId),
                    playerName: 'Player Name',
                    line: line / 100,
                    outcome: isPlayerPropsMarket ? Number(marketResult.results[0]) : 0,
                    score: isPlayerPropsMarket ? Number(marketResult.results[0]) : 0,
                },
                combinedPositions: [],
                odds: [],
                proof: [],
                selectedCombinedPositions: market.combinedPositions.map((combinedPosition: CombinedPosition) => ({
                    typeId: combinedPosition.typeId,
                    position: combinedPosition.position,
                    line: combinedPosition.line / 100,
                })),

                position: Number(market.position),
                odd: bigNumberFormatter(market.odd),
            };
        }),
    };

    return mappedTicket;
};

export const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) {
        if (market.isPlayerPropsMarket) {
            return market.playerProps.score;
        }
        return `${market.homeScore} : ${market.awayScore}`;
    }
    return formatDateWithTime(Number(market.maturityDate));
};

export const getTicketQuote = (paid: number, payout: number) => 1 / (payout / paid);

export const formatTicketOdds = (oddsType: OddsType, paid: number, payout: number) =>
    formatMarketOdds(oddsType, getTicketQuote(paid, payout));

export const isWinningTicketMarket = (market: TicketMarket) => market.position + 1 === market.finalResult;

export const getTicketMarketWinStatus = (market: TicketMarket) =>
    market.isResolved && !market.isCanceled
        ? // win only if not canceled
          isWinningTicketMarket(market)
        : // open or canceled
          undefined;

export const getTicketMarketOdd = (market: TicketMarket) => (market.isCanceled ? 1 : market.odd);

import { MarketTypeMap } from 'constants/marketTypes';
import { MarketType } from 'enums/marketTypes';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import { bigNumberFormatter, coinFormatter, formatDateWithTime } from 'thales-utils';
import { CombinedPosition, Team, Ticket, TicketMarket } from 'types/markets';
import { League } from '../enums/sports';
import { TicketMarketStatus } from '../enums/tickets';
import { getCollateralByAddress } from './collaterals';
import {
    formatMarketOdds,
    isOneSideMarket,
    isOneSidePlayerPropsMarket,
    isPlayerPropsMarket,
    isYesNoPlayerPropsMarket,
} from './markets';

export const mapTicket = (ticket: any, networkId: number, gamesInfo: any, playersInfo: any): Ticket => {
    const collateral = getCollateralByAddress(ticket.collateral, networkId);
    const mappedTicket: Ticket = {
        id: ticket.id,
        txHash: '',
        timestamp: Number(ticket.createdAt) * 1000,
        collateral,
        account: ticket.ticketOwner,
        buyInAmount: coinFormatter(ticket.buyInAmount, networkId, collateral),
        fees: coinFormatter(ticket.fees, networkId),
        totalQuote: bigNumberFormatter(ticket.totalQuote),
        payout: coinFormatter(ticket.buyInAmount, networkId, collateral) / bigNumberFormatter(ticket.totalQuote),
        numOfMarkets: Number(ticket.numOfMarkets),
        expiry: Number(ticket.expiry) * 1000,
        isResolved: ticket.resolved,
        isPaused: ticket.paused,
        isCancelled: ticket.marketsResult.every(
            (marketResult: any) => Number(marketResult.status) === TicketMarketStatus.CANCELLED
        ),
        isLost: ticket.isLost,
        isUserTheWinner: ticket.isUserTheWinner,
        isExercisable: ticket.isExercisable,
        isClaimable: ticket.isUserTheWinner && !ticket.resolved,
        isOpen: !ticket.resolved && !ticket.isExercisable,
        finalPayout: coinFormatter(ticket.finalPayout, networkId, collateral),
        isLive: ticket.isLive,

        sportMarkets: ticket.marketsData.map(
            (market: any, index: number): TicketMarket => {
                const leagueId = `${market.sportId}`.startsWith('153')
                    ? League.TENNIS_GS
                    : `${market.sportId}`.startsWith('156')
                    ? League.TENNIS_MASTERS
                    : market.sportId === 701 || market.sportId == 702
                    ? League.UFC
                    : Number(market.sportId);
                // const isEnetpulseSport = ENETPULSE_SPORTS.includes(leagueId);
                const typeId = Number(market.typeId);
                const isPlayerProps = isPlayerPropsMarket(typeId);
                const type = MarketTypeMap[typeId as MarketType];
                const line = Number(market.line);

                const homeTeam =
                    !!gamesInfo[market.gameId] && gamesInfo[market.gameId].find((team: Team) => team.isHome);
                const homeTeamName = homeTeam ? homeTeam.name : 'Home Team';
                const homeScore = homeTeam ? homeTeam.score : 0;
                const homeScoreByPeriod = homeTeam ? homeTeam.homeScoreByPeriod : [];

                const awayTeam =
                    !!gamesInfo[market.gameId] && gamesInfo[market.gameId].find((team: Team) => !team.isHome);
                const awayTeamName = awayTeam ? awayTeam.name : 'Away Team';
                const awayScore = awayTeam ? awayTeam.score : 0;
                const awayScoreByPeriod = awayTeam ? awayTeam.awayScoreByPeriod : [];

                const playerName =
                    isPlayerProps && playersInfo[market.playerId]
                        ? playersInfo[market.playerId].playerName
                        : 'Player Name';

                const marketResult = ticket.marketsResult[index];
                const marketStatus = Number(marketResult.status);

                return {
                    gameId: market.gameId,
                    // sport: getLeagueSport(leagueId),
                    sport: 'Soccer',
                    leagueId: leagueId,
                    subLeagueId: Number(market.sportId),
                    // leagueName: getLeagueNameById(leagueId),
                    leagueName: '',
                    typeId: typeId,
                    type: type.key,
                    maturity: Number(market.maturity) * 1000,
                    maturityDate: new Date(market.maturity * 1000),
                    homeTeam: homeTeamName,
                    awayTeam: awayTeamName,
                    homeScore: isPlayerProps
                        ? isOneSidePlayerPropsMarket(typeId) || isYesNoPlayerPropsMarket(typeId)
                            ? Number(marketResult.results[0]) / 100 === 1
                                ? 'Yes'
                                : 'No'
                            : Number(marketResult.results[0]) / 100
                        : homeScore,
                    homeScoreByPeriod,
                    awayScore: isPlayerProps ? 0 : awayScore,
                    awayScoreByPeriod,
                    status: 0,
                    isOpen: marketStatus === TicketMarketStatus.OPEN,
                    isResolved: marketStatus !== TicketMarketStatus.OPEN,
                    isCanceled: marketStatus === TicketMarketStatus.CANCELLED,
                    isWinning: marketStatus === TicketMarketStatus.WINNING,
                    isPaused: false,
                    isOneSideMarket: isOneSideMarket(leagueId),
                    line: line / 100,
                    isPlayerPropsMarket: isPlayerProps,
                    isOneSidePlayerPropsMarket: isOneSidePlayerPropsMarket(typeId),
                    isYesNoPlayerPropsMarket: isYesNoPlayerPropsMarket(typeId),
                    playerProps: {
                        playerId: Number(market.playerId),
                        playerName: playerName,
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
                    childMarkets: [],
                    winningPositions: [],
                };
            }
        ),
    };

    return mappedTicket;
};

export const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) {
        if (market.isPlayerPropsMarket) {
            return market.homeScore;
        }
        return `${market.homeScore} : ${market.awayScore}`;
    }
    return formatDateWithTime(Number(market.maturityDate));
};

export const getTicketQuote = (paid: number, payout: number) => 1 / (payout / paid);

export const formatTicketOdds = (oddsType: OddsType, paid: number, payout: number) =>
    formatMarketOdds(oddsType, getTicketQuote(paid, payout));

export const getTicketMarketOdd = (market: TicketMarket) => (market.isCanceled ? 1 : market.odd);

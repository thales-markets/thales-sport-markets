import { MarketTypeMap } from 'constants/marketTypes';
import { MarketType } from 'enums/marketTypes';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import { Coins, bigNumberFormatter, coinFormatter, formatDateWithTime } from 'thales-utils';
import { CombinedPosition, Team, Ticket, TicketMarket } from 'types/markets';
import { CRYPTO_CURRENCY_MAP } from '../constants/currency';
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
import { getLeagueSport } from './sports';

export const mapTicket = (
    ticket: any,
    networkId: number,
    gamesInfo: any,
    playersInfo: any,
    liveScores: any
): Ticket => {
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

                const gameInfo = gamesInfo[market.gameId];
                const liveScore = liveScores[market.gameId];

                const homeTeam = !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => team.isHome);
                const homeTeamName = homeTeam?.name ?? 'Home Team';
                const homeScore = homeTeam?.score;
                const homeScoreByPeriod = homeTeam ? homeTeam.scoreByPeriod : [];

                const awayTeam = !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => !team.isHome);
                const awayTeamName = awayTeam?.name ?? 'Away Team';
                const awayScore = awayTeam?.score;
                const awayScoreByPeriod = awayTeam ? awayTeam.scoreByPeriod : [];

                const playerName =
                    isPlayerProps && playersInfo[market.playerId]
                        ? playersInfo[market.playerId].playerName
                        : 'Player Name';

                const marketResult = ticket.marketsResult[index];
                const marketStatus = Number(marketResult.status);

                return {
                    gameId: market.gameId,
                    sport: getLeagueSport(leagueId),
                    leagueId: leagueId,
                    subLeagueId: Number(market.sportId),
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
                    isCancelled: marketStatus === TicketMarketStatus.CANCELLED,
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
                    isGameFinished: gameInfo?.isGameFinished,
                    gameStatus: gameInfo?.gameStatus,
                    liveScore,
                };
            }
        ),
    };

    return mappedTicket;
};

export const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCancelled) return t('profile.card.canceled');
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

export const getTicketMarketOdd = (market: TicketMarket) => (market.isCancelled ? 1 : market.odd);

export const getAddedPayoutMultiplier = (currencyKey: Coins) => (currencyKey === CRYPTO_CURRENCY_MAP.THALES ? 0.99 : 1);

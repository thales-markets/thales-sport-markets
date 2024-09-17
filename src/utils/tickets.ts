import { MarketTypeMap } from 'constants/marketTypes';
import { secondsToMilliseconds } from 'date-fns';
import { MarketType } from 'enums/marketTypes';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import { bigNumberFormatter, coinFormatter, formatDateWithTime } from 'thales-utils';
import { CombinedPosition, Team, Ticket, TicketMarket } from 'types/markets';
import { SupportedNetwork } from 'types/network';
import positionNamesMap from '../assets/json/positionNamesMap.json';
import { CRYPTO_CURRENCY_MAP } from '../constants/currency';
import { THALES_ADDED_PAYOUT_PERCENTAGE } from '../constants/markets';
import { UFC_LEAGUE_IDS } from '../constants/sports';
import { League } from '../enums/sports';
import { TicketMarketStatus } from '../enums/tickets';
import { Coins } from '../thales-utils';
import { getCollateralByAddress } from './collaterals';
import freeBetHolder from './contracts/freeBetHolder';
import stakingThalesBettingProxy from './contracts/stakingThalesBettingProxy';
import {
    formatMarketOdds,
    isOneSideMarket,
    isOneSidePlayerPropsMarket,
    isPlayerPropsMarket,
    isYesNoPlayerPropsMarket,
} from './markets';
import { getLeagueSport } from './sports';
import { secondsToMilliseconds } from 'date-fns';

export const mapTicket = (
    ticket: any,
    networkId: number,
    gamesInfo: any,
    playersInfo: any,
    liveScores: any
): Ticket => {
    let collateral = getCollateralByAddress(ticket.collateral, networkId);
    collateral =
        collateral === CRYPTO_CURRENCY_MAP.sTHALES &&
        ticket.ticketOwner.toLowerCase() !==
            stakingThalesBettingProxy.addresses[networkId as SupportedNetwork].toLowerCase()
            ? (CRYPTO_CURRENCY_MAP.THALES as Coins)
            : collateral;
    const mappedTicket: Ticket = {
        id: ticket.id,
        txHash: '',
        timestamp: secondsToMilliseconds(Number(ticket.createdAt)),
        collateral,
        account: ticket.ticketOwner,
        buyInAmount: coinFormatter(ticket.buyInAmount, networkId, collateral),
        fees: coinFormatter(ticket.fees, networkId, collateral),
        totalQuote: bigNumberFormatter(ticket.totalQuote),
        payout: coinFormatter(ticket.buyInAmount, networkId, collateral) / bigNumberFormatter(ticket.totalQuote),
        numOfMarkets: Number(ticket.numOfMarkets),
        expiry: secondsToMilliseconds(Number(ticket.expiry)),
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
        isFreeBet:
            ticket.ticketOwner.toLowerCase() == freeBetHolder.addresses[networkId as SupportedNetwork].toLowerCase(),

        sportMarkets: ticket.marketsData.map(
            (market: any, index: number): TicketMarket => {
                const leagueId = `${market.sportId}`.startsWith('153')
                    ? League.TENNIS_GS
                    : `${market.sportId}`.startsWith('156')
                    ? League.TENNIS_MASTERS
                    : UFC_LEAGUE_IDS.includes(market.sportId)
                    ? League.UFC
                    : Number(market.sportId);
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

                const playerInfo = playersInfo[market.playerId];
                const playerName = isPlayerProps && playerInfo ? playerInfo.playerName : 'Player Name';

                const marketResult = ticket.marketsResult[index];
                const marketStatus = Number(marketResult.status);

                const positionNames = (positionNamesMap as any)[typeId];

                return {
                    gameId: market.gameId,
                    sport: getLeagueSport(leagueId),
                    leagueId: leagueId,
                    subLeagueId: Number(market.sportId),
                    leagueName: '',
                    typeId: typeId,
                    type: type ? type.key : '',
                    maturity: secondsToMilliseconds(Number(market.maturity)),
                    maturityDate: new Date(secondsToMilliseconds(market.maturity)),
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
                    positionNames,
                };
            }
        ),
    };

    return mappedTicket;
};

export const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCancelled) {
        return t('markets.market-card.canceled');
    }
    if (market.isResolved) {
        if (market.isPlayerPropsMarket) {
            return market.homeScore;
        }
        return market.homeScore !== undefined
            ? market.leagueId === League.UFC
                ? Number(market.homeScore) > 0
                    ? 'W - L'
                    : 'L - W'
                : `${market.homeScore} - ${market.awayScore}`
            : '';
    }
    if (market.maturityDate < new Date()) {
        return t('markets.market-card.pending');
    }
    return formatDateWithTime(Number(market.maturityDate));
};

const getTicketQuote = (paid: number, payout: number) => 1 / (payout / paid);

export const formatTicketOdds = (oddsType: OddsType, paid: number, payout: number) =>
    formatMarketOdds(oddsType, getTicketQuote(paid, payout));

export const getTicketMarketOdd = (market: TicketMarket) => (market.isCancelled ? 1 : market.odd);

export const getAddedPayoutOdds = (currencyKey: Coins, odds: number) =>
    currencyKey === CRYPTO_CURRENCY_MAP.THALES || currencyKey === CRYPTO_CURRENCY_MAP.sTHALES
        ? odds / (1 + THALES_ADDED_PAYOUT_PERCENTAGE - THALES_ADDED_PAYOUT_PERCENTAGE * odds)
        : odds;

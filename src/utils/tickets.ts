import { MarketTypeMap } from 'constants/marketTypes';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { MarketType } from 'enums/marketTypes';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import { bigNumberFormatter, coinFormatter, Coins, formatDateWithTime, NetworkId } from 'thales-utils';
import { CombinedPosition, SystemBetData, Team, Ticket, TicketMarket, TicketPosition } from 'types/markets';
import { NetworkConfig, SupportedNetwork } from 'types/network';
import { ShareTicketModalProps } from 'types/tickets';
import futuresPositionNamesMap from '../assets/json/futuresPositionNamesMap.json';
import positionNamesMap from '../assets/json/positionNamesMap.json';
import { CRYPTO_CURRENCY_MAP } from '../constants/currency';
import { BATCH_SIZE, THALES_ADDED_PAYOUT_PERCENTAGE } from '../constants/markets';
import { UFC_LEAGUE_IDS } from '../constants/sports';
import { League } from '../enums/sports';
import { TicketMarketStatus } from '../enums/tickets';
import { getCollateralByAddress } from './collaterals';
import { getContractInstance } from './contract';
import freeBetHolder from './contracts/freeBetHolder';
import stakingThalesBettingProxy from './contracts/stakingThalesBettingProxy';
import {
    formatMarketOdds,
    getPeriodsForResultView,
    isContractResultView,
    isFuturesMarket,
    isOneSideMarket,
    isOneSidePlayerPropsMarket,
    isPlayerPropsMarket,
    isYesNoPlayerPropsMarket,
} from './markets';
import { getLeagueSport, isPlayerPropsCombiningEnabled } from './sports';

export const mapTicket = (
    ticket: any,
    networkId: number,
    gamesInfo: any,
    playersInfo: any,
    liveScores: any,
    openOngoingMarkets?: any
): Ticket => {
    // TODO - hardcode OVER as THALES until we release
    let collateral =
        ticket.collateral.toLowerCase() === '0x409b3dcab04b476918e40e186bc77e1cfd2ce482' ||
        ticket.collateral.toLowerCase() === '0x774ede9cd936118e89f0ca786a007c9db899f3f5'
            ? (CRYPTO_CURRENCY_MAP.sTHALES as Coins)
            : getCollateralByAddress(ticket.collateral, networkId);
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
        isCancelled:
            ticket.cancelled ||
            ticket.marketsResult.every(
                (marketResult: any) => Number(marketResult.status) === TicketMarketStatus.CANCELLED
            ),
        isLost: ticket.isLost,
        isUserTheWinner: ticket.isUserTheWinner,
        isExercisable: ticket.isExercisable,
        isClaimable: ticket.isUserTheWinner && !ticket.resolved,
        isOpen: !ticket.resolved && !ticket.isExercisable,
        finalPayout: coinFormatter(ticket.finalPayout, networkId, collateral),
        isLive: ticket.isLive,
        isSgp: ticket.isSGP,
        isFreeBet:
            ticket.ticketOwner.toLowerCase() == freeBetHolder.addresses[networkId as SupportedNetwork].toLowerCase(),
        isSystemBet: ticket.isSystem,

        sportMarkets: ticket.marketsData.map(
            (market: any, index: number): TicketMarket => {
                const leagueId = `${market.sportId}`.startsWith('152')
                    ? League.TENNIS_WTA
                    : `${market.sportId}`.startsWith('153')
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
                const apiMarket = openOngoingMarkets
                    ? openOngoingMarkets.find((m: any) => m.gameId === market.gameId)
                    : undefined;
                const periodsForResultView = getPeriodsForResultView(typeId, leagueId);

                const homeTeam = !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => team.isHome);
                const homeTeamName = homeTeam?.name ?? 'Home Team';
                const homeScore =
                    homeTeam && periodsForResultView.length > 0
                        ? periodsForResultView.reduce(
                              (prev: number, curr: number) => prev + Number(homeTeam.scoreByPeriod[curr - 1]),
                              0
                          )
                        : homeTeam?.score;
                const homeScoreByPeriod = homeTeam ? homeTeam.scoreByPeriod : [];

                const awayTeam = !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => !team.isHome);
                const awayTeamName = awayTeam?.name ?? 'Away Team';
                const awayScore =
                    awayTeam && periodsForResultView.length > 0
                        ? periodsForResultView.reduce(
                              (prev: number, curr: number) => prev + Number(awayTeam.scoreByPeriod[curr - 1]),
                              0
                          )
                        : awayTeam?.score;
                const awayScoreByPeriod = awayTeam ? awayTeam.scoreByPeriod : [];

                const playerInfo = playersInfo[market.playerId];
                const playerName = isPlayerProps && playerInfo ? playerInfo.playerName : 'Player Name';

                const marketResult = ticket.marketsResult[index];
                const marketStatus = Number(marketResult.status);

                const positionNames = isFuturesMarket(typeId)
                    ? (futuresPositionNamesMap as any)[leagueId]
                        ? (futuresPositionNamesMap as any)[leagueId][typeId]
                        : undefined
                    : (positionNamesMap as any)[typeId];

                return {
                    gameId: market.gameId,
                    sport: getLeagueSport(leagueId),
                    leagueId: leagueId,
                    subLeagueId: Number(market.sportId),
                    leagueName: '',
                    typeId: typeId,
                    type: type ? type.key : '',
                    maturity: secondsToMilliseconds(Number(market.maturity)),
                    apiMaturity: apiMarket
                        ? secondsToMilliseconds(Number(apiMarket.maturity))
                        : secondsToMilliseconds(Number(market.maturity)),
                    maturityDate: new Date(secondsToMilliseconds(Number(market.maturity))),
                    homeTeam: homeTeamName,
                    awayTeam: awayTeamName,
                    homeScore:
                        isPlayerProps || isContractResultView(typeId)
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
                    isOneSideMarket: isOneSideMarket(leagueId, typeId),
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

    if (mappedTicket.isSystemBet) {
        const systemBetDenominator = Number(ticket.systemBetDenominator);
        const systemBetPayoutData = getSystemBetPayoutData(
            mappedTicket.sportMarkets,
            systemBetDenominator,
            mappedTicket.buyInAmount,
            mappedTicket.totalQuote
        );
        mappedTicket.systemBetData = {
            systemBetDenominator: Number(ticket.systemBetDenominator),
            numberOfCombination: systemBetPayoutData.numberOfCombinations,
            buyInPerCombination: systemBetPayoutData.buyinPerCombination,
            minPayout: systemBetPayoutData.systemBetPayoutMinPayout,
            maxPayout: mappedTicket.buyInAmount / mappedTicket.totalQuote,
            numberOfWinningCombinations: systemBetPayoutData.numberOfWinningCombinations,
        };
        if (mappedTicket.isUserTheWinner || mappedTicket.isCancelled) {
            if (mappedTicket.isResolved) {
                mappedTicket.payout = mappedTicket.finalPayout;
            } else {
                mappedTicket.payout = systemBetPayoutData.systemBetPayout;
            }
        }
    }

    return mappedTicket;
};

export const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCancelled) {
        return t('markets.market-card.canceled');
    }
    if (market.isResolved) {
        if (market.isPlayerPropsMarket || isContractResultView(market.typeId)) {
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

// Order asc: 1,2,3,4; desc: 4,3,2,1;
const getOrderByStatus = (status: TicketMarketStatus) => {
    switch (status) {
        case TicketMarketStatus.OPEN:
            return 1;
        case TicketMarketStatus.WINNING:
            return 2;
        case TicketMarketStatus.LOSING:
            return 3;
        case TicketMarketStatus.CANCELLED:
            return 4;
    }
};

const getTicketStatusOrder = (market: Ticket) =>
    market.isCancelled
        ? getOrderByStatus(TicketMarketStatus.CANCELLED)
        : market.isUserTheWinner
        ? getOrderByStatus(TicketMarketStatus.WINNING)
        : market.isLost
        ? getOrderByStatus(TicketMarketStatus.LOSING)
        : getOrderByStatus(TicketMarketStatus.OPEN);

export const tableSortByStatus = (rowA: any, rowB: any) => {
    const aOrder = getTicketStatusOrder(rowA.original);
    const bOrder = getTicketStatusOrder(rowB.original);
    return aOrder < bOrder ? -1 : aOrder > bOrder ? 1 : 0;
};

const generateSystemBetCombinations = (n: number, k: number): number[][] => {
    if (k <= 1 || k >= n) return [];

    // Calculate the number of combinations: n! / (k! * (n-k)!)
    let combinationsCount = 1;
    for (let i = 0; i < k; i++) {
        combinationsCount = (combinationsCount * (n - i)) / (i + 1);
    }

    // Initialize combinations array
    const combinations: number[][] = new Array(combinationsCount);

    // Generate combinations
    const indices: number[] = new Array(k);
    for (let i = 0; i < k; i++) {
        indices[i] = i;
    }

    let index = 0;

    while (true) {
        // Add the current combination
        const combination: number[] = new Array(k);
        for (let i = 0; i < k; i++) {
            combination[i] = indices[i];
        }
        combinations[index] = combination;
        index++;

        // Generate the next combination
        let done = true;
        for (let i = k; i > 0; i--) {
            if (indices[i - 1] < n - (k - (i - 1))) {
                indices[i - 1]++;
                for (let j = i; j < k; j++) {
                    indices[j] = indices[j - 1] + 1;
                }
                done = false;
                break;
            }
        }

        if (done) {
            break;
        }
    }

    return combinations;
};

export const getSystemBetData = (
    markets: TicketMarket[],
    systemBetDenominator: number,
    currencyKey: Coins,
    maxSupportedOdds?: number
) => {
    const systemCombinations: number[][] = generateSystemBetCombinations(markets.length, systemBetDenominator);
    const numberOfCombinations = systemCombinations.length;
    let systemBetQuote = 0;
    let systemBetQuotePerCombination = 0;
    let systemBetMinimumQuote = 0;

    // Loop through each stored combination
    for (let i = 0; i < numberOfCombinations; i++) {
        const currentCombination: number[] = systemCombinations[i];

        let combinationQuote = 1;

        for (let j = 0; j < currentCombination.length; j++) {
            const marketIndex = currentCombination[j];
            const market = markets[marketIndex];
            let odds = market.odds[market.position];
            odds = odds > 0 ? getAddedPayoutOdds(currencyKey, odds) : odds;
            combinationQuote *= odds;
        }

        systemBetMinimumQuote = combinationQuote > systemBetMinimumQuote ? combinationQuote : systemBetMinimumQuote;
        systemBetQuotePerCombination += 1 / combinationQuote;
    }

    systemBetQuotePerCombination = 1 / systemBetQuotePerCombination;
    systemBetQuote = numberOfCombinations * systemBetQuotePerCombination;

    if (maxSupportedOdds) {
        systemBetQuote = systemBetQuote < maxSupportedOdds ? maxSupportedOdds : systemBetQuote;
        systemBetQuotePerCombination = systemBetQuote / numberOfCombinations;
        systemBetMinimumQuote =
            systemBetMinimumQuote < systemBetQuotePerCombination ? systemBetQuotePerCombination : systemBetMinimumQuote;
    }

    return { systemBetQuotePerCombination, systemBetQuote, systemBetMinimumQuote };
};

const getSystemBetPayoutData = (
    markets: TicketMarket[],
    systemBetDenominator: number,
    buyInAmount: number,
    totalQuote: number
) => {
    const systemCombinations: number[][] = generateSystemBetCombinations(markets.length, systemBetDenominator);
    const numberOfCombinations = systemCombinations.length;
    const buyinPerCombination = buyInAmount / numberOfCombinations;
    let systemBetPayout = 0;
    let systemBetMinimumQuote = 0;
    let areAllMarketsResolved = true;
    let numberOfWinningCombinations = 0;

    // Loop through each stored combination
    for (let i = 0; i < numberOfCombinations; i++) {
        const currentCombination: number[] = systemCombinations[i];

        let combinationQuote = 1;
        let originalCominationQuote = 1;

        for (let j = 0; j < currentCombination.length; j++) {
            const marketIndex = currentCombination[j];
            const market = markets[marketIndex];

            originalCominationQuote *= market.odd;

            if (!market.isResolved) {
                areAllMarketsResolved = false;
                continue;
            }
            if (market.isCancelled) {
                continue;
            }
            if (market.isWinning) {
                combinationQuote *= market.odd;
            } else {
                combinationQuote = 0;
            }
        }

        systemBetMinimumQuote =
            originalCominationQuote > systemBetMinimumQuote ? originalCominationQuote : systemBetMinimumQuote;
        if (combinationQuote > 0) {
            numberOfWinningCombinations++;
            systemBetPayout += buyinPerCombination / combinationQuote;
        }
    }

    const maxPayout = buyInAmount / totalQuote;
    const maxTotalQuotePerCombination = totalQuote / numberOfCombinations;

    systemBetPayout = systemBetPayout > maxPayout ? maxPayout : systemBetPayout;
    systemBetMinimumQuote =
        systemBetMinimumQuote < maxTotalQuotePerCombination ? maxTotalQuotePerCombination : systemBetMinimumQuote;

    return {
        systemBetPayout: areAllMarketsResolved ? systemBetPayout : 0,
        systemBetPayoutMinPayout: buyinPerCombination / systemBetMinimumQuote,
        numberOfCombinations,
        buyinPerCombination,
        numberOfWinningCombinations: areAllMarketsResolved ? numberOfWinningCombinations : 0,
    };
};

export const getSystemBetDataObject = (
    systemBetDenominator: number,
    numberOfSystemBetCombination: number,
    buyInAmount: number,
    systemBetMinimumQuote: number,
    maxPayout: number
) =>
    ({
        systemBetDenominator,
        numberOfCombination: numberOfSystemBetCombination,
        buyInPerCombination: buyInAmount / numberOfSystemBetCombination,
        minPayout: buyInAmount / numberOfSystemBetCombination / systemBetMinimumQuote,
        maxPayout,
        numberOfWinningCombinations: 0,
    } as SystemBetData);

export const getShareTicketModalData = async (
    markets: TicketMarket[],
    collateral: Coins,
    paid: number,
    payout: number,
    onClose: () => void,
    isModalForLive: boolean, // not the same as isLive indicator
    isSgp: boolean,
    isFreeBet: boolean,
    isStakedThales: boolean,
    systemBetData?: SystemBetData,
    networkConfig?: NetworkConfig,
    walletAddress?: string
) => {
    let modalData: ShareTicketModalProps | undefined = undefined;
    const isLive = !!markets[0].live;
    const isStakedThalesSupported = networkConfig && networkConfig.networkId !== NetworkId.Base;

    if (isModalForLive && networkConfig) {
        const sportsAMMDataContract = getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig);
        const sportsAMMV2ManagerContract = getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, networkConfig);
        const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);
        const stakingThalesBettingProxyContract = getContractInstance(
            ContractType.STAKING_THALES_BETTING_PROXY,
            networkConfig
        );

        if (sportsAMMDataContract && sportsAMMV2ManagerContract && freeBetHolderContract) {
            const numOfActiveTicketsPerUser = isFreeBet
                ? await freeBetHolderContract.read.numOfActiveTicketsPerUser([walletAddress])
                : isStakedThales && isStakedThalesSupported && stakingThalesBettingProxyContract
                ? await stakingThalesBettingProxyContract.read.numOfActiveTicketsPerUser([walletAddress])
                : await sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([walletAddress]);

            const userTickets = await sportsAMMDataContract.read.getActiveTicketsDataPerUser([
                walletAddress,
                Number(numOfActiveTicketsPerUser) - 1,
                BATCH_SIZE,
            ]);

            const lastTicket = isFreeBet
                ? userTickets.freeBetsData[userTickets.freeBetsData.length - 1]
                : isStakedThales && isStakedThalesSupported
                ? userTickets.stakingBettingProxyData[userTickets.stakingBettingProxyData.length - 1]
                : userTickets.ticketsData[userTickets.ticketsData.length - 1];

            const lastTicketPaid = paid ? paid : coinFormatter(lastTicket.buyInAmount, networkConfig.networkId);
            const lastTicketPayout = lastTicketPaid / bigNumberFormatter(lastTicket.totalQuote);

            const liveOrOtherMarkets = isLive
                ? [
                      {
                          ...markets[0],
                          odd: bigNumberFormatter(lastTicket.totalQuote),
                      },
                  ]
                : markets;

            modalData = {
                markets: liveOrOtherMarkets,
                multiSingle: false,
                paid: lastTicketPaid,
                payout: lastTicketPayout,
                onClose,
                isTicketLost: false,
                collateral,
                isLive,
                isSgp,
                applyPayoutMultiplier: false,
                isTicketOpen: true,
                systemBetData,
            };
        }
    } else {
        modalData = {
            markets,
            multiSingle: false,
            paid,
            payout: payout,
            onClose,
            isTicketLost: false,
            collateral,
            isLive,
            isSgp,
            applyPayoutMultiplier: true,
            isTicketOpen: true,
            systemBetData,
        };
    }

    return modalData;
};

export const isRegularTicketInvalid = (ticket: TicketPosition[], maxTicketSize: number) => {
    if (ticket.length <= 1) {
        return false;
    }

    // max ticket size
    if (ticket.length >= maxTicketSize) {
        return true;
    }

    const isSameGameTicket = ticket.some((ticketPosition, index, ticketPositions) => {
        const sameGamePositions = ticketPositions.filter(
            (position, i) => i !== index && position.gameId === ticketPosition.gameId
        );
        return sameGamePositions.length > 0;
    });
    if (isSameGameTicket) {
        const isPPCombiningEnabled = ticket.some((position) => isPlayerPropsCombiningEnabled(position.leagueId));
        const isDiffPPType =
            ticket.some((position) => isPlayerPropsMarket(position.typeId)) &&
            ticket.some((position) => !isPlayerPropsMarket(position.typeId));
        if (isPPCombiningEnabled) {
            if (isDiffPPType) {
                // player props with other types from the same game
                return true;
            } else {
                // different categories for the same player
                const isSamePlayer = ticket.some((ticketPosition, index, ticketPositions) => {
                    const samePlayerPositions = ticketPositions.filter(
                        (position, i) => i !== index && position.playerId === ticketPosition.playerId
                    );
                    return samePlayerPositions.length > 0;
                });
                return isSamePlayer;
            }
        }
    } else if (ticket.length > 0 && ticket.some((position) => isFuturesMarket(position.typeId))) {
        // futures
        return true;
    }

    return false;
};

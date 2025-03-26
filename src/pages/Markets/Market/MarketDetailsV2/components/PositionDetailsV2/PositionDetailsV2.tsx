import Tooltip from 'components/Tooltip';
import { oddToastOptions } from 'config/toast';
import { FUTURES_MAIN_VIEW_DISPLAY_COUNT } from 'constants/markets';
import { SportFilter } from 'enums/markets';
import {
    MarketType,
    isCorrectScoreMarket,
    isFuturesMarket,
    isSgpBuilderMarket,
    isTotalExactMarket,
} from 'overtime-utils';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getMarketTypeFilter, getSportFilter } from 'redux/modules/market';
import {
    getIsSgp,
    getTicket,
    removeAll,
    removeFromTicket,
    setIsSgp,
    setIsSystemBet,
    updateTicket,
} from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { SgpTicket, SportMarket, TicketPosition } from 'types/markets';
import { formatMarketOdds, getPositionOrder } from 'utils/markets';
import {
    getMatchLabel,
    getPositionTextV2,
    isSameMarket,
    sportMarketAsSerializable,
    sportMarketAsTicketPosition,
} from 'utils/marketsV2';
import { Container, Odd, Status, Text } from './styled-components';

type PositionDetailsProps = {
    market: SportMarket;
    position: number;
    isMainPageView?: boolean;
    isColumnView?: boolean;
    displayPosition: number;
    isPositionBlocked?: boolean;
    sgpTickets?: SgpTicket[];
};

const PositionDetails: React.FC<PositionDetailsProps> = ({
    market,
    position,
    isMainPageView,
    isColumnView,
    displayPosition,
    isPositionBlocked,
    sgpTickets,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const ticket = useSelector(getTicket);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const sportFilter = useSelector(getSportFilter);
    const isSgp = useSelector(getIsSgp);

    const currentSgpTicket = useMemo(() => {
        if (isSgpBuilderMarket(market.typeId) && !!sgpTickets?.length) {
            return sgpTickets.find(
                (sgpTicket) =>
                    sgpTicket.sgpBuilder.typeId === market.typeId && sgpTicket.sgpBuilder.positionIndex === position
            );
        }
        return undefined;
    }, [market.typeId, position, sgpTickets]);

    const sgpTicketPositions = useMemo(() => (currentSgpTicket ? currentSgpTicket.ticketPositions : []), [
        currentSgpTicket,
    ]);

    const isSgpBuilderAddedToTicket =
        isSgpBuilderMarket(market.typeId) &&
        ticket.length > 0 &&
        ticket.length === sgpTicketPositions.length &&
        ticket.every(
            (ticketPosition, i) =>
                isSameMarket(sgpTicketPositions[i], ticketPosition) &&
                ticket[i].position === currentSgpTicket?.sgpBuilder.combinedPositions[i]
        );

    const addedToTicket = ticket.filter((position) => isSameMarket(market, position))[0];
    const isAddedToTicket = (addedToTicket && addedToTicket.position == position) || isSgpBuilderAddedToTicket;

    const isPlayerPropsMarket = useMemo(() => sportFilter === SportFilter.PlayerProps, [sportFilter]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameLive = !!market.live && isGameStarted;
    const isGameCancelled = market.isCancelled;
    const isGameResolved = market.isResolved || market.isCancelled;
    const isGameRegularlyResolved = market.isResolved && !market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved && !market.live;

    const isGamePaused = market.isPaused && !isGameResolved;
    const isGameOpen = !market.isResolved && !market.isCancelled && !market.isPaused && !isGameStarted;

    const odd = market.odds[position];
    const isZeroOdd = !odd || odd == 0 || market.typeId === MarketType.EMPTY;
    const noOdd = isZeroOdd || odd > 0.97;
    const disabledPosition = isSgpBuilderMarket(market.typeId)
        ? !sgpTicketPositions.length
        : noOdd || (!isGameOpen && !isGameLive) || (!!isPositionBlocked && !isAddedToTicket);
    const showOdd = (isGameOpen || isGameLive) && !isSgpBuilderMarket(market.typeId);

    const positionText = getPositionTextV2(
        market,
        position,
        isMainPageView && (market.typeId === MarketType.TOTAL || !!marketTypeFilter || isPlayerPropsMarket)
    );

    const isFutures = isFuturesMarket(market.typeId);
    const isCorrectScore = isCorrectScoreMarket(market.typeId);

    const getDetails = () => (
        <Container
            hide={
                ((showOdd && noOdd) || (!!isMainPageView && displayPosition >= FUTURES_MAIN_VIEW_DISPLAY_COUNT)) &&
                (isFutures || isCorrectScore || isTotalExactMarket(market.typeId))
            }
            disabled={disabledPosition}
            selected={isAddedToTicket}
            isWinner={isGameRegularlyResolved && market.winningPositions && market.winningPositions.includes(position)}
            order={getPositionOrder(market.leagueId, market.typeId, position)}
            isMainPageView={isMainPageView}
            isPlayerPropsMarket={isPlayerPropsMarket}
            onClick={() => {
                if (disabledPosition) return;
                if (isAddedToTicket) {
                    if (isSgpBuilderMarket(market.typeId)) {
                        dispatch(removeAll());
                    } else {
                        const serializableMarket = sportMarketAsSerializable(market);
                        dispatch(removeFromTicket(serializableMarket));
                    }
                } else {
                    let ticketPositions: TicketPosition[] = [];

                    if (isSgpBuilderMarket(market.typeId)) {
                        // multiple ticket positions
                        ticketPositions = sgpTicketPositions;

                        if (!isSgp) {
                            dispatch(removeAll());
                            dispatch(setIsSystemBet(false));
                            dispatch(setIsSgp(true));
                        } else if (ticket.length > 0 && ticket[0].gameId === ticketPositions[0].gameId) {
                            dispatch(removeAll());
                        }
                    } else {
                        ticketPositions.push(sportMarketAsTicketPosition(market, position));
                    }

                    ticketPositions.forEach((ticketPosition) => {
                        if (
                            !ticketPosition.live &&
                            (ticket.some((position) => position.live) || (ticket.length && market.live))
                        ) {
                            toast(t('markets.market-card.odds-live-limitation-message'), { type: 'error' });
                        } else {
                            dispatch(updateTicket(ticketPosition));
                        }
                        if (isMobile) {
                            // TODO: temporary solution
                            toast(`${getMatchLabel(market)} added to the ticket`, oddToastOptions);
                        }
                    });
                }
            }}
        >
            <Text isColumnView={isColumnView}>{positionText}</Text>
            {showOdd ? (
                <Odd selected={isAddedToTicket} isMainPageView={isMainPageView}>
                    {isZeroOdd ? '-' : formatMarketOdds(selectedOddsType, odd)}
                    {isZeroOdd && (
                        <Tooltip overlay={<>{t('markets.zero-odds-tooltip')}</>} iconFontSize={13} marginLeft={3} />
                    )}
                    {odd > 0.97 && (
                        <Tooltip overlay={<>{t('markets.low-odds-tooltip')}</>} iconFontSize={13} marginLeft={3} />
                    )}
                </Odd>
            ) : (
                <Status>
                    {isPendingResolution
                        ? `- ${t('markets.market-card.pending')} -`
                        : isGameCancelled
                        ? `- ${t('markets.market-card.canceled')} -`
                        : isGamePaused
                        ? `- ${t('markets.market-card.paused')} -`
                        : market.isOneSidePlayerPropsMarket && market.isResolved
                        ? `- ${t('markets.market-card.resolved')} -`
                        : null}
                </Status>
            )}
        </Container>
    );

    return getDetails();
};

export default PositionDetails;

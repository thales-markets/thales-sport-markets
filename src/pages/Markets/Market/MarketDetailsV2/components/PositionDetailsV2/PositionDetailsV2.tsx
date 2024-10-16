import Tooltip from 'components/Tooltip';
import { oddToastOptions } from 'config/toast';
import { MarketType } from 'enums/marketTypes';
import { Position } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getMarketTypeFilter } from 'redux/modules/market';
import { getTicket, removeFromTicket, updateTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { SportMarket, TicketPosition } from 'types/markets';
import { formatMarketOdds, getPositionOrder } from 'utils/markets';
import { getMatchLabel, getPositionTextV2, isSameMarket, sportMarketAsSerializable } from 'utils/marketsV2';
import { Container, Odd, Status, Text } from './styled-components';

type PositionDetailsProps = {
    market: SportMarket;
    position: Position;
    isMainPageView?: boolean;
    isColumnView?: boolean;
};

const PositionDetails: React.FC<PositionDetailsProps> = ({ market, position, isMainPageView, isColumnView }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const ticket = useSelector(getTicket);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const addedToTicket = ticket.filter((position: any) => isSameMarket(market, position))[0];

    const isAddedToTicket = addedToTicket && addedToTicket.position == position;

    const isGameStarted = market.maturityDate < new Date();
    const isGameLive = !!market.live && isGameStarted;
    const isGameCancelled = market.isCancelled;
    const isGameResolved = market.isResolved || market.isCancelled;
    const isGameRegularlyResolved = market.isResolved && !market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved && !market.live;

    const isGamePaused = market.isPaused && !isGameResolved;
    const isGameOpen = !market.isResolved && !market.isCancelled && !market.isPaused && !isGameStarted;

    const odd = market.odds[position];
    const isZeroOdd = !odd || odd == 0;
    const noOdd = isZeroOdd || odd > 0.97;
    const disabledPosition = noOdd || (!isGameOpen && !isGameLive);

    const showOdd = isGameOpen || isGameLive;

    const positionText = getPositionTextV2(
        market,
        position,
        isMainPageView && (market.typeId === MarketType.TOTAL || !!marketTypeFilter)
    );

    const getDetails = () => (
        <Container
            disabled={disabledPosition}
            selected={isAddedToTicket}
            isWinner={isGameRegularlyResolved && market.winningPositions && market.winningPositions.includes(position)}
            order={getPositionOrder(market.leagueId, market.typeId, position)}
            isMainPageView={isMainPageView}
            onClick={() => {
                if (disabledPosition) return;
                if (isAddedToTicket) {
                    const serializableMarket = sportMarketAsSerializable(market);
                    dispatch(removeFromTicket(serializableMarket));
                } else {
                    const ticketPosition: TicketPosition = {
                        gameId: market.gameId,
                        leagueId: market.leagueId,
                        typeId: market.typeId,
                        playerId: market.playerProps.playerId,
                        playerName: market.playerProps.playerName,
                        line: market.line,
                        position: position,
                        combinedPositions: market.combinedPositions,
                        live: market.live,
                        isOneSideMarket: market.isOneSideMarket,
                        isPlayerPropsMarket: market.isPlayerPropsMarket,
                        homeTeam: market.homeTeam,
                        awayTeam: market.awayTeam,
                        playerProps: market.playerProps,
                    };

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

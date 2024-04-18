import Tooltip from 'components/Tooltip';
import { oddToastOptions } from 'config/toast';
import { Position } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getTicket, removeFromTicket, updateTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { SportMarketInfoV2, TicketPosition } from 'types/markets';
import { convertFinalResultToResultType, formatMarketOdds } from 'utils/markets';
import { getOddTooltipTextV2, getPositionTextV2, isSameMarket } from 'utils/marketsV2';
import {
    Container,
    Odd,
    Status,
    Text,
    TooltipContainer,
    TooltipFooter,
    TooltipFooterInfo,
    TooltipFooterInfoContianer,
    TooltipFooterInfoLabel,
    TooltipText,
} from './styled-components';

type PositionDetailsProps = {
    market: SportMarketInfoV2;
    position: Position;
};

const PositionDetails: React.FC<PositionDetailsProps> = ({ market, position }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const ticket = useSelector(getTicket);
    const addedToTicket = ticket.filter((position: any) => isSameMarket(market, position))[0];

    const isAddedToTicket = addedToTicket && addedToTicket.position == position;

    const isGameStarted = market.maturityDate < new Date();
    const isGameCancelled = market.isCanceled;
    const isGameResolved = market.isResolved || market.isCanceled;
    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGamePaused = market.isPaused && !isGameResolved;
    const isGameOpen = !market.isResolved && !market.isCanceled && !market.isPaused && !isGameStarted;

    const odd = market.odds[position];
    const noOdd = !odd || odd == 0;
    const disabledPosition = noOdd || !isGameOpen;

    const showOdd = isGameOpen;
    const showTooltip = showOdd && !noOdd && !isMobile && false;

    const positionText = getPositionTextV2(market, position);

    const oddTooltipText = getOddTooltipTextV2(position, market);

    const getDetails = () => (
        <Container
            disabled={disabledPosition}
            selected={isAddedToTicket}
            isWinner={isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == position}
            onClick={() => {
                if (disabledPosition) return;
                if (isAddedToTicket) {
                    dispatch(removeFromTicket(market.gameId));
                } else {
                    const ticket: TicketPosition = {
                        gameId: market.gameId,
                        leagueId: market.leagueId,
                        typeId: market.typeId,
                        playerId: market.playerProps.playerId,
                        line: market.line,
                        position: position,
                    };
                    dispatch(updateTicket(ticket));
                    if (isMobile) {
                        toast(oddTooltipText, oddToastOptions);
                    }
                }
            }}
        >
            <Text>{positionText}</Text>
            {showOdd ? (
                <Odd selected={isAddedToTicket}>
                    {formatMarketOdds(selectedOddsType, odd)}
                    {noOdd && (
                        <Tooltip overlay={<>{t('markets.zero-odds-tooltip')}</>} iconFontSize={13} marginLeft={3} />
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

    const getTooltip = () => (
        <TooltipContainer>
            <TooltipText>{oddTooltipText}</TooltipText>
            {isGameOpen && !isMobile && (
                <TooltipFooter>
                    <TooltipFooterInfoContianer>
                        <TooltipFooterInfoLabel>{t('markets.market-details.odds')}:</TooltipFooterInfoLabel>
                        <TooltipFooterInfo>{formatMarketOdds(selectedOddsType, odd)}</TooltipFooterInfo>
                    </TooltipFooterInfoContianer>
                </TooltipFooter>
            )}
        </TooltipContainer>
    );

    return <>{showTooltip ? <Tooltip overlay={getTooltip()} component={getDetails()} /> : getDetails()}</>;
};

export default PositionDetails;

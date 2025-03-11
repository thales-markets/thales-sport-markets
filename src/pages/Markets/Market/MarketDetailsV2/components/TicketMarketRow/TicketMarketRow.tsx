import SPAAnchor from 'components/SPAAnchor';
import i18n from 'i18n';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import { getMatchTeams, getPositionTextV2, getTeamNameV2, getTitleText } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getTicketMarketOdd, getTicketMarketStatus } from 'utils/tickets';
import Tooltip from '../../../../../../components/Tooltip';
import ResolveModal from '../ResolveModal';
import {
    MarketStatus,
    MarketStatusIcon,
    MarketTypeInfo,
    MatchTeamsLabel,
    Odd,
    PositionInfo,
    PositionText,
    ResolveAction,
    SelectionInfoContainer,
    SettingsIcon,
    TeamNameLabel,
    TeamNamesContainer,
    TicketRow,
} from './styled-components';

type TicketMarketRowProps = {
    ticketMarket: TicketMarket;
    isCurrentMarket: boolean;
    isWitelistedForResolve: boolean;
    isSgp: boolean;
};

const TicketMarketRow: React.FC<TicketMarketRowProps> = ({
    ticketMarket,
    isCurrentMarket,
    isWitelistedForResolve,
    isSgp,
}) => {
    const language = i18n.language;
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector(getIsMobile);
    const selectedOddsType = useSelector(getOddsType);
    const [showResolveModal, setShowResolveModal] = useState(false);

    return (
        <TicketRow highlighted={isCurrentMarket} style={{ opacity: getOpacity(ticketMarket) }}>
            <SPAAnchor href={buildMarketLink(ticketMarket.gameId, language)}>
                <FlexDivColumn>
                    <TeamNamesContainer>
                        <TeamNameLabel>{getTeamNameV2(ticketMarket, 0)}</TeamNameLabel>
                        {!ticketMarket.isOneSideMarket && !ticketMarket.isPlayerPropsMarket && (
                            <>
                                {!isMobile && <TeamNameLabel>&nbsp;-&nbsp;</TeamNameLabel>}
                                <TeamNameLabel>{getTeamNameV2(ticketMarket, 1)}</TeamNameLabel>
                            </>
                        )}
                    </TeamNamesContainer>
                    {ticketMarket.isPlayerPropsMarket && !isCurrentMarket && (
                        <MatchTeamsLabel>{`(${getMatchTeams(ticketMarket)})`}</MatchTeamsLabel>
                    )}
                </FlexDivColumn>
            </SPAAnchor>
            <SelectionInfoContainer>
                <MarketTypeInfo>{getTitleText(ticketMarket)}</MarketTypeInfo>
                <PositionInfo>
                    <PositionText>{getPositionTextV2(ticketMarket, ticketMarket.position, true)}</PositionText>
                    {!isSgp && <Odd>{formatMarketOdds(selectedOddsType, getTicketMarketOdd(ticketMarket))}</Odd>}
                </PositionInfo>
            </SelectionInfoContainer>
            <MarketStatus
                color={
                    ticketMarket.isOpen || ticketMarket.isCancelled
                        ? theme.status.open
                        : ticketMarket.isWinning
                        ? theme.status.win
                        : theme.status.loss
                }
            >
                {getTicketMarketStatusIcon(ticketMarket)}
                {getTicketMarketStatus(ticketMarket)}
            </MarketStatus>
            {isWitelistedForResolve && ticketMarket.isOpen && (
                <Tooltip overlay={t('markets.resolve-modal.resolve-market-tooltip')}>
                    <ResolveAction onClick={() => setShowResolveModal(true)}>
                        <SettingsIcon className={`icon icon--double-check`} />
                    </ResolveAction>
                </Tooltip>
            )}
            {showResolveModal && isWitelistedForResolve && (
                <ResolveModal ticketMarket={ticketMarket} onClose={() => setShowResolveModal(false)}></ResolveModal>
            )}
        </TicketRow>
    );
};

const getTicketMarketStatusIcon = (market: TicketMarket) => {
    return market.isCancelled ? (
        <MarketStatusIcon className={`icon icon--lost`} />
    ) : market.isOpen ? (
        market.maturityDate < new Date() ? (
            <MarketStatusIcon className={`icon icon--ongoing`} />
        ) : (
            <MarketStatusIcon className={`icon icon--ticket-open`} />
        )
    ) : market.isWinning ? (
        <MarketStatusIcon className={`icon icon--ticket-win`} />
    ) : (
        <MarketStatusIcon className={`icon icon--ticket-loss`} />
    );
};

const getOpacity = (market: TicketMarket) => (market.isResolved && !market.isWinning ? 0.5 : 1);

export default TicketMarketRow;

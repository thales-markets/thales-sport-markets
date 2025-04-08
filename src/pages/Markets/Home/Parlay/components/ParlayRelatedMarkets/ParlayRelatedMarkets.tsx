import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import Scroll from 'components/Scroll';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivStart } from 'styles/common';
import { formatCurrencyWithKey, formatHoursAndMinutesFromTimestamp } from 'thales-utils';
import { Ticket } from 'types/markets';
import { formatMarketOdds } from 'utils/markets';
import { getPositionTextV2, getTitleText } from 'utils/marketsV2';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import { Count, Title } from '../../ParlayV2';

const ParlayRelatedMarkets: React.FC = ({}) => {
    const { t } = useTranslation();

    const ticket = useSelector(getTicket);
    const isBiconomy = useSelector(getIsBiconomy);
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const client = useClient();

    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const userTicketsQuery = useUserTicketsQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected && !!ticket.length }
    );

    const gameRelatedTickets = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? userTicketsQuery.data.filter(
                      (userTicket) =>
                          userTicket.isLive &&
                          userTicket.sportMarkets[0] &&
                          userTicket.sportMarkets[0].gameId === ticket[0]?.gameId
                  )
                : [],
        [userTicketsQuery.isSuccess, userTicketsQuery.data, ticket]
    );

    const showMarkets = !isMobile || !!gameRelatedTickets.length;

    return showMarkets ? (
        <Scroll height="100%" renderOnlyChildren={isMobile}>
            <Container>
                <Title>
                    {t('markets.parlay-related-markets.title')}
                    <Count>{gameRelatedTickets.length}</Count>
                </Title>

                {!!gameRelatedTickets.length ? (
                    gameRelatedTickets.map((otherTicket, i) => {
                        const isLastRow = i === gameRelatedTickets.length - 1;
                        return (
                            <div key={`row-${i}`}>
                                <ExpandableRow ticket={otherTicket} isLastRow={isLastRow} />
                            </div>
                        );
                    })
                ) : (
                    <Empty>
                        <StyledParlayEmptyIcon />
                    </Empty>
                )}
            </Container>
        </Scroll>
    ) : (
        <></>
    );
};

const ExpandableRow: React.FC<{ ticket: Ticket; isLastRow: boolean }> = ({ ticket, isLastRow }) => {
    const { t } = useTranslation();

    const selectedOddsType = useSelector(getOddsType);

    const [isExpanded, setIsExpanded] = useState(false);

    const market = ticket.sportMarkets[0];

    return (
        <>
            <TicketRow hasSeparator={!isLastRow && !isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
                <TimeInfo>
                    <Text>{formatHoursAndMinutesFromTimestamp(ticket.timestamp)}</Text>
                </TimeInfo>
                <MarketTypeInfo>
                    <Text>{getTitleText(market)}</Text>
                </MarketTypeInfo>
                <PositionInfo>
                    <PositionText>{getPositionTextV2(market, market.position, true)}</PositionText>
                </PositionInfo>
                <ArrowIcon className={`icon ${isExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`} />
            </TicketRow>
            {isExpanded && (
                <TicketDetailsRow hasSeparator={!isLastRow}>
                    <OddsInfo>
                        <PositionText isLabel>{t('markets.parlay-related-markets.total-quote')}:</PositionText>
                        <PositionText>{formatMarketOdds(selectedOddsType, market.odd)}</PositionText>
                    </OddsInfo>
                    <PaidInfo>
                        <Text isLabel>{t('markets.parlay-related-markets.paid')}:</Text>
                        <Text>{formatCurrencyWithKey(ticket.collateral, ticket.buyInAmount)}</Text>
                    </PaidInfo>
                    <PayoutInfo>
                        <PayoutText isLabel>{t('markets.parlay-related-markets.payout')}:</PayoutText>
                        <PayoutText>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</PayoutText>
                    </PayoutInfo>
                </TicketDetailsRow>
            )}
        </>
    );
};

const Container = styled(FlexDivColumn)`
    position: relative;
    height: 100%;
    padding: 12px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: unset;
    }
`;

const Row = styled(FlexDivRow)<{ hasSeparator?: boolean }>`
    ${(props) => props.hasSeparator && `border-bottom: 2px dashed ${props.theme.borderColor.senary};`}
`;

const TicketRow = styled(Row)`
    padding: 8px 0;
    cursor: pointer;
`;

const TicketDetailsRow = styled(Row)`
    padding-bottom: 8px;
`;

const Info = styled(FlexDivStart)`
    margin-right: 5px;
`;

const TimeInfo = styled(Info)`
    width: 36px;
`;

const MarketTypeInfo = styled(Info)`
    width: 144px;
    color: ${(props) => props.theme.textColor.quinary};
`;

const PositionInfo = styled(Info)`
    width: 146px;
`;

const ArrowIcon = styled.i`
    display: flex;
    align-items: center;
    font-size: 10px;
`;

const OddsInfo = styled(Info)`
    flex-wrap: wrap;
`;

const PaidInfo = styled(Info)`
    flex-wrap: wrap;
`;

const PayoutInfo = styled(FlexDivStart)`
    flex-wrap: wrap;
`;

const Text = styled.span<{ isLabel?: boolean }>`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    ${(props) => props.isLabel && 'margin-right: 5px;'}
`;

const PositionText = styled(Text)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const PayoutText = styled(Text)`
    color: ${(props) => props.theme.status.win};
`;

const Empty = styled(FlexDivCentered)`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
`;

const StyledParlayEmptyIcon = styled(ParlayEmptyIcon)`
    margin-top: 10px;
    margin-bottom: 20px;
    width: 100px;
    height: 100px;
    path {
        fill: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default ParlayRelatedMarkets;

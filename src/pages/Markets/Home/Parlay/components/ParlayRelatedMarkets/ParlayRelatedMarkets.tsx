import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import Scroll from 'components/Scroll';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivStart } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { formatMarketOdds } from 'utils/markets';
import { getPositionTextV2, getTitleText } from 'utils/marketsV2';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import { Count, Title } from '../../ParlayV2';

const ParlayRelatedMarkets: React.FC = ({}) => {
    const { t } = useTranslation();

    const selectedOddsType = useSelector(getOddsType);
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
                        const market = otherTicket.sportMarkets[0];
                        const isLastRow = i === gameRelatedTickets.length - 1;
                        return (
                            <TicketRow key={`row-${i}`} isLast={isLastRow}>
                                <MarketTypeInfo>
                                    <Text>{getTitleText(market)}</Text>
                                </MarketTypeInfo>
                                <PositionInfo>
                                    <PositionText>{getPositionTextV2(market, market.position, true)}</PositionText>
                                </PositionInfo>
                                <OddsInfo>
                                    <PositionText>{formatMarketOdds(selectedOddsType, market.odd)}</PositionText>
                                </OddsInfo>
                                <PaymentInfo>
                                    <Text>
                                        {formatCurrencyWithKey(otherTicket.collateral, otherTicket.buyInAmount)}
                                    </Text>
                                </PaymentInfo>
                            </TicketRow>
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

const TicketRow = styled(FlexDiv)<{ isLast: boolean }>`
    padding: 5px 0;
    ${(props) => !props.isLast && `border-bottom: 1px dashed ${props.theme.borderColor.senary};`}
`;

const MarketTypeInfo = styled(FlexDivStart)`
    min-width: 30%;
    color: ${(props) => props.theme.textColor.quinary};
    margin-right: 5px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 10px;
    }
`;

const PositionInfo = styled(FlexDivStart)`
    min-width: 30%;
    margin-right: 5px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 10px;
    }
`;

const OddsInfo = styled(FlexDivStart)`
    margin-right: 5px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 10px;
    }
`;

const PaymentInfo = styled(FlexDivEnd)`
    width: 100%;
    color: ${(props) => props.theme.textColor.primary};
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
`;

const PositionText = styled(Text)`
    color: ${(props) => props.theme.textColor.quaternary};
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

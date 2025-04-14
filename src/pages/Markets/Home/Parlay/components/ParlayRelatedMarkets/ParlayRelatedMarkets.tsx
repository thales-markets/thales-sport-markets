import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import Scroll from 'components/Scroll';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { secondsToMilliseconds } from 'date-fns';
import { LiveTradingRequestStatus } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useLiveTradingProcessorDataQuery from 'queries/markets/useLiveTradingProcessorDataQuery';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { formatCurrencyWithKey, formatDateWithTime } from 'thales-utils';
import { LiveTradingProcessorData, LiveTradingRequest, Ticket, TicketWithGamesInfo } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import { getPositionTextV2, getTitleText, liveTradingRequestAsSportMarket } from 'utils/marketsV2';
import { refetchAfterBuy, refetchLiveTradingData } from 'utils/queryConnector';
import { delay } from 'utils/timer';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import { Count, Title } from '../../ParlayV2';

const ParlayRelatedMarkets: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const ticket = useSelector(getTicket);
    const isBiconomy = useSelector(getIsBiconomy);
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const client = useClient();

    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const isLive = useMemo(() => !!ticket[0]?.live, [ticket]);

    const liveTradingProcessorDataQuery = useLiveTradingProcessorDataQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected && isLive }
    );

    const liveTradingRequests = useMemo(
        () =>
            liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? (liveTradingProcessorDataQuery.data as LiveTradingProcessorData).requests.filter(
                      (request) => request.gameId === ticket[0]?.gameId
                  )
                : [],
        [liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data, ticket]
    );

    const userTicketsQuery = useUserTicketsQuery(walletAddress, { networkId, client }, true, {
        enabled: isConnected && !!ticket.length,
    });

    const gameRelatedSingleTickets = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? (userTicketsQuery.data as TicketWithGamesInfo).tickets.filter(
                      (userTicket) =>
                          userTicket.sportMarkets.length === 1 && // filter only single tickets
                          userTicket.sportMarkets[0].gameId === ticket[0]?.gameId
                  )
                : [],
        [userTicketsQuery.isSuccess, userTicketsQuery.data, ticket]
    );

    const gamesInfo = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? (userTicketsQuery.data as TicketWithGamesInfo).gamesInfo
                : {},
        [userTicketsQuery.isSuccess, userTicketsQuery.data]
    );

    const markets: (LiveTradingRequest | Ticket)[] = useMemo(() => {
        const requestAndTickets = [...liveTradingRequests, ...gameRelatedSingleTickets];
        return requestAndTickets;
    }, [liveTradingRequests, gameRelatedSingleTickets]);

    useEffect(() => {
        const checkPendingRequests = async () => {
            const isPendingRequests = liveTradingRequests.some(
                (market) => market.requestId && market.status === LiveTradingRequestStatus.PENDING
            );
            while (isPendingRequests) {
                refetchAfterBuy(walletAddress, networkId);
                refetchLiveTradingData(walletAddress, networkId);
                await delay(secondsToMilliseconds(5));
            }
        };

        checkPendingRequests();
    }, [liveTradingRequests, walletAddress, networkId]);

    const isLoading = liveTradingProcessorDataQuery.isLoading || userTicketsQuery.isLoading;
    const showMarkets = !isMobile || !!markets.length;

    const getRequestedMarket = (request: LiveTradingRequest) => {
        const relatedSportMarket = liveTradingRequestAsSportMarket(request, gamesInfo);

        return relatedSportMarket ? (
            <TicketRow>
                <TimeInfo>
                    <TimeText>{formatDateWithTime(new Date(request.timestamp))}</TimeText>
                </TimeInfo>
                <MarketTypeInfo>
                    <Text>{getTitleText(relatedSportMarket)}</Text>
                </MarketTypeInfo>
                <PositionInfo>
                    <PositionText>{getPositionTextV2(relatedSportMarket, request.position, true)}</PositionText>
                </PositionInfo>
                <Tooltip overlay={t(getRequestStatusStyle(request.status, theme).tooltipKey)}>
                    <Icon
                        className={getRequestStatusStyle(request.status, theme).className}
                        color={getRequestStatusStyle(request.status, theme).color}
                    />
                </Tooltip>
            </TicketRow>
        ) : (
            <></>
        );
    };

    return showMarkets ? (
        <Scroll height="100%" renderOnlyChildren={isMobile}>
            <Container>
                <Title>
                    {isLive
                        ? t('markets.parlay-related-markets.title-live')
                        : t('markets.parlay-related-markets.title')}
                    <Count>{gameRelatedSingleTickets.length}</Count>
                </Title>

                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : !!markets.length ? (
                    <RelatedMarkets>
                        {markets.map((relatedMarket: LiveTradingRequest | Ticket, i) => {
                            const isTicketCreated = !!(relatedMarket as Ticket)?.id;
                            return (
                                <RelatedMarket key={`row-${i}`}>
                                    {isTicketCreated ? (
                                        <ExpandableRow ticket={relatedMarket as Ticket} />
                                    ) : (
                                        getRequestedMarket(relatedMarket as LiveTradingRequest)
                                    )}
                                </RelatedMarket>
                            );
                        })}
                    </RelatedMarkets>
                ) : (
                    <Empty>
                        <StyledParlayEmptyIcon />
                        <EmptyLabel>{t('markets.parlay-related-markets.empty')}</EmptyLabel>
                    </Empty>
                )}
            </Container>
        </Scroll>
    ) : (
        <></>
    );
};

const ExpandableRow: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const { t } = useTranslation();

    const selectedOddsType = useSelector(getOddsType);

    const [isExpanded, setIsExpanded] = useState(false);

    const market = ticket.sportMarkets[0];

    return (
        <>
            <TicketRow onClick={() => setIsExpanded(!isExpanded)}>
                <TimeInfo>
                    <TimeText>{formatDateWithTime(ticket.timestamp)}</TimeText>
                </TimeInfo>
                <MarketTypeInfo>
                    <Text>{getTitleText(market)}</Text>
                </MarketTypeInfo>
                <PositionInfo>
                    <PositionText>{getPositionTextV2(market, market.position, true)}</PositionText>
                </PositionInfo>
                <Icon className={`icon ${isExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`} />
            </TicketRow>
            {isExpanded && (
                <TicketDetailsRow>
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

const RelatedMarkets = styled(FlexDivColumn)`
    gap: 5px;
`;

const RelatedMarket = styled.div`
    background: ${(props) => props.theme.background.secondary + '80'}; // 50% opacity
    border-radius: 5px;
`;

const Row = styled(FlexDivRowCentered)`
    padding: 6px 8px;
`;

const TicketRow = styled(Row)`
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
    cursor: pointer;
`;

const TicketDetailsRow = styled(Row)``;

const Info = styled(FlexDivStart)`
    margin-right: 5px;
`;

const TimeInfo = styled(Info)`
    width: 39px;
`;

const MarketTypeInfo = styled(Info)`
    width: 126px;
    color: ${(props) => props.theme.textColor.quinary};
`;

const PositionInfo = styled(Info)`
    width: 128px;
`;

const getRequestStatusStyle = (status: LiveTradingRequestStatus, theme: ThemeInterface) => {
    let color = '';
    let className = '';
    let tooltipKey = '';

    switch (status) {
        case LiveTradingRequestStatus.PENDING:
            color = theme.textColor.primary;
            className = 'icon icon--ongoing';
            tooltipKey = 'markets.parlay-related-markets.tooltip.pending';
            break;
        case LiveTradingRequestStatus.SUCCESS:
            color = theme.success.textColor.primary;
            className = 'icon icon--correct-full';
            tooltipKey = 'markets.parlay-related-markets.tooltip.success';
            break;
        case LiveTradingRequestStatus.FAILED:
            color = theme.error.textColor.primary;
            className = 'icon icon--wrong-full';
            tooltipKey = 'markets.parlay-related-markets.tooltip.failed';
            break;
    }
    return { color, className, tooltipKey };
};

const Icon = styled.i<{ color?: string }>`
    display: flex;
    align-items: center;
    font-size: 10px;
    ${(props) => props.color && `color: ${props.color};`}
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
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    ${(props) => props.isLabel && 'margin-right: 5px;'}
`;

const TimeText = styled(Text)`
    font-size: 10px;
    line-height: 12px;
`;

const PositionText = styled(Text)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const PayoutText = styled(Text)`
    color: ${(props) => props.theme.status.win};
`;

const Empty = styled(FlexDivColumnCentered)`
    align-items: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
`;

const EmptyLabel = styled.span`
    font-weight: 600;
    font-size: 20px;
    line-height: 38px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
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

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    width: 100%;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 0 0 8px 8px;
    flex: 1;
`;

export default ParlayRelatedMarkets;

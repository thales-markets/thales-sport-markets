import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import Scroll from 'components/Scroll';
import SimpleLoader from 'components/SimpleLoader';
import ToggleV2 from 'components/ToggleV2';
import Tooltip from 'components/Tooltip';
import { LATEST_LIVE_REQUESTS_SIZE } from 'constants/markets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { differenceInMinutes, secondsToMilliseconds } from 'date-fns';
import { LiveTradingFinalStatus, LiveTradingTicketStatus } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import { orderBy } from 'lodash';
import { useLiveTradingProcessorDataQuery } from 'queries/markets/useLiveTradingProcessorDataQuery';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getTicket, getTicketRequests, removeTicketRequestById, setTicketRequests } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';
import { formatCurrencyWithKey, formatDateWithTime, localStore } from 'thales-utils';
import {
    LiveTradingRequest,
    SportMarket,
    Ticket,
    TicketMarket,
    TicketMarketRequestData,
    TicketRequestsById,
} from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import {
    getMatchLabel,
    getPositionTextV2,
    getTitleText,
    liveTradingRequestAsSportMarket,
    serializableTicketMarketAsTicketMarket,
} from 'utils/marketsV2';
import { refetchUserLiveTradingData } from 'utils/queryConnector';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const ParlayRelatedMarkets: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const ticket = useSelector(getTicket);
    const ticketRequestsById = useSelector(getTicketRequests);
    const isBiconomy = useSelector(getIsBiconomy);
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const client = useClient();

    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();

    const isLive = useMemo(() => !!ticket[0]?.live, [ticket]);

    const [isLiveTypeSelected, setIsLiveTypeSelected] = useState(isLive);

    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const userTicketsQuery = useUserTicketsQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected && ticket.length > 0 && !isLiveTypeSelected }
    );

    const liveTradingProcessorDataQuery = useLiveTradingProcessorDataQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected && ticket.length > 0 && isLiveTypeSelected }
    );

    // Created non-live single tickets related to selected game
    const createdSingleTickets: Ticket[] = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? userTicketsQuery.data.filter(
                      (userTicket) =>
                          !userTicket.isLive &&
                          userTicket.sportMarkets.length === 1 && // filter only single tickets
                          userTicket.sportMarkets[0].gameId === ticket[0]?.gameId
                  )
                : [],
        [userTicketsQuery.isSuccess, userTicketsQuery.data, ticket]
    );

    const gamesInfo = useMemo(
        () =>
            isLiveTypeSelected && liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.gamesInfo
                : {},
        [isLiveTypeSelected, liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    const prevLiveTradingRequests = useRef<LiveTradingRequest[]>([]);
    // All live requests from contract
    const liveTradingRequests: LiveTradingRequest[] = useMemo(
        () =>
            isLiveTypeSelected && liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.liveRequests
                : [],
        [isLiveTypeSelected, liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    // Current live requests from UI (request ID could be missing if contract not reached)
    // status is updated through redux and it follows toast messages
    const tempLiveTradingRequests: TicketMarketRequestData[] = useMemo(
        () =>
            isLiveTypeSelected
                ? Object.keys(ticketRequestsById).map((requestId) => ({
                      ...ticketRequestsById[requestId],
                      ticket: serializableTicketMarketAsTicketMarket(ticketRequestsById[requestId].ticket),
                  }))
                : [],
        [isLiveTypeSelected, ticketRequestsById]
    );

    const requestIdToInitialIdRef = useRef(new Map());

    // Merged all tickets and requests, filtered and sorted
    const markets: (TicketMarketRequestData | LiveTradingRequest | Ticket)[] = useMemo(() => {
        let refreshedTempLiveTradingRequests = tempLiveTradingRequests.map((request) => {
            // take status and error reason from adapter in case UI failed with some unknown error
            const failedLiveRequest = liveTradingRequests.find(
                (liveRequest) =>
                    liveRequest.finalStatus === LiveTradingFinalStatus.FAILED &&
                    liveRequest.requestId === request.requestId
            );

            return { ...request, ...failedLiveRequest };
        });
        // Detect new liveTradingRequests and if there are new ones remove those stuck at pending from temp requests
        if (!prevLiveTradingRequests.current.length) {
            prevLiveTradingRequests.current = liveTradingRequests;
        } else {
            const diffCount = liveTradingRequests.filter(
                (request) =>
                    !prevLiveTradingRequests.current.some((prevRequest) => prevRequest.requestId === request.requestId)
            ).length;
            const isSomePending = tempLiveTradingRequests.some(
                (request) => request.status === LiveTradingTicketStatus.PENDING
            );
            if (diffCount > 0 && isSomePending) {
                let removedCount = 0;
                refreshedTempLiveTradingRequests = tempLiveTradingRequests.filter((request) => {
                    let isRequestForRemoval = false;
                    const isPending = request.status === LiveTradingTicketStatus.PENDING;
                    if (isPending && removedCount < diffCount) {
                        isRequestForRemoval = true;
                        removedCount++;
                        dispatch(removeTicketRequestById({ requestId: request.initialRequestId, networkId }));
                        // prevent markets re-render as key is base on initialRequestId
                        const requestIdForMap = orderBy(liveTradingRequests, ['timestamp'], ['desc'])[
                            diffCount - removedCount
                        ].requestId;
                        requestIdToInitialIdRef.current.set(requestIdForMap, request.initialRequestId);
                    }
                    return !isRequestForRemoval;
                });
            }
            prevLiveTradingRequests.current = liveTradingRequests;
        }

        const filteredLiveTradingRequests = liveTradingRequests.filter(
            (request) => ticketRequestsById[request.requestId] === undefined // not in temp requests
        );

        const requestsAndTickets = [
            ...refreshedTempLiveTradingRequests,
            ...filteredLiveTradingRequests,
            ...createdSingleTickets,
        ];
        return orderBy(requestsAndTickets, ['timestamp'], ['desc']).slice(0, LATEST_LIVE_REQUESTS_SIZE);
    }, [tempLiveTradingRequests, liveTradingRequests, createdSingleTickets, ticketRequestsById, dispatch, networkId]);

    // initialize ticketRequests by network ID
    useEffect(() => {
        const lsTicketRequests = localStore.get(`${LOCAL_STORAGE_KEYS.TICKET_REQUESTS}${networkId}`);
        const ticketRequests = lsTicketRequests !== undefined ? (lsTicketRequests as TicketRequestsById) : {};
        dispatch(setTicketRequests({ ticketRequests, networkId }));
    }, [networkId, dispatch]);

    // Refresh in-progress live requests on every 5s if not in temp requests and pending temp requests
    useInterval(() => {
        const isPendingRequests =
            liveTradingRequests.some(
                (request) =>
                    request.finalStatus === LiveTradingFinalStatus.IN_PROGRESS &&
                    ticketRequestsById[request.requestId] === undefined
            ) || tempLiveTradingRequests.some((request) => request.status === LiveTradingTicketStatus.PENDING);

        if (isPendingRequests) {
            refetchUserLiveTradingData(walletAddress, networkId);
        }
    }, secondsToMilliseconds(5));

    const isEmpty = useMemo(() => !markets.length, [markets]);

    const isLoading = isLiveTypeSelected ? liveTradingProcessorDataQuery.isLoading : userTicketsQuery.isLoading;

    return (
        <Container>
            <MarketsTypeContainer>
                <ToggleV2
                    label={{
                        firstLabel: t('markets.parlay-related-markets.type.live'),
                        secondLabel: t('markets.parlay-related-markets.type.other'),
                    }}
                    active={!isLiveTypeSelected}
                    handleClick={() => setIsLiveTypeSelected(!isLiveTypeSelected)}
                />
                <Title>
                    {isLiveTypeSelected
                        ? t('markets.parlay-related-markets.title-live')
                        : t('markets.parlay-related-markets.title-other')}
                </Title>
            </MarketsTypeContainer>

            <MarketsContainer>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : isEmpty ? (
                    <Empty>
                        <StyledParlayEmptyIcon />
                        <EmptyLabel>{t('markets.parlay-related-markets.empty')}</EmptyLabel>
                    </Empty>
                ) : (
                    <Scroll height={isMobile ? '467px' : '100%'}>
                        <RelatedMarkets>
                            {markets.map((relatedMarket: TicketMarketRequestData | LiveTradingRequest | Ticket) => {
                                const key =
                                    (relatedMarket as TicketMarketRequestData)?.initialRequestId ||
                                    requestIdToInitialIdRef.current.get(
                                        (relatedMarket as LiveTradingRequest)?.requestId
                                    ) ||
                                    (relatedMarket as LiveTradingRequest)?.requestId ||
                                    (relatedMarket as Ticket)?.id;
                                return (
                                    <RelatedMarket key={key}>
                                        <ExpandableRow data={relatedMarket} gamesInfo={gamesInfo} />
                                    </RelatedMarket>
                                );
                            })}
                        </RelatedMarkets>
                    </Scroll>
                )}
            </MarketsContainer>
        </Container>
    );
};

const ExpandableRow: React.FC<{ data: Ticket | LiveTradingRequest | TicketMarketRequestData; gamesInfo: any }> = ({
    data,
    gamesInfo,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector(getIsMobile);

    const selectedOddsType = useSelector(getOddsType);

    const isTicketCreated = !!(data as Ticket)?.id;
    const isLiveTradingRequest = !!(data as LiveTradingRequest)?.user;

    let market: SportMarket | TicketMarket;
    let isLive = false;
    let position = 0;
    let status = LiveTradingTicketStatus.PENDING;
    let finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
    let errorReason = '';
    let odds = 0;
    let collateral = '';
    let buyInAmount = 0;
    let payout = 0;
    let timestamp = 0;
    if (isTicketCreated) {
        const ticket = data as Ticket;
        market = ticket.sportMarkets[0];
        isLive = ticket.isLive;
        position = (market as TicketMarket).position;
        status = LiveTradingTicketStatus.COMPLETED;
        finalStatus = LiveTradingFinalStatus.SUCCESS;
        errorReason = '';
        odds = ticket.sportMarkets[0].odd;
        collateral = ticket.collateral;
        buyInAmount = ticket.buyInAmount;
        payout = ticket.payout;
        timestamp = ticket.timestamp;
    } else if (isLiveTradingRequest) {
        const requestedMarket = data as LiveTradingRequest;
        market = liveTradingRequestAsSportMarket(requestedMarket, gamesInfo);
        isLive = true;
        position = requestedMarket.position;
        status = requestedMarket.status;
        finalStatus = requestedMarket.finalStatus;
        errorReason = requestedMarket.errorReason;
        odds = requestedMarket.expectedQuote;
        collateral = requestedMarket.collateral;
        buyInAmount = requestedMarket.buyInAmount;
        payout = requestedMarket.payout;
        timestamp = requestedMarket.timestamp;
    } else {
        const requestedMarket = data as TicketMarketRequestData;
        market = requestedMarket.ticket;
        isLive = !!requestedMarket.ticket.live;
        position = (market as TicketMarket).position;
        status = requestedMarket.status;
        finalStatus = requestedMarket.finalStatus;
        errorReason = requestedMarket.errorReason;
        odds = requestedMarket.ticket.odd;
        collateral = requestedMarket.collateral;
        buyInAmount = requestedMarket.buyInAmount;
        payout = requestedMarket.payout;
        timestamp = requestedMarket.timestamp;
    }

    const [isExpanded, setIsExpanded] = useState(differenceInMinutes(Date.now(), timestamp) < 1); // collapsed if older than 1 min

    const ticketCreationStatus =
        finalStatus === LiveTradingFinalStatus.SUCCESS
            ? t('markets.parlay-related-markets.creation-status.success')
            : finalStatus === LiveTradingFinalStatus.FAILED
            ? t('markets.parlay-related-markets.creation-status.failed')
            : t('markets.parlay-related-markets.creation-status.pending');

    return (
        <TicketColumn onClick={() => setIsExpanded(!isExpanded)}>
            <Row>
                <Info>
                    <TimeInfo>
                        <TimeText>{formatDateWithTime(timestamp)}</TimeText>
                    </TimeInfo>
                    <MarketTypeInfo>
                        <MarketTypeText>{getTitleText(market)}</MarketTypeText>
                    </MarketTypeInfo>
                </Info>
                <TicketStatusInfo
                    status={finalStatus}
                    onClick={(e: any) => {
                        if (isMobile && isLive && errorReason) {
                            e.stopPropagation();
                        }
                    }}
                >
                    <StatusText status={finalStatus}>{ticketCreationStatus}</StatusText>
                    <Tooltip
                        overlay={isLive ? errorReason : ''}
                        marginLeft={3}
                        iconFontSize={12}
                        iconColor={theme.status.failed.textColor.primary}
                    />
                </TicketStatusInfo>
            </Row>
            <Row>
                <Info>
                    <Text>{getMatchLabel(market)}</Text>
                </Info>
            </Row>
            <Row>
                <Info>
                    <PositionText>{getPositionTextV2(market, position, true)}</PositionText>
                </Info>
                <IconWrapper>
                    <Icon className={`icon ${isExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`} isUp={isExpanded} />
                </IconWrapper>
            </Row>
            {isExpanded && (
                <>
                    {isLive && (
                        <StatusProgress>
                            <ProgressRow>
                                <Circle
                                    isActive={status === LiveTradingTicketStatus.PENDING}
                                    isAfterActive={false}
                                    isFinished={finalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                />
                                <ConnectionLine
                                    index={0}
                                    isProgressing={
                                        status > LiveTradingTicketStatus.PENDING &&
                                        finalStatus === LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                    isCompleted={
                                        status > LiveTradingTicketStatus.PENDING &&
                                        finalStatus !== LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                />
                                <Circle
                                    isActive={status === LiveTradingTicketStatus.REQUESTED}
                                    isAfterActive={status < LiveTradingTicketStatus.REQUESTED}
                                    isFinished={finalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                />
                                <ConnectionLine
                                    index={1}
                                    isProgressing={
                                        status > LiveTradingTicketStatus.REQUESTED &&
                                        finalStatus === LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                    isCompleted={
                                        status > LiveTradingTicketStatus.REQUESTED &&
                                        finalStatus !== LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                />
                                <Circle
                                    isActive={status === LiveTradingTicketStatus.APPROVED}
                                    isAfterActive={status < LiveTradingTicketStatus.APPROVED}
                                    isFinished={finalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                />
                                <ConnectionLine
                                    index={2}
                                    isProgressing={
                                        status > LiveTradingTicketStatus.APPROVED &&
                                        finalStatus === LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                    isCompleted={
                                        status > LiveTradingTicketStatus.APPROVED &&
                                        finalStatus !== LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                />
                                <Circle
                                    isActive={status === LiveTradingTicketStatus.FULFILLING}
                                    isAfterActive={status < LiveTradingTicketStatus.FULFILLING}
                                    isFinished={finalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                />
                                <ConnectionLine
                                    index={3}
                                    isProgressing={
                                        status > LiveTradingTicketStatus.FULFILLING &&
                                        finalStatus === LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                    isCompleted={
                                        status > LiveTradingTicketStatus.FULFILLING &&
                                        finalStatus !== LiveTradingFinalStatus.IN_PROGRESS
                                    }
                                />
                                <Circle
                                    isActive={status === LiveTradingTicketStatus.COMPLETED}
                                    isAfterActive={status < LiveTradingTicketStatus.COMPLETED}
                                    isFinished={finalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                    isFailed={finalStatus === LiveTradingFinalStatus.FAILED}
                                />
                            </ProgressRow>
                            <StatusesRow>
                                <StatusesText>{t('markets.parlay-related-markets.status.pending')}</StatusesText>
                                <StatusesText>{t('markets.parlay-related-markets.status.requested')}</StatusesText>
                                <StatusesText>{t('markets.parlay-related-markets.status.approved')}</StatusesText>
                                <StatusesText>{t('markets.parlay-related-markets.status.fulfilling')}</StatusesText>
                                <StatusesText>
                                    {t(
                                        `markets.parlay-related-markets.status.${
                                            finalStatus === LiveTradingFinalStatus.FAILED ? 'error' : 'success'
                                        }`
                                    )}
                                </StatusesText>
                            </StatusesRow>
                        </StatusProgress>
                    )}
                    <PaymentRow>
                        <OddsInfo>
                            <Label>{t('markets.parlay-related-markets.total-quote')}:</Label>
                            <OddsText>{formatMarketOdds(selectedOddsType, odds)}</OddsText>
                        </OddsInfo>
                        <PaidInfo>
                            <Label>{t('markets.parlay-related-markets.paid')}:</Label>
                            <PaidText>{formatCurrencyWithKey(collateral, buyInAmount)}</PaidText>
                        </PaidInfo>
                        <PayoutInfo>
                            <Label>{t('markets.parlay-related-markets.payout')}:</Label>
                            <PayoutText>{formatCurrencyWithKey(collateral, payout)}</PayoutText>
                        </PayoutInfo>
                    </PaymentRow>
                </>
            )}
        </TicketColumn>
    );
};

const Container = styled(FlexDivColumn)`
    position: relative;
    height: 100%;
    max-height: 545px;
    padding: 12px 0 12px 12px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: 250px;
    }
`;

const MarketsTypeContainer = styled(FlexDivSpaceBetween)`
    padding-right: 12px;
    margin-bottom: 10px;
    z-index: 1;
`;

const MarketsContainer = styled(FlexDivColumn)`
    position: relative;
    height: 100%;
    min-height: 150px;
`;

const Title = styled(FlexDivCentered)`
    position: relative;
    width: 100%;
    margin-left: 10px;
    color: ${(props) => props.theme.textColor.quaternary};
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
`;

const RelatedMarkets = styled(FlexDivColumn)`
    gap: 5px;
    margin-right: 12px;
`;

const RelatedMarket = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
`;

const TicketColumn = styled(FlexDivColumn)`
    gap: 3px;
    padding: 8px;
    cursor: pointer;
`;

const Row = styled(FlexDivRowCentered)``;

const Info = styled(FlexDivRowCentered)``;

const TimeInfo = styled(Info)`
    height: 20px;
    padding: 0 8px;
    border-radius: 10px;
    background: ${(props) => props.theme.background.quinary}66; // opacity 40%
`;

const MarketTypeInfo = styled(Info)`
    color: ${(props) => props.theme.textColor.quinary};
    padding: 0 5px;
`;

const TicketStatusInfo = styled(Info)<{ status: LiveTradingFinalStatus }>`
    height: 20px;
    padding: 0 8px;
    border-radius: 30px;
    background: ${(props) =>
        props.status === LiveTradingFinalStatus.SUCCESS
            ? props.theme.status.success.background.primary
            : props.status === LiveTradingFinalStatus.FAILED
            ? props.theme.status.failed.background.primary
            : props.theme.status.pending.background.primary};
`;

const IconWrapper = styled(FlexDivCentered)`
    min-width: 21px;
    height: 21px;
    border-radius: 50%;
    background: ${(props) => props.theme.textColor.primary}1a; // opacity 10%
`;

const Icon = styled.i<{ isUp: boolean }>`
    display: flex;
    align-items: center;
    font-size: 10px;
    margin-left: 2px;
    ${(props) => props.isUp && 'margin-bottom: 1px;'}
`;

const StatusProgress = styled(FlexDivColumn)`
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid ${(props) => props.theme.borderColor.primary};
`;

const ProgressRow = styled(Row)`
    position: relative;
`;

const Circle = styled.div<{ isActive: boolean; isAfterActive: boolean; isFinished: boolean; isFailed?: boolean }>`
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${(props) =>
        props.isFailed
            ? props.theme.status.failed.textColor.primary
            : props.isAfterActive
            ? props.theme.background.tertiary
            : props.theme.background.quaternary};
    z-index: 2;

    ${(props) => !props.isFinished && 'transition: background-color 0s ease-in 1s;'}
    animation: ${(props) => (props.isActive && !props.isFinished ? 'pulsing' : '')} 1s linear 1s infinite;

    @keyframes pulsing {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

const ConnectionLine = styled.div<{ index: number; isProgressing: boolean; isCompleted: boolean }>`
    position: absolute;
    width: 60px;
    left: ${(props) => `calc(16px * ${props.index + 1} + 60px * ${props.index})`};
    height: 2px;
    z-index: 1;

    background: ${(props) =>
        props.isCompleted
            ? props.theme.background.quaternary
            : `linear-gradient(to right, ${props.theme.background.quaternary} 50%, ${props.theme.background.tertiary} 50%);`};
    background-size: 200% 100%;
    transition: all 1s ease-out;
    background-position: ${(props) => (props.isProgressing ? 'left bottom' : 'right bottom')};

    @media (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        width: 50px;
        left: ${(props) => `calc(16px * ${props.index + 1} + 50px * ${props.index})`};
    }
`;

const StatusesRow = styled(Row)`
    align-items: baseline;
`;

const PaymentRow = styled(Row)`
    margin-top: 7px;
`;

const OddsInfo = styled(Info)`
    flex-wrap: wrap;
`;

const PaidInfo = styled(Info)`
    flex-wrap: wrap;
    margin: 0 5px;
`;

const PayoutInfo = styled(FlexDivStart)`
    flex-wrap: wrap;
`;

const Label = styled.span`
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.quinary};
`;

const Text = styled.span`
    font-weight: 500;
    font-size: 11px;
    line-height: 100%;
`;

const TimeText = styled(Text)`
    font-weight: 400;
    font-size: 10px;
    text-wrap: nowrap;
`;

const MarketTypeText = styled(Text)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const StatusText = styled(Text)<{ status: LiveTradingFinalStatus }>`
    font-size: 11px;
    font-weight: 600;
    color: ${(props) =>
        props.status === LiveTradingFinalStatus.SUCCESS
            ? props.theme.status.success.textColor.primary
            : props.status === LiveTradingFinalStatus.FAILED
            ? props.theme.status.failed.textColor.primary
            : props.theme.status.pending.textColor.primary};
`;

const PositionText = styled(Text)`
    font-size: 16px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const StatusesText = styled(Text)`
    font-weight: 400;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.quinary};
    max-width: 60px;
    &:last-child {
        max-width: 40px;
    }
    &:nth-last-child(2) {
        max-width: 50px;
    }
`;

const OddsText = styled(Text)`
    font-weight: 600;
    font-size: 12px;
`;

const PaidText = styled(OddsText)``;

const PayoutText = styled(OddsText)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const Empty = styled(FlexDivColumnCentered)`
    align-items: center;
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

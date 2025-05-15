import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { LATEST_LIVE_REQUESTS_MATURITY_DAYS, LATEST_LIVE_REQUESTS_SIZE } from 'constants/markets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { MAIN_VIEW_RIGHT_CONTAINER_WIDTH_LARGE, MAIN_VIEW_RIGHT_CONTAINER_WIDTH_MEDIUM } from 'constants/ui';
import { differenceInDays, differenceInMinutes, secondsToMilliseconds } from 'date-fns';
import { LiveTradingFinalStatus, LiveTradingTicketStatus, SportFilter } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import { orderBy } from 'lodash';
import { useLiveTradingProcessorDataQuery } from 'queries/markets/useLiveTradingProcessorDataQuery';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import { getTicket, getTicketRequests } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { Coins, formatCurrencyWithKey, formatDateWithTime } from 'thales-utils';
import { LiveTradingRequest, Ticket, TicketMarket, TicketMarketRequestData } from 'types/markets';
import { ShareTicketModalProps } from 'types/tickets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import {
    getMatchLabel,
    getPositionTextV2,
    getTitleText,
    liveTradingRequestAsTicketMarket,
    serializableTicketMarketAsTicketMarket,
} from 'utils/marketsV2';
import { refetchUserLiveTradingData } from 'utils/queryConnector';
import { updateTempLiveRequests } from 'utils/tickets';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const ParlayRelatedMarkets: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const ticket = useSelector(getTicket);
    const ticketRequestsById = useSelector(getTicketRequests);
    const sportFilter = useSelector(getSportFilter);
    const isBiconomy = useSelector(getIsBiconomy);

    const networkId = useChainId();
    const client = useClient();

    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();

    const isLiveFilterSelected = useMemo(() => sportFilter == SportFilter.Live, [sportFilter]);

    const [isSinglesExpanded, setIsSinglesExpanded] = useState(!isLiveFilterSelected);
    const [isRecentLiveExpanded, setIsRecentLiveExpanded] = useState(true);

    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const userTicketsQuery = useUserTicketsQuery(walletAddress, { networkId, client }, { enabled: isConnected });

    const liveTradingProcessorDataQuery = useLiveTradingProcessorDataQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected && isLiveFilterSelected }
    );

    // Created single tickets related to selected game
    const createdSingleTickets: Ticket[] = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? userTicketsQuery.data.filter(
                      (userTicket) =>
                          userTicket.sportMarkets.length === 1 && // filter only single tickets
                          userTicket.sportMarkets[0].gameId === ticket[0]?.gameId &&
                          (!userTicket.isLive ||
                              differenceInDays(Date.now(), Number(userTicket.timestamp)) <
                                  LATEST_LIVE_REQUESTS_MATURITY_DAYS)
                  )
                : [],
        [userTicketsQuery.isSuccess, userTicketsQuery.data, ticket]
    );

    const gamesInfo = useMemo(
        () =>
            liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.gamesInfo
                : {},
        [liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    const prevLiveTradingRequests = useRef<LiveTradingRequest[]>([]);
    // All live requests from contract
    const liveTradingRequests: LiveTradingRequest[] = useMemo(
        () =>
            liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.liveRequests.filter(
                      (request) =>
                          differenceInDays(Date.now(), Number(request.timestamp)) < LATEST_LIVE_REQUESTS_MATURITY_DAYS
                  )
                : [],
        [liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    // Current live requests from UI (request ID could be missing if contract not reached)
    // status is updated through redux and it follows toast messages
    const tempLiveTradingRequests: TicketMarketRequestData[] = useMemo(
        () =>
            Object.keys(ticketRequestsById)
                .map((requestId) => ({
                    ...ticketRequestsById[requestId],
                    ticket: serializableTicketMarketAsTicketMarket(ticketRequestsById[requestId].ticket),
                }))
                .filter(
                    (request: TicketMarketRequestData) =>
                        // only in last 24h
                        differenceInDays(Date.now(), Number(request.timestamp)) < LATEST_LIVE_REQUESTS_MATURITY_DAYS
                ),
        [ticketRequestsById]
    );

    // Merged UI and contract live requests, filtered and sorted
    const liveMarkets: (TicketMarketRequestData | LiveTradingRequest)[] = useMemo(() => {
        let updatedTempLiveTradingRequests = tempLiveTradingRequests.map((request) => {
            // take data from contract for completed trades
            const completedLiveRequest = liveTradingRequests.find(
                (liveRequest) =>
                    liveRequest.finalStatus !== LiveTradingFinalStatus.IN_PROGRESS &&
                    liveRequest.requestId === request.requestId
            );

            return completedLiveRequest
                ? ({
                      ...request,
                      totalQuote: completedLiveRequest.totalQuote,
                      payout: completedLiveRequest.payout,
                      requestId: completedLiveRequest.requestId,
                      status: completedLiveRequest.status,
                      finalStatus: completedLiveRequest.finalStatus,
                      errorReason: completedLiveRequest.errorReason,
                      timestamp: completedLiveRequest.timestamp,
                  } as TicketMarketRequestData)
                : request;
        });
        // Detect new liveTradingRequests and if there are new ones update those stuck at pending from temp requests
        if (!prevLiveTradingRequests.current.length) {
            prevLiveTradingRequests.current = liveTradingRequests;
        } else {
            const diffLiveRequets = liveTradingRequests.filter(
                (request) =>
                    !prevLiveTradingRequests.current.some((prevRequest) => prevRequest.requestId === request.requestId)
            );
            const diffCount = diffLiveRequets.length;
            const isSomePending = updatedTempLiveTradingRequests.some(
                (request) => request.status === LiveTradingTicketStatus.PENDING
            );
            if (diffCount > 0 && isSomePending) {
                updatedTempLiveTradingRequests = updateTempLiveRequests(
                    updatedTempLiveTradingRequests,
                    diffLiveRequets,
                    diffCount,
                    networkId,
                    walletAddress,
                    dispatch
                );
            }
            prevLiveTradingRequests.current = liveTradingRequests;
        }

        const filteredLiveTradingRequests = liveTradingRequests.filter(
            (request) => !ticketRequestsById[request.requestId] // not in temp requests
        );

        const requestsAndTickets = [...updatedTempLiveTradingRequests, ...filteredLiveTradingRequests];
        return orderBy(requestsAndTickets, ['timestamp'], ['desc']).slice(0, LATEST_LIVE_REQUESTS_SIZE);
    }, [tempLiveTradingRequests, liveTradingRequests, ticketRequestsById, dispatch, networkId, walletAddress]);

    // clear LS ticketRequests by network ID and wallet address
    useEffect(() => {
        window.localStorage.removeItem(`${LOCAL_STORAGE_KEYS.TICKET_REQUESTS}_${networkId}_${walletAddress}`);
    }, [networkId, walletAddress, dispatch]);

    useEffect(() => {
        setIsSinglesExpanded(!isLiveFilterSelected);
    }, [isLiveFilterSelected]);

    // Refresh in-progress live requests on every 3s if not in temp requests and pending temp requests
    useInterval(() => {
        const isPendingRequests =
            liveTradingRequests.some(
                (request) =>
                    request.finalStatus === LiveTradingFinalStatus.IN_PROGRESS && !ticketRequestsById[request.requestId]
            ) || tempLiveTradingRequests.some((request) => request.status === LiveTradingTicketStatus.PENDING);

        if (isPendingRequests) {
            refetchUserLiveTradingData(walletAddress, networkId);
        }
    }, secondsToMilliseconds(3));

    const getMarkets = (markets: (TicketMarketRequestData | LiveTradingRequest | Ticket)[]) => {
        return (
            <RelatedMarkets>
                {markets.map((market) => {
                    const key =
                        (market as TicketMarketRequestData)?.initialRequestId ||
                        (market as LiveTradingRequest)?.requestId ||
                        (market as Ticket)?.id;
                    return (
                        <RelatedMarket key={key}>
                            <ExpandableRow data={market} gamesInfo={gamesInfo} />
                        </RelatedMarket>
                    );
                })}
            </RelatedMarkets>
        );
    };

    return (
        <Container
            isExpanded={isSinglesExpanded || (isLiveFilterSelected && isRecentLiveExpanded)}
            isLiveView={isLiveFilterSelected}
            isEmpty={isLiveFilterSelected ? !liveMarkets.length : !createdSingleTickets.length}
        >
            <Section>
                <MarketsHeader onClick={() => setIsSinglesExpanded(!isSinglesExpanded)}>
                    <Title>
                        {t('markets.parlay-related-markets.title-other')}
                        <Count>{createdSingleTickets.length}</Count>
                    </Title>
                    <HeaderIcon className={`icon ${isSinglesExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`} />
                </MarketsHeader>
                {isSinglesExpanded && (
                    <MarketsContainer isLoading={userTicketsQuery.isLoading}>
                        {userTicketsQuery.isLoading ? (
                            <LoaderContainer>
                                <SimpleLoader />
                            </LoaderContainer>
                        ) : !createdSingleTickets.length ? (
                            <Empty>
                                <StyledParlayEmptyIcon />
                                <EmptyLabel>{t('markets.parlay-related-markets.empty')}</EmptyLabel>
                            </Empty>
                        ) : (
                            getMarkets(createdSingleTickets)
                        )}
                    </MarketsContainer>
                )}
            </Section>

            {isLiveFilterSelected && (
                <Section>
                    <MarketsHeader onClick={() => setIsRecentLiveExpanded(!isRecentLiveExpanded)}>
                        <Title>
                            {t('markets.parlay-related-markets.title-live')}
                            <Count>{liveMarkets.length}</Count>
                        </Title>
                        <HeaderIcon
                            className={`icon ${isRecentLiveExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`}
                        />
                    </MarketsHeader>
                    {isRecentLiveExpanded && (
                        <MarketsContainer isLoading={liveTradingProcessorDataQuery.isLoading}>
                            {liveTradingProcessorDataQuery.isLoading ? (
                                <LoaderContainer>
                                    <SimpleLoader />
                                </LoaderContainer>
                            ) : !liveMarkets.length ? (
                                <Empty>
                                    <StyledParlayEmptyIcon />
                                    <EmptyLabel>{t('markets.parlay-related-markets.empty')}</EmptyLabel>
                                </Empty>
                            ) : (
                                getMarkets(liveMarkets)
                            )}
                        </MarketsContainer>
                    )}
                </Section>
            )}
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

    const isTicketType = !!(data as Ticket)?.id;
    const isLiveTradingRequest = !!(data as LiveTradingRequest)?.user;

    let market: TicketMarket;
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
    if (isTicketType) {
        const ticket = data as Ticket;
        market = ticket.sportMarkets[0];
        isLive = ticket.isLive;
        position = (market as TicketMarket).position;
        status = LiveTradingTicketStatus.CREATED;
        finalStatus = LiveTradingFinalStatus.SUCCESS;
        errorReason = '';
        odds = ticket.sportMarkets[0].odd;
        collateral = ticket.collateral;
        buyInAmount = ticket.buyInAmount;
        payout = ticket.payout;
        timestamp = ticket.timestamp;
    } else if (isLiveTradingRequest) {
        const requestedMarket = data as LiveTradingRequest;
        market = liveTradingRequestAsTicketMarket(requestedMarket, gamesInfo);
        isLive = true;
        position = requestedMarket.position;
        status = requestedMarket.status;
        finalStatus = requestedMarket.finalStatus;
        errorReason = requestedMarket.errorReason;
        odds = requestedMarket.totalQuote;
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
        odds = requestedMarket.totalQuote;
        collateral = requestedMarket.collateral;
        buyInAmount = requestedMarket.buyInAmount;
        payout = requestedMarket.payout;
        timestamp = requestedMarket.timestamp;
    }

    const [stateStatus, setStateStatus] = useState(status);
    const [stateFinalStatus, setStateFinalStatus] = useState(finalStatus);
    const [isExpanded, setIsExpanded] = useState(
        // collapsed if live requests older than 1 min
        !isTicketType && isLive && differenceInMinutes(Date.now(), timestamp) < 1
    );
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);

    // update state status incrementaly
    useEffect(() => {
        if (stateStatus === LiveTradingTicketStatus.PENDING && status === LiveTradingTicketStatus.CREATED) {
            setStateStatus(LiveTradingTicketStatus.APPROVED);
            setStateFinalStatus(LiveTradingFinalStatus.IN_PROGRESS);
        } else if (stateStatus === LiveTradingTicketStatus.APPROVED && status === LiveTradingTicketStatus.CREATED) {
            const timeoutId = setTimeout(() => {
                setStateStatus(LiveTradingTicketStatus.CREATED);
                setStateFinalStatus(LiveTradingFinalStatus.SUCCESS);
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setStateStatus(status);
            setStateFinalStatus(finalStatus);
        }
    }, [status, stateStatus, finalStatus, stateFinalStatus]);

    const ticketCreationStatus = useMemo(
        () =>
            stateFinalStatus === LiveTradingFinalStatus.SUCCESS
                ? t('markets.parlay-related-markets.creation-status.success')
                : stateFinalStatus === LiveTradingFinalStatus.FAILED
                ? t('markets.parlay-related-markets.creation-status.failed')
                : t('markets.parlay-related-markets.creation-status.pending'),
        [stateFinalStatus, t]
    );

    const shareTicketData: ShareTicketModalProps = {
        markets: [market],
        paid: buyInAmount,
        payout: payout,
        multiSingle: false,
        onClose: () => {
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
        isTicketLost: false,
        collateral: collateral as Coins,
        isLive: isLive,
        isSgp: false,
        applyPayoutMultiplier: false,
        isTicketOpen: true,
    };

    const onTwitterIconClick = () => {
        setShareTicketModalData(shareTicketData);
        setShowShareTicketModal(true);
    };

    return (
        <>
            <TicketColumn onClick={() => setIsExpanded(!isExpanded)}>
                <FlexDivColumn>
                    <Row>
                        <TimeInfo>
                            <TimeText>{formatDateWithTime(timestamp)}</TimeText>
                        </TimeInfo>
                        <TicketStatusInfo
                            status={stateFinalStatus}
                            onClick={(e: any) => {
                                if (isMobile && isLive && errorReason) {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <StatusText status={stateFinalStatus}>{ticketCreationStatus}</StatusText>
                            <Tooltip
                                overlay={isLive ? errorReason : ''}
                                marginLeft={3}
                                iconFontSize={12}
                                iconColor={theme.status.failed.textColor.primary}
                            />
                        </TicketStatusInfo>
                    </Row>
                    <Row>
                        <MatchInfo>
                            <MatchText>{getMatchLabel(market)}</MatchText>
                        </MatchInfo>
                    </Row>
                    <Row>
                        <MarketTypeInfo>
                            <MarketTypeText>{getTitleText(market)}</MarketTypeText>
                        </MarketTypeInfo>
                    </Row>
                    <Row>
                        <Info>
                            <PositionText>{getPositionTextV2(market, position, true)}</PositionText>
                        </Info>
                        <FlexDivRowCentered>
                            {stateStatus === LiveTradingTicketStatus.CREATED && (
                                <TwitterIcon
                                    className="icon-homepage icon--x"
                                    onClick={(e: any) => {
                                        e.stopPropagation();
                                        onTwitterIconClick();
                                    }}
                                />
                            )}
                            <IconWrapper>
                                <Icon
                                    className={`icon ${isExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`}
                                    isUp={isExpanded}
                                />
                            </IconWrapper>
                        </FlexDivRowCentered>
                    </Row>
                </FlexDivColumn>

                {isExpanded && (
                    <>
                        {isLive && (
                            <StatusProgress>
                                <ProgressRow>
                                    <Circle
                                        isActive={stateStatus === LiveTradingTicketStatus.PENDING}
                                        isAfterActive={false}
                                        isFinished={stateFinalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                    />
                                    <ConnectionLine
                                        index={0}
                                        isProgressing={
                                            stateStatus > LiveTradingTicketStatus.PENDING &&
                                            stateFinalStatus === LiveTradingFinalStatus.IN_PROGRESS
                                        }
                                        isCompleted={
                                            stateStatus > LiveTradingTicketStatus.PENDING &&
                                            stateFinalStatus !== LiveTradingFinalStatus.IN_PROGRESS
                                        }
                                    />
                                    <Circle
                                        isActive={stateStatus === LiveTradingTicketStatus.APPROVED}
                                        isAfterActive={stateStatus < LiveTradingTicketStatus.APPROVED}
                                        isFinished={stateFinalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                    />
                                    <ConnectionLine
                                        index={1}
                                        isProgressing={stateStatus === LiveTradingTicketStatus.CREATED}
                                        isCompleted={
                                            stateStatus > LiveTradingTicketStatus.APPROVED &&
                                            stateFinalStatus !== LiveTradingFinalStatus.IN_PROGRESS
                                        }
                                    />
                                    <Circle
                                        isActive={stateStatus === LiveTradingTicketStatus.CREATED}
                                        isAfterActive={stateStatus < LiveTradingTicketStatus.CREATED}
                                        isFinished={stateFinalStatus !== LiveTradingFinalStatus.IN_PROGRESS}
                                        isFailed={stateFinalStatus === LiveTradingFinalStatus.FAILED}
                                    />
                                </ProgressRow>
                                <StatusesRow>
                                    <StatusesText>{t('markets.parlay-related-markets.status.pending')}</StatusesText>
                                    <StatusesText>{t('markets.parlay-related-markets.status.approved')}</StatusesText>
                                    <StatusesText>
                                        {t(
                                            `markets.parlay-related-markets.status.${
                                                stateFinalStatus === LiveTradingFinalStatus.FAILED ? 'error' : 'success'
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
            {showShareTicketModal && shareTicketModalData && (
                <ShareTicketModalV2
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                    isTicketLost={shareTicketModalData.isTicketLost}
                    collateral={shareTicketModalData.collateral}
                    isLive={shareTicketModalData.isLive}
                    isSgp={shareTicketModalData.isSgp}
                    applyPayoutMultiplier={shareTicketModalData.applyPayoutMultiplier}
                    systemBetData={shareTicketModalData.systemBetData}
                    isTicketOpen={shareTicketModalData.isTicketOpen}
                />
            )}
        </>
    );
};

const Container = styled(FlexDivColumn)<{ isExpanded: boolean; isLiveView: boolean; isEmpty: boolean }>`
    position: relative;
    max-width: ${MAIN_VIEW_RIGHT_CONTAINER_WIDTH_LARGE};
    height: 100%;
    min-height: ${(props) =>
        props.isExpanded ? (props.isLiveView ? '319px' : props.isEmpty ? '274px' : '269px') : 'unset'};
    padding: 12px;
    gap: 10px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    @media (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        max-width: ${MAIN_VIEW_RIGHT_CONTAINER_WIDTH_MEDIUM};
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        max-width: 100%;
        min-height: 250px;
    }
`;

const Section = styled(FlexDivColumn)`
    gap: 10px;
    max-height: min-content;
`;

const MarketsHeader = styled(FlexDivCentered)`
    gap: 10px;
    z-index: 1;
    cursor: pointer;
`;

const MarketsContainer = styled(FlexDivColumn)<{ isLoading: boolean }>`
    position: relative;
    max-height: max-content;
    ${(props) => props.isLoading && 'min-height: 216px;'}
`;

const Title = styled(FlexDivRow)`
    position: relative;
    width: 100%;
    color: ${(props) => props.theme.textColor.quaternary};
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
`;

const Count = styled(FlexDivCentered)`
    border-radius: 8px;
    min-width: 20px;
    color: ${(props) => props.theme.textColor.tertiary};
    background: ${(props) => props.theme.background.quaternary};
    padding: 0 5px;
    margin-left: 6px;
`;

const RelatedMarkets = styled(FlexDivColumn)`
    gap: 5px;
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

const TimeInfo = styled(Info)``;

const MatchInfo = styled(Info)``;

const MarketTypeInfo = styled(Info)`
    color: ${(props) => props.theme.textColor.quinary};
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

const HeaderIcon = styled.i`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.quaternary};
`;
const Icon = styled.i<{ isUp: boolean }>`
    display: flex;
    align-items: center;
    font-size: 10px;
    margin-left: 1px;
    ${(props) => (props.isUp ? 'margin-bottom: 1px;' : 'margin-top: 1px;')}
`;

const TwitterIcon = styled.i`
    font-size: 14px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.septenary};
    cursor: pointer;
    margin: 0 10px;
`;

const StatusProgress = styled(FlexDivColumn)`
    gap: 6px;
    padding: 5px 0 10px 0;
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

    transition: background-color 0s ease-in 1s;
    ${(props) => props.isActive && !props.isFinished && 'animation: pulsing 1s linear 1s infinite;'}

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
    width: 136px;
    left: ${(props) => `calc(16px * ${props.index + 1} + 136px * ${props.index})`};
    height: 2px;
    z-index: 1;

    background: ${(props) =>
        `linear-gradient(to right, ${props.theme.background.quaternary} 50%, ${props.theme.background.tertiary} 50%);`};
    background-size: 200% 100%;
    transition: all 1s ease-out;
    background-position: ${(props) => (props.isProgressing || props.isCompleted ? 'left bottom' : 'right bottom')};

    @media (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        width: 116px;
        left: ${(props) => `calc(16px * ${props.index + 1} + 116px * ${props.index})`};
    }
`;

const StatusesRow = styled(Row)`
    align-items: baseline;
`;

const PaymentRow = styled(Row)`
    margin-top: 5px;
`;

const OddsInfo = styled(Info)`
    flex-wrap: wrap;
`;

const PaidInfo = styled(Info)`
    flex-wrap: wrap;
    margin: 0 5px;
`;

const PayoutInfo = styled(Info)`
    flex-wrap: wrap;
`;

const Label = styled.span`
    font-weight: 400;
    font-size: 10px;
    line-height: 16px;
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
    line-height: 14px;
`;

const MatchText = styled(Text)`
    line-height: 14px;
`;

const MarketTypeText = styled(Text)`
    line-height: 14px;
    color: ${(props) => props.theme.textColor.quinary};
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
    color: ${(props) => props.theme.textColor.quaternary};
`;

const StatusesText = styled(Text)`
    font-weight: 400;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.quinary};
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
    min-height: 216px;
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

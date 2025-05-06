import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import RadioButton from 'components/fields/RadioButton';
import Scroll from 'components/Scroll';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { LATEST_LIVE_REQUESTS_SIZE } from 'constants/markets';
import { secondsToMilliseconds } from 'date-fns';
import { LiveTradingTicketStatus } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import { orderBy } from 'lodash';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getTicket, getTicketRequestStatus, removeTicketRequestById } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { formatCurrencyWithKey, formatDateWithTime } from 'thales-utils';
import {
    LiveTradingRequest,
    SportMarket,
    Ticket,
    TicketMarket,
    TicketMarketRequestData,
    TicketsWithRequestsInfo,
} from 'types/markets';
import { formatMarketOdds } from 'utils/markets';
import {
    getMatchLabel,
    getPositionTextV2,
    getTitleText,
    liveTradingRequestAsSportMarket,
    serializableTicketMarketAsTicketMarket,
} from 'utils/marketsV2';
import { refetchUserTickets } from 'utils/queryConnector';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import { Count, RadioButtonContainer, Title } from '../../ParlayV2';

const ParlayRelatedMarkets: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const ticket = useSelector(getTicket);
    const ticketRequestStatusById = useSelector(getTicketRequestStatus);
    const isBiconomy = useSelector(getIsBiconomy);
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const client = useClient();

    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();

    const isLive = useMemo(() => !!ticket[0]?.live, [ticket]);

    const [isLiveTypeSelected, setIsLiveTypeSelected] = useState(isLive);

    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const userTicketsQuery = useUserTicketsQuery(walletAddress, { networkId, client }, isLiveTypeSelected, {
        enabled: isConnected && ticket.length > 0,
    });

    const createdSingleTickets: Ticket[] = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? (userTicketsQuery.data as TicketsWithRequestsInfo).tickets.filter(
                      (userTicket) =>
                          userTicket.sportMarkets.length === 1 && // filter only single tickets
                          (isLiveTypeSelected
                              ? userTicket.isLive
                              : !userTicket.isLive && userTicket.sportMarkets[0].gameId === ticket[0]?.gameId)
                  )
                : [],
        [userTicketsQuery.isSuccess, userTicketsQuery.data, ticket, isLiveTypeSelected]
    );

    const gamesInfo = useMemo(
        () =>
            userTicketsQuery.isSuccess && userTicketsQuery.data
                ? (userTicketsQuery.data as TicketsWithRequestsInfo).gamesInfo
                : {},
        [userTicketsQuery.isSuccess, userTicketsQuery.data]
    );

    const prevLiveTradingRequests = useRef<LiveTradingRequest[]>([]);
    const liveTradingRequests: LiveTradingRequest[] = useMemo(
        () =>
            isLiveTypeSelected && userTicketsQuery.isSuccess && userTicketsQuery.data
                ? userTicketsQuery.data.liveRequests
                : [],
        [userTicketsQuery.isSuccess, userTicketsQuery.data, isLiveTypeSelected]
    );

    const tempLiveTradingRequests: TicketMarketRequestData[] = useMemo(
        () =>
            isLiveTypeSelected
                ? Object.keys(ticketRequestStatusById)
                      .filter(
                          (requestId) =>
                              // remove those which are present in created tickets
                              !liveTradingRequests.some(
                                  (request) =>
                                      request.status === LiveTradingTicketStatus.SUCCESS &&
                                      request.requestId === requestId
                              )
                      )
                      .map((requestId) => ({
                          ...ticketRequestStatusById[requestId],
                          ticket: serializableTicketMarketAsTicketMarket(ticketRequestStatusById[requestId].ticket),
                      }))
                : [],
        [ticketRequestStatusById, liveTradingRequests, isLiveTypeSelected]
    );

    const markets: (TicketMarketRequestData | LiveTradingRequest | Ticket)[] = useMemo(() => {
        const failedLiveTradingRequests = liveTradingRequests.filter(
            (request) =>
                request.status !== LiveTradingTicketStatus.SUCCESS &&
                ticketRequestStatusById[request.requestId] === undefined // not in temp requests
        );

        // Detect new liveTradingRequests and if there are new ones remove those pending from temp requests
        let refreshedTempLiveTradingRequests = tempLiveTradingRequests;
        if (!prevLiveTradingRequests.current.length) {
            prevLiveTradingRequests.current = liveTradingRequests;
        } else {
            const diffCount = liveTradingRequests.filter(
                (request) =>
                    !prevLiveTradingRequests.current.some((prevRequest) => prevRequest.requestId === request.requestId)
            ).length;
            if (diffCount > 0) {
                let removedCount = 0;
                refreshedTempLiveTradingRequests = refreshedTempLiveTradingRequests.filter((request) => {
                    const isPending = request.status === LiveTradingTicketStatus.PENDING;
                    if (isPending) {
                        removedCount++;
                    }
                    const keepRequest = !isPending || removedCount > diffCount;
                    if (!keepRequest) {
                        dispatch(removeTicketRequestById(request.initialRequestId));
                    }
                    return keepRequest;
                });
            }
            prevLiveTradingRequests.current = liveTradingRequests;
        }

        const requestsAndTickets = [
            ...refreshedTempLiveTradingRequests,
            ...failedLiveTradingRequests,
            ...createdSingleTickets,
        ];
        return orderBy(requestsAndTickets, ['timestamp'], ['desc']).slice(0, LATEST_LIVE_REQUESTS_SIZE);
    }, [tempLiveTradingRequests, liveTradingRequests, createdSingleTickets, ticketRequestStatusById, dispatch]);

    const isEmpty = useMemo(() => !markets.length, [markets]);

    // Refresh pending requests on every 5s
    useInterval(() => {
        const isPendingRequests = liveTradingRequests.some(
            (market) =>
                market.requestId &&
                ![LiveTradingTicketStatus.ERROR, LiveTradingTicketStatus.SUCCESS].includes(market.status)
        );

        if (isPendingRequests) {
            refetchUserTickets(walletAddress, networkId, true);
        }
    }, secondsToMilliseconds(5));

    return (
        <Container>
            <MarketsTypeContainer>
                <RadioButtonContainer>
                    <RadioButton
                        checked={isLiveTypeSelected}
                        value={'true'}
                        onChange={() => setIsLiveTypeSelected(true)}
                        label={t('markets.parlay-related-markets.type.live')}
                    />
                </RadioButtonContainer>
                <RadioButtonContainer>
                    <RadioButton
                        checked={!isLiveTypeSelected}
                        value={'false'}
                        onChange={() => setIsLiveTypeSelected(false)}
                        label={t('markets.parlay-related-markets.type.other')}
                    />
                </RadioButtonContainer>
            </MarketsTypeContainer>
            <Title>
                {isLiveTypeSelected
                    ? t('markets.parlay-related-markets.title-live')
                    : t('markets.parlay-related-markets.title-other')}
                <Count>{markets.length}</Count>
            </Title>
            <MarketsContainer>
                {userTicketsQuery.isLoading ? (
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
                            {markets.map((relatedMarket: TicketMarketRequestData | LiveTradingRequest | Ticket, i) => {
                                const key =
                                    (relatedMarket as Ticket)?.id ||
                                    (relatedMarket as LiveTradingRequest)?.requestId ||
                                    (relatedMarket as TicketMarketRequestData)?.initialRequestId ||
                                    i;
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

    const selectedOddsType = useSelector(getOddsType);

    const [isExpanded, setIsExpanded] = useState(false);

    const isTicketCreated = !!(data as Ticket)?.id;
    const isLiveTradingRequest = !!(data as LiveTradingRequest)?.user;

    let market: SportMarket | TicketMarket;
    let isLive = false;
    let position = 0;
    let status = LiveTradingTicketStatus.PENDING;
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
        status = LiveTradingTicketStatus.SUCCESS;
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
        errorReason = requestedMarket.errorReason;
        odds = requestedMarket.ticket.odd;
        collateral = requestedMarket.collateral;
        buyInAmount = requestedMarket.buyInAmount;
        payout = requestedMarket.payout;
        timestamp = requestedMarket.timestamp;
    }

    const isExpandable = [LiveTradingTicketStatus.SUCCESS, LiveTradingTicketStatus.ERROR].includes(status);

    return (
        <>
            <TicketRow onClick={() => setIsExpanded(!isExpanded)} isClickable={isExpandable}>
                <TimeInfo>
                    <TimeText>{formatDateWithTime(timestamp)}</TimeText>
                </TimeInfo>
                <Market>
                    <MatchInfo>
                        <MatchText>{getMatchLabel(market)}</MatchText>
                    </MatchInfo>
                    <MarketTypeInfo>
                        <Text>{getTitleText(market)}</Text>
                    </MarketTypeInfo>
                    <PositionInfo>
                        <PositionText>{getPositionTextV2(market, position, true)}</PositionText>
                    </PositionInfo>
                    {isLive && (
                        <StatusInfo>
                            <Text isLabel>{t('markets.parlay-related-markets.status-label')}:</Text>
                            <Text>{t(`markets.parlay-related-markets.status.${status}`)}</Text>
                            <Tooltip overlay={errorReason} marginLeft={5} iconFontSize={12} />
                        </StatusInfo>
                    )}
                </Market>
                <Icon
                    color={isExpandable ? undefined : 'transparent'}
                    className={`icon ${isExpanded ? 'icon--arrow-up' : 'icon--arrow-down'}`}
                />
            </TicketRow>
            {isExpanded && (
                <TicketDetailsRow>
                    <OddsInfo>
                        <PositionText isLabel>{t('markets.parlay-related-markets.total-quote')}:</PositionText>
                        <PositionText>{formatMarketOdds(selectedOddsType, odds)}</PositionText>
                    </OddsInfo>
                    <PaidInfo>
                        <Text isLabel>{t('markets.parlay-related-markets.paid')}:</Text>
                        <Text>{formatCurrencyWithKey(collateral, buyInAmount)}</Text>
                    </PaidInfo>
                    <PayoutInfo>
                        <PayoutText isLabel>{t('markets.parlay-related-markets.payout')}:</PayoutText>
                        <PayoutText>{formatCurrencyWithKey(collateral, payout)}</PayoutText>
                    </PayoutInfo>
                </TicketDetailsRow>
            )}
        </>
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

const MarketsContainer = styled(FlexDivColumn)`
    position: relative;
    height: 100%;
    min-height: 150px;
`;

const MarketsTypeContainer = styled(FlexDivCentered)`
    gap: 50px;
    z-index: 1;
`;

const RelatedMarkets = styled(FlexDivColumn)`
    gap: 5px;
    margin-right: 12px;
`;

const RelatedMarket = styled.div`
    background: ${(props) => props.theme.background.secondary + '80'}; // 50% opacity
    border-radius: 5px;
`;

const Row = styled(FlexDivRowCentered)`
    padding: 6px 8px;
`;

const TicketRow = styled(Row)<{ isClickable: boolean }>`
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
`;

const TicketDetailsRow = styled(Row)``;

const Market = styled(FlexDivColumn)`
    gap: 2px;
    margin-right: 5px;
`;

const Info = styled(FlexDivStart)``;

const TimeInfo = styled(Info)`
    width: 39px;
`;

const MatchInfo = styled(Info)``;

const MarketTypeInfo = styled(Info)`
    color: ${(props) => props.theme.textColor.quinary};
`;

const PositionInfo = styled(Info)``;

const StatusInfo = styled(Info)``;

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

const MatchText = styled(Text)`
    font-weight: 600;
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

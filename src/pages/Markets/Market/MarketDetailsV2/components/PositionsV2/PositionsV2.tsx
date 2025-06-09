import Tooltip from 'components/Tooltip';
import { QUICK_SGP_MAIN_VIEW_DISPLAY_COUNT } from 'constants/markets';
import { secondsToMilliseconds } from 'date-fns';
import { SportFilter } from 'enums/markets';
import { RiskManagementConfig } from 'enums/riskManagement';
import { intersection, orderBy } from 'lodash';
import {
    getSgpMarketsCombinationAllowed,
    isFuturesMarket,
    isTotalOrSpreadWithWholeLine,
    League,
    MarketType,
    SgpBlockerMarket,
} from 'overtime-utils';
import useRiskManagementConfigQuery from 'queries/riskManagement/useRiskManagementConfig';
import useSportMarketSgpQuery from 'queries/sgp/useSportMarketSgpQuery';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import { getIsSgp, getTicket } from 'redux/modules/ticket';
import styled from 'styled-components';
import { SgpTicket, SportMarket, TicketPosition } from 'types/markets';
import { RiskManagementSgpBlockers } from 'types/riskManagement';
import { getMarketTypeTooltipKey } from 'utils/markets';
import { getSubtitleText, getTitleText, isSameMarket, sportMarketAsTicketPosition } from 'utils/marketsV2';
import { getGridMinMaxPercentage } from 'utils/ui';
import { useChainId } from 'wagmi';
import PositionDetailsV2 from '../PositionDetailsV2';
import {
    Arrow,
    Container,
    ContentContianer,
    ContentRow,
    ContentWrapper,
    Header,
    SubTitle,
    SubTitleContainer,
    Title,
} from './styled-components';

type PositionsProps = {
    markets: SportMarket[];
    marketType: MarketType;
    isGameOpen: boolean;
    isMainPageView?: boolean;
    isColumnView?: boolean;
    showInvalid?: boolean;
    hidePlayerName?: boolean;
    alignHeader?: boolean;
    oddsTitlesHidden?: boolean;
    floatingOddsTitles?: boolean;
    width?: string;
    onAccordionClick?: () => void;
    sgpTickets?: SgpTicket[];
};

const Positions: React.FC<PositionsProps> = ({
    markets,
    marketType,
    isGameOpen,
    isMainPageView,
    isColumnView,
    showInvalid,
    onAccordionClick,
    hidePlayerName,
    alignHeader,
    oddsTitlesHidden,
    floatingOddsTitles,
    width,
    sgpTickets,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();

    const ticket = useSelector(getTicket);
    const isSgp = useSelector(getIsSgp);
    const sportFilter = useSelector(getSportFilter);
    const isMobile = useSelector(getIsMobile);

    const isPlayerPropsMarket = useMemo(() => sportFilter === SportFilter.PlayerProps, [sportFilter]);
    const isQuickSgpMarket = useMemo(() => sportFilter === SportFilter.QuickSgp, [sportFilter]);

    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const isSgpEnabled = useMemo(() => isSgp && ticket.length > 0, [isSgp, ticket.length]);

    const riskManagementSgpBlockersQuery = useRiskManagementConfigQuery(
        [RiskManagementConfig.SGP_BLOCKERS],
        { networkId },
        { enabled: isSgpEnabled }
    );

    const sgpBlockers = useMemo(
        () =>
            riskManagementSgpBlockersQuery.isSuccess && riskManagementSgpBlockersQuery.data
                ? (riskManagementSgpBlockersQuery.data as RiskManagementSgpBlockers).sgpBlockers
                : [],
        [riskManagementSgpBlockersQuery.isSuccess, riskManagementSgpBlockersQuery.data]
    );

    // check if postion is valid by SGP blocking rules
    const isPositionBlockedBySgpCombination = useCallback(
        (market: SportMarket, position: number) => {
            let isBlocked = false;

            if (isSgpEnabled) {
                const isSameGame = ticket[0].gameId === market.gameId;
                const isAlreadyOnTicket = ticket.some((ticketPosition) => isSameMarket(market, ticketPosition));
                if (isSameGame && !isAlreadyOnTicket) {
                    const ticketBlockerMarkets: SgpBlockerMarket[] = ticket.map((ticketPosition) => ({
                        leagueId: ticketPosition.leagueId,
                        typeId: ticketPosition.typeId,
                        playerId: ticketPosition.playerProps.playerId,
                        line: ticketPosition.line,
                        position: ticketPosition.position,
                    }));
                    const currentMarketPosition: SgpBlockerMarket = {
                        leagueId: market.leagueId,
                        typeId: market.typeId,
                        playerId: market.playerProps.playerId,
                        line: market.line,
                        position,
                    };
                    const sgpBlockerMarkets = [...ticketBlockerMarkets, currentMarketPosition];
                    const combinationAllowance = getSgpMarketsCombinationAllowed(sgpBlockerMarkets, sgpBlockers);
                    isBlocked = !combinationAllowance.isAllowed;
                }
            }

            return isBlocked;
        },
        [isSgpEnabled, ticket, sgpBlockers]
    );

    const marketsAvailableForSgpQuery = useSportMarketSgpQuery(
        ticket[0],
        { networkId },
        { enabled: isSgpEnabled, refetchInterval: secondsToMilliseconds(30) }
    );

    const marketAvailableForSgp = useMemo(
        () =>
            marketsAvailableForSgpQuery.isSuccess && marketsAvailableForSgpQuery.data
                ? marketsAvailableForSgpQuery.data
                : undefined,
        [marketsAvailableForSgpQuery.data, marketsAvailableForSgpQuery.isSuccess]
    );

    // check if position is supported by SGP sportsbooks
    const isPositionUnsupportedBySgpSportsbooks = useCallback(
        (market: SportMarket, position: number) => {
            if (isSgpEnabled && marketAvailableForSgp && market.gameId === marketAvailableForSgp.gameId) {
                const marketAvailableForSgpCopy = { ...marketAvailableForSgp };

                let ticketCommonSportsbooks: string[] = [];
                ticket.forEach((ticketPosition: TicketPosition, index) => {
                    const isMoneyline = ticketPosition.typeId === MarketType.WINNER;
                    const sgpChildMarket = marketAvailableForSgpCopy.childMarkets.find((childMarket) =>
                        isSameMarket(childMarket, ticketPosition)
                    );
                    const sgpSportsbooks =
                        (isMoneyline ? marketAvailableForSgpCopy.sgpSportsbooks : sgpChildMarket?.sgpSportsbooks) || [];

                    if (index === 0) {
                        ticketCommonSportsbooks = sgpSportsbooks;
                    } else {
                        const commonSportsbooks = intersection(ticketCommonSportsbooks, sgpSportsbooks);
                        ticketCommonSportsbooks = commonSportsbooks;
                    }
                });

                const selectedMarketSportsbooks =
                    (market.typeId === MarketType.WINNER
                        ? marketAvailableForSgpCopy.sgpSportsbooks
                        : marketAvailableForSgpCopy.childMarkets.find((childMarket) =>
                              isSameMarket(childMarket, sportMarketAsTicketPosition(market, position))
                          )?.sgpSportsbooks) || [];

                const isUnsupported = intersection(selectedMarketSportsbooks, ticketCommonSportsbooks).length === 0;

                return isUnsupported;
            }

            return false;
        },
        [isSgpEnabled, marketAvailableForSgp, ticket]
    );

    // check for SGP if position is total/spread market which lines are not whole number
    const isPositionUnsupportedBySgpType = useCallback(
        (market: SportMarket) => isSgpEnabled && isTotalOrSpreadWithWholeLine(market.typeId, market.line),
        [isSgpEnabled]
    );

    const hasOdds = markets.some((market) => market.odds.length);

    const showContainer = !isGameOpen || hasOdds || showInvalid;

    const filteredQuickSgpMarkets = useMemo(
        () =>
            isQuickSgpMarket && markets[0].childMarkets
                ? markets[0].childMarkets.filter((childMarket) => childMarket.typeId === marketType)
                : [],
        [isQuickSgpMarket, markets, marketType]
    );

    const sortedMarkets = useMemo(() => {
        if (isQuickSgpMarket) {
            let displaySgpMarkets = markets;
            if (filteredQuickSgpMarkets.length > 0) {
                const maxQuickSgpMarkets = QUICK_SGP_MAIN_VIEW_DISPLAY_COUNT;
                displaySgpMarkets = filteredQuickSgpMarkets.map((market) => ({
                    ...market,
                    odds: market.odds.slice(0, maxQuickSgpMarkets),
                    positionNames: market.positionNames?.slice(0, maxQuickSgpMarkets),
                }));
            }
            return orderBy(displaySgpMarkets, ['line', 'odds'], ['asc', 'desc']);
        } else {
            return orderBy(markets, ['line', 'odds'], ['asc', 'desc']);
        }
    }, [markets, isQuickSgpMarket, filteredQuickSgpMarkets]);

    const positionText0 = !filteredQuickSgpMarkets.length && markets[0] ? getSubtitleText(markets[0], 0) : undefined;
    const positionText1 = !filteredQuickSgpMarkets.length && markets[0] ? getSubtitleText(markets[0], 1) : undefined;
    const titleText = getTitleText(
        !!filteredQuickSgpMarkets.length ? filteredQuickSgpMarkets[0] : markets[0],
        !isPlayerPropsMarket,
        isPlayerPropsMarket
    );

    const tooltipKey = getMarketTypeTooltipKey(marketType);

    return (
        showContainer && (
            <Container
                onClick={() => {
                    if (!isExpanded) {
                        setIsExpanded(!isExpanded);
                        onAccordionClick && onAccordionClick();
                    }
                }}
                isExpanded={isExpanded}
                isMainPageView={isMainPageView}
                width={width}
            >
                <Header
                    isMainPageView={isMainPageView}
                    isColumnView={isColumnView}
                    alignHeader={alignHeader && (!!positionText0 || !!positionText1) && isExpanded && !isMobile}
                    hidden={oddsTitlesHidden}
                    float={floatingOddsTitles}
                    isSticky={!floatingOddsTitles && !isPlayerPropsMarket && !isMainPageView}
                >
                    {((isMobile && !isMainPageView) || !isMobile || isPlayerPropsMarket) && (
                        <Title isExpanded={isExpanded} isMainPageView={isMainPageView} isColumnView={isColumnView}>
                            {titleText}
                            {tooltipKey && (
                                <Tooltip
                                    overlay={<>{t(`markets.market-card.type-tooltip.${tooltipKey}`)}</>}
                                    iconFontSize={13}
                                    marginLeft={3}
                                />
                            )}
                        </Title>
                    )}
                    {!isMainPageView && (
                        <Arrow
                            className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                            onClick={() => {
                                setIsExpanded(!isExpanded);
                                onAccordionClick && onAccordionClick();
                            }}
                        />
                    )}
                </Header>

                {isExpanded && (
                    <ContentContianer>
                        {(positionText0 || positionText1) && !isMainPageView && (
                            <SubTitleContainer>
                                {positionText0 && <SubTitle>{positionText0}</SubTitle>}
                                {positionText1 && <SubTitle>{positionText1}</SubTitle>}
                            </SubTitleContainer>
                        )}
                        {sortedMarkets.map((market, index) => {
                            const oddsInfo = market.odds.map((odd: number, index: number) => {
                                const position = index;
                                const isBlocked =
                                    isPositionBlockedBySgpCombination(market, position) ||
                                    isPositionUnsupportedBySgpType(market) ||
                                    isPositionUnsupportedBySgpSportsbooks(market, position);

                                return {
                                    odd,
                                    position,
                                    positionName: market.positionNames ? market.positionNames[position] : '',
                                    isBlocked,
                                };
                            });

                            const sortedOddsInfo = orderBy(oddsInfo, ['odd', 'position'], ['desc', 'asc']);
                            const isFutures = isFuturesMarket(market.typeId);

                            const oddsForDisplay = isFutures ? sortedOddsInfo : oddsInfo;

                            const filteredOdds =
                                isMainPageView &&
                                market.typeId === MarketType.WINNER &&
                                market.leagueId === League.US_ELECTION
                                    ? oddsForDisplay.slice(0, 2)
                                    : oddsForDisplay;

                            return (
                                <ContentWrapper key={index}>
                                    {market.isPlayerPropsMarket && !hidePlayerName && (
                                        <PropsTextContainer>
                                            <PropsText>{`${market.playerProps.playerName}`}</PropsText>
                                        </PropsTextContainer>
                                    )}
                                    <ContentRow
                                        gridMinMaxPercentage={getGridMinMaxPercentage(market, isMobile)}
                                        isColumnView={isColumnView}
                                        isPlayerProps={!!isPlayerPropsMarket}
                                    >
                                        {filteredOdds.map((oddsData, index) => {
                                            const position = isFutures
                                                ? oddsInfo.findIndex(
                                                      (oddInfo) =>
                                                          market.positionNames &&
                                                          oddInfo.positionName === filteredOdds[index].positionName
                                                  )
                                                : index;

                                            return (
                                                <PositionDetailsV2
                                                    key={`${market.gameId}-${market.typeId}-${market.line}-${market.playerProps.playerId}-${position}`}
                                                    market={market}
                                                    position={position}
                                                    isMainPageView={isMainPageView}
                                                    isColumnView={isColumnView}
                                                    displayPosition={index}
                                                    isPositionBlocked={oddsData.isBlocked}
                                                    sgpTickets={sgpTickets}
                                                />
                                            );
                                        })}
                                    </ContentRow>
                                </ContentWrapper>
                            );
                        })}
                    </ContentContianer>
                )}
            </Container>
        )
    );
};

const PropsTextContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px 0;
`;

const PropsText = styled.span`
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    text-transform: capitalize;
`;

export default Positions;

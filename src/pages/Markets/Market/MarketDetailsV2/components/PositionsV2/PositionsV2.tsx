import Tooltip from 'components/Tooltip';
import { SportFilter } from 'enums/markets';
import { MarketType } from 'enums/marketTypes';
import { League } from 'enums/sports';
import { orderBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import styled from 'styled-components';
import { SportMarket } from 'types/markets';
import { getMarketTypeTooltipKey, isFuturesMarket } from 'utils/markets';
import { getSubtitleText, getTitleText } from 'utils/marketsV2';
import { getGridMinMaxPercentage } from 'utils/ui';
import PositionDetailsV2 from '../PositionDetailsV2';
import {
    Arrow,
    Container,
    ContentContianer,
    ContentRow,
    ContentWrapper,
    Header,
    Message,
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
    isGameLive?: boolean;
    hidePlayerName?: boolean;
    alignHeader?: boolean;
    oddsTitlesHidden?: boolean;
    floatingOddsTitles?: boolean;
    onAccordionClick?: () => void;
};

const Positions: React.FC<PositionsProps> = ({
    markets,
    marketType,
    isGameOpen,
    isMainPageView,
    isColumnView,
    showInvalid,
    isGameLive,
    onAccordionClick,
    hidePlayerName,
    alignHeader,
    oddsTitlesHidden,
    floatingOddsTitles,
}) => {
    const { t } = useTranslation();

    const sportFilter = useSelector(getSportFilter);
    const isMobile = useSelector(getIsMobile);

    const isPlayerPropsMarket = useMemo(() => sportFilter === SportFilter.PlayerProps, [sportFilter]);

    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const hasOdds = markets.some((market) => market.odds.length);

    const showContainer = !isGameOpen || hasOdds || showInvalid;

    const sortedMarkets = useMemo(() => orderBy(markets, ['line', 'odds'], ['asc', 'desc']), [markets]);

    const positionText0 = markets[0] ? getSubtitleText(markets[0], 0) : undefined;
    const positionText1 = markets[0] ? getSubtitleText(markets[0], 1) : undefined;
    const titleText = getTitleText(markets[0], !isPlayerPropsMarket);

    const tooltipKey = getMarketTypeTooltipKey(marketType);

    const liveMarketErrorMessage =
        markets[0].live && markets[0].errorMessage
            ? // TODO: if we want to remove teams add .replace(` ${markets[0].homeTeam} - ${markets[0].awayTeam}`, '');
              markets[0].errorMessage
            : '';

    return showContainer ? (
        <Container
            onClick={() => {
                if (!isExpanded) {
                    setIsExpanded(!isExpanded);
                    onAccordionClick && onAccordionClick();
                }
            }}
            isExpanded={isExpanded}
            isMainPageView={isMainPageView}
        >
            <Header
                isMainPageView={isMainPageView}
                isColumnView={isColumnView}
                alignHeader={alignHeader && (!!positionText0 || !!positionText1) && isExpanded && !isMobile}
                hidden={oddsTitlesHidden}
                float={floatingOddsTitles}
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
            </Header>
            {!isMainPageView && (
                <Arrow
                    className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                    onClick={() => {
                        setIsExpanded(!isExpanded);
                        onAccordionClick && onAccordionClick();
                    }}
                />
            )}
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
                            return {
                                odd,
                                position: index,
                                positionName: market.positionNames ? market.positionNames[index] : '',
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
                                >
                                    {filteredOdds.map((_, index) => {
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
    ) : isGameLive ? (
        <Container isExpanded={true} noOdds={true}>
            <Message>
                {t(`markets.market-card.live-trading-paused`)}
                {liveMarketErrorMessage && <Tooltip overlay={liveMarketErrorMessage} marginLeft={5} top={0} />}
            </Message>
        </Container>
    ) : (
        <></>
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

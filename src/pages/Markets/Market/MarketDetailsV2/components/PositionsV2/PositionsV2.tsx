import Tooltip from 'components/Tooltip';
import { MarketType } from 'enums/marketTypes';
import { orderBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { SportMarket } from 'types/markets';
import { getMarketTypeTooltipKey } from 'utils/markets';
import { getSubtitleText, getTitleText } from 'utils/marketsV2';
import { League } from '../../../../../../enums/sports';
import { getGridMinMaxPercentage } from '../../../../../../utils/ui';
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
}) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const hasOdds = markets.some((market) => market.odds.length);

    const showContainer = !isGameOpen || hasOdds || showInvalid;

    const sortedMarkets = useMemo(() => orderBy(markets, ['line', 'odds'], ['asc', 'desc']), [markets]);

    const positionText0 = markets[0] ? getSubtitleText(markets[0], 0) : undefined;
    const positionText1 = markets[0] ? getSubtitleText(markets[0], 1) : undefined;
    const titleText = getTitleText(markets[0], true);
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
            <Header isMainPageView={isMainPageView} isColumnView={isColumnView}>
                {((isMobile && !isMainPageView) || !isMobile) && (
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
                        const odds =
                            isMainPageView &&
                            market.typeId === MarketType.WINNER &&
                            market.leagueId === League.US_ELECTION
                                ? market.odds.slice(0, 2)
                                : market.odds;
                        return (
                            <ContentWrapper key={index}>
                                {market.isPlayerPropsMarket && (
                                    <PropsTextContainer>
                                        <PropsText>{`${market.playerProps.playerName}`}</PropsText>
                                    </PropsTextContainer>
                                )}
                                <ContentRow
                                    gridMinMaxPercentage={getGridMinMaxPercentage(market, isMobile)}
                                    isColumnView={isColumnView}
                                >
                                    {odds.map((_, index) => (
                                        <PositionDetailsV2
                                            key={index}
                                            market={market}
                                            position={index}
                                            isMainPageView={isMainPageView}
                                            isColumnView={isColumnView}
                                        />
                                    ))}
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

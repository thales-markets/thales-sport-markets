import Tooltip from 'components/Tooltip';
import { MarketType } from 'enums/marketTypes';
import { orderBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SportMarket } from 'types/markets';
import { getMarketTypeName } from 'utils/markets';
import { getSubtitleText, getTitleText, isOddValid } from 'utils/marketsV2';
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
    onAccordionClick?: () => void;
};

const Positions: React.FC<PositionsProps> = ({
    markets,
    marketType,
    isGameOpen,
    isMainPageView,
    isColumnView,
    onAccordionClick,
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const areOddsValid = markets.some((market) => market.odds.some((odd) => isOddValid(odd)));

    const showContainer = !isGameOpen || areOddsValid;

    const sortedMarkets = useMemo(
        () =>
            orderBy(markets, ['line'], ['asc']).sort((marketA: SportMarket, marketB: SportMarket) => {
                return sortMarketsByDisabled(marketA, marketB);
            }),
        [markets]
    );

    const positionText0 = markets[0] ? getSubtitleText(markets[0], 0) : undefined;
    const positionText1 = markets[0] ? getSubtitleText(markets[0], 1) : undefined;

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
                <Title isExpanded={isExpanded} isMainPageView={isMainPageView} isColumnView={isColumnView}>
                    {getTitleText(markets[0])}
                    {marketType == MarketType.PLAYER_PROPS_TOUCHDOWNS && (
                        <Tooltip
                            overlay={
                                <>
                                    {t(
                                        `markets.market-card.odd-tooltip.player-props.info.${getMarketTypeName(
                                            marketType
                                        )}`
                                    )}
                                </>
                            }
                            iconFontSize={13}
                            marginLeft={3}
                        />
                    )}
                </Title>
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
                        return (
                            <ContentWrapper key={index}>
                                {market.isPlayerPropsMarket && (
                                    <PropsTextContainer>
                                        <PropsText>{`${market.playerProps.playerName}`}</PropsText>
                                    </PropsTextContainer>
                                )}
                                <ContentRow
                                    gridMinMaxPercentage={market.odds.length === 3 ? 33 : 50}
                                    isColumnView={isColumnView}
                                >
                                    {market.odds.map((_, index) => (
                                        <PositionDetailsV2
                                            key={index}
                                            market={market}
                                            position={index}
                                            isMainPageView={isMainPageView}
                                        />
                                    ))}
                                </ContentRow>
                            </ContentWrapper>
                        );
                    })}
                </ContentContianer>
            )}
        </Container>
    ) : (
        <></>
    );
};

const sortMarketsByDisabled = (marketA: SportMarket, marketB: SportMarket) => {
    const isGameStartedA = marketA.maturityDate < new Date();
    const isGameOpenA = !marketA.isResolved && !marketA.isCanceled && !marketA.isPaused && !isGameStartedA;
    const noOddA = !marketA.odds[0] || marketA.odds[0] == 0;

    const isGameStartedB = marketB.maturityDate < new Date();
    const isGameOpenB = !marketB.isResolved && !marketB.isCanceled && !marketB.isPaused && !isGameStartedB;
    const noOddB = !marketB.odds[0] || marketB.odds[0] == 0;

    const disabledPositionA = noOddA || !isGameOpenA;
    const disabledPositionB = noOddB || !isGameOpenB;
    return disabledPositionB ? -1 : disabledPositionA ? 0 : 1;
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
    font-weight: 300;
    text-transform: capitalize;
`;

export default Positions;

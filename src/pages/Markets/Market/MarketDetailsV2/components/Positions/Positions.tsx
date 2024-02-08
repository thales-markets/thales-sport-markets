import Tooltip from 'components/Tooltip';
import { BetTypeNameMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SportMarketInfo } from 'types/markets';
import { isGolf, isMotosport, isOneSidePlayerProps, isPlayerProps } from 'utils/markets';
import DoubleChanceMarketPositions from '../DoubleChanceMarketPositions';
import MarketPositions from '../MarketPositions';
import { Arrow, Container, ContentContianer, ContentRow, Header, Title } from './styled-components';

type PositionsProps = {
    markets: SportMarketInfo[];
    betType: BetType;
    areDoubleChanceMarkets?: boolean;
    showOdds: boolean;
};

const Positions: React.FC<PositionsProps> = ({ markets, betType, areDoubleChanceMarkets, showOdds }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    let areOddsValid = true;
    const sportTag = Number(markets[0].tags[0]);
    if (!areDoubleChanceMarkets) {
        const latestMarket = markets.filter((market) => !market.isCanceled && !market.isPaused)[0];
        if (latestMarket) {
            areOddsValid = latestMarket.drawOdds
                ? [latestMarket.homeOdds, latestMarket.awayOdds, latestMarket.drawOdds].every(
                      (odd) => odd < 1 && odd != 0
                  )
                : [latestMarket.homeOdds, latestMarket.awayOdds].every((odd) => odd < 1 && odd != 0);
        }
    }

    const showContainer =
        !showOdds ||
        isMotosport(sportTag) ||
        isGolf(sportTag) ||
        areDoubleChanceMarkets ||
        areOddsValid ||
        isOneSidePlayerProps(betType);

    return showContainer ? (
        <Container onClick={() => (!isExpanded ? setIsExpanded(!isExpanded) : '')}>
            <Header>
                <Title isExpanded={isExpanded}>
                    {BetTypeNameMap[betType]}
                    {(markets[0].betType as BetType) == BetType.PLAYER_PROPS_TOUCHDOWNS && (
                        <Tooltip
                            overlay={
                                <>
                                    {t(
                                        `markets.market-card.odd-tooltip.player-props.info.${
                                            BetTypeNameMap[markets[0].betType as BetType]
                                        }`
                                    )}
                                </>
                            }
                            iconFontSize={13}
                            marginLeft={3}
                        />
                    )}
                </Title>
            </Header>
            <Arrow
                className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                onClick={() => setIsExpanded(!isExpanded)}
            />
            {isExpanded && (
                <ContentContianer>
                    {areDoubleChanceMarkets ? (
                        <ContentRow>
                            <DoubleChanceMarketPositions markets={markets} showOdds={showOdds} />
                        </ContentRow>
                    ) : (
                        markets
                            .sort((marketA: SportMarketInfo, marketB: SportMarketInfo) => {
                                return sortMarketsByDisabled(marketA, marketB);
                            })
                            .map((market) => {
                                return (
                                    <div key={market.address}>
                                        {isPlayerProps(market.betType) && (
                                            <PropsTextContainer>
                                                <PropsText>{`${market.playerName}`}</PropsText>
                                            </PropsTextContainer>
                                        )}
                                        <ContentRow>
                                            <MarketPositions market={market} />
                                        </ContentRow>
                                    </div>
                                );
                            })
                    )}
                </ContentContianer>
            )}
        </Container>
    ) : (
        <></>
    );
};

const sortMarketsByDisabled = (marketA: SportMarketInfo, marketB: SportMarketInfo) => {
    const isGameStartedA = marketA.maturityDate < new Date();
    const isGameOpenA = !marketA.isResolved && !marketA.isCanceled && !marketA.isPaused && !isGameStartedA;
    const noOddA = !marketA.homeOdds || marketA.homeOdds == 0;

    const isGameStartedB = marketB.maturityDate < new Date();
    const isGameOpenB = !marketB.isResolved && !marketB.isCanceled && !marketB.isPaused && !isGameStartedB;
    const noOddB = !marketB.homeOdds || marketB.homeOdds == 0;

    const disabledPositionA = noOddA || !isGameOpenA;
    const disabledPositionB = noOddB || !isGameOpenB;
    return disabledPositionB ? -1 : disabledPositionA ? 0 : 1;
};

const PropsTextContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    margin-top: 4px;
`;

const PropsText = styled.span`
    font-size: 12px;
    font-style: normal;
    font-weight: 300;
    text-transform: capitalize;
`;

export default Positions;

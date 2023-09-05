import { BetTypeNameMap } from 'constants/tags';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { isGolf, isMotosport, isPlayerProps } from 'utils/markets';
import DoubleChanceMarketPositions from '../DoubleChanceMarketPositions';
import MarketPositions from '../MarketPositions';
import { Arrow, Container, ContentContianer, ContentRow, Header, Title } from './styled-components';
import { BetType } from 'enums/markets';
import styled from 'styled-components';

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
        !showOdds || isMotosport(sportTag) || isGolf(sportTag) || areDoubleChanceMarkets || areOddsValid;

    return showContainer ? (
        <Container>
            <Header>
                <Title isExpanded={isExpanded}>{t(`markets.market-card.bet-type.${BetTypeNameMap[betType]}`)}</Title>
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
                        markets.map((market) => {
                            return (
                                <div key={market.address}>
                                    {isPlayerProps(market.betType) && (
                                        <PropsTextContainer>
                                            <PropsText>{`${market.playerName} (${
                                                BetTypeNameMap[market.betType as BetType]
                                            })`}</PropsText>
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

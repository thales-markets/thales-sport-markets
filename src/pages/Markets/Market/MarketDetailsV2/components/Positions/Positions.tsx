import { BetType, BetTypeNameMap } from 'constants/tags';
import React, { useState } from 'react';
import { SportMarketInfo } from 'types/markets';
import MarketPositions from '../MarketPositions';
import { useTranslation } from 'react-i18next';
import { Container, Header, Title, ContentContianer, Arrow, ContentRow } from './styled-components';
import DoubleChanceMarketPositions from '../DoubleChanceMarketPositions';

type PositionsProps = {
    markets: SportMarketInfo[];
    betType: BetType;
    areDoubleChanceMarkets?: boolean;
};

const Positions: React.FC<PositionsProps> = ({ markets, betType, areDoubleChanceMarkets }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const areDoubleChanceMarketsOddsValid = areDoubleChanceMarkets
        ? markets.map((item) => item.homeOdds).every((odd) => odd < 1 && odd != 0)
        : false;

    const latestMarket = markets[markets.length - 1];
    const areOddsValid = latestMarket.drawOdds
        ? [latestMarket.homeOdds, latestMarket.awayOdds, latestMarket.drawOdds].every((odd) => odd < 1 && odd != 0)
        : [latestMarket.homeOdds, latestMarket.awayOdds].every((odd) => odd < 1 && odd != 0);

    const showContainer = betType == BetType.DOUBLE_CHANCE ? areDoubleChanceMarketsOddsValid : areOddsValid;

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
                            <DoubleChanceMarketPositions markets={markets} />
                        </ContentRow>
                    ) : (
                        markets.map((market) => {
                            return (
                                <ContentRow key={market.address}>
                                    <MarketPositions market={market} />
                                </ContentRow>
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

export default Positions;

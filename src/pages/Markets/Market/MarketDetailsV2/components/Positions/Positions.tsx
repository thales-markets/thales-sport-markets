import { BetType, BetTypeNameMap } from 'constants/tags';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { isMotosport } from 'utils/markets';
import DoubleChanceMarketPositions from '../DoubleChanceMarketPositions';
import MarketPositions from '../MarketPositions';
import { Arrow, Container, ContentContianer, ContentRow, Header, Title } from './styled-components';

type PositionsProps = {
    markets: SportMarketInfo[];
    betType: BetType;
    areDoubleChanceMarkets?: boolean;
};

const Positions: React.FC<PositionsProps> = ({ markets, betType, areDoubleChanceMarkets }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    // const areDoubleChanceMarketsOddsValid = areDoubleChanceMarkets
    //     ? markets.map((item) => item.homeOdds).every((odd) => odd < 1 && odd != 0)
    //     : false;

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

    const showContainer = isMotosport(sportTag) || areDoubleChanceMarkets ? true : areOddsValid;

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

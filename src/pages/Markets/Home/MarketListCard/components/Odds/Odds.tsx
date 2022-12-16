import { Position } from 'constants/options';
import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getVisibilityOfDrawOptionByTagId } from 'utils/markets';
import { Status } from '../MatchStatus/MatchStatus';
import Odd from '../Odd/Odd';
import { Container, OddsContainer, Title } from './styled-components';

type OddsProps = {
    market: SportMarketInfo;
};

const Odds: React.FC<OddsProps> = ({ market }) => {
    const { t } = useTranslation();

    const isLive = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && !isLive && !isGameResolved && !market.isPaused;
    const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);

    return (
        <Container>
            <Title>
                {market.betType === 10001
                    ? `HANDICAP ${market.spread}`
                    : market.betType === 10002
                    ? `TOTAL ${market.total}`
                    : 'WINNER'}
            </Title>
            {noOdds ? (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <OddsContainer>
                    <Odd
                        market={market}
                        position={Position.HOME}
                        odd={market.homeOdds}
                        priceImpact={market.homePriceImpact}
                    />
                    {showDrawOdds && (
                        <Odd
                            market={market}
                            position={Position.DRAW}
                            odd={market.drawOdds}
                            priceImpact={market.drawPriceImpact}
                        />
                    )}
                    <Odd
                        market={market}
                        position={Position.AWAY}
                        odd={market.awayOdds}
                        priceImpact={market.awayPriceImpact}
                    />
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;

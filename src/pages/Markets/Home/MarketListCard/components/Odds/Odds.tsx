import { Position } from 'constants/options';
import { BetType, BetTypeNameMap } from 'constants/tags';
import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getSpreadTotalText, getVisibilityOfDrawOption } from 'utils/markets';
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
    const showDrawOdds = getVisibilityOfDrawOption(market.tags, market.betType);
    const spreadTotalText = getSpreadTotalText(market, Position.HOME);

    return (
        <Container>
            <Title>
                {t(`markets.market-card.bet-type.${BetTypeNameMap[market.betType as BetType]}`)}
                {spreadTotalText && ` ${spreadTotalText}`}
            </Title>
            {noOdds ? (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <OddsContainer>
                    <Odd market={market} position={Position.HOME} odd={market.homeOdds} bonus={market.homeBonus} />
                    {showDrawOdds && (
                        <Odd market={market} position={Position.DRAW} odd={market.drawOdds} bonus={market.drawBonus} />
                    )}
                    <Odd market={market} position={Position.AWAY} odd={market.awayOdds} bonus={market.awayBonus} />
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;

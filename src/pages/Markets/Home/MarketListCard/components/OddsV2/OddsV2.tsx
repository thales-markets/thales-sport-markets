import React from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfoV2 } from 'types/markets';
import OddV2 from '../OddV2';
import { Container, OddsContainer, Title } from './styled-components';

type OddsProps = {
    market: SportMarketInfoV2;
    isShownInSecondRow?: boolean;
};

const Odds: React.FC<OddsProps> = ({ market }) => {
    const { t } = useTranslation();

    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const showOdds = !isGameResolved && !isGameStarted && !market.isPaused;
    // const spreadTotalText = getSpreadTotalText(market, Position.HOME);
    const spreadTotalText = 'vvv';

    const areOddsValid = market.odds.every((odd) => odd < 1 && odd != 0);

    const showContainer =
        !showOdds ||
        // isMotosport(Number(market.tags[0])) ||
        // isGolf(Number(market.tags[0])) ||
        // market.betType == BetType.DOUBLE_CHANCE ||
        areOddsValid;

    return showContainer ? (
        <Container>
            <Title>
                {/* {t(`markets.market-card.bet-type.${BetTypeNameMap[market.betType as BetType]}`)} */}
                {spreadTotalText && ` ${spreadTotalText}`}
            </Title>
            {
                <OddsContainer>
                    {market.odds.map((_, index) => (
                        <OddV2 key={index} market={market} position={index} />
                    ))}
                </OddsContainer>
            }
        </Container>
    ) : (
        <></>
    );
};

export default Odds;

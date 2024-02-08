import { BetTypeNameMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import React from 'react';
import { SportMarketInfoV2 } from 'types/markets';
import { getLineInfoV2 } from 'utils/markets';
import OddV2 from '../OddV2';
import { Container, OddsContainer, Title } from './styled-components';

type OddsProps = {
    market: SportMarketInfoV2;
    isShownInSecondRow?: boolean;
};

const Odds: React.FC<OddsProps> = ({ market }) => {
    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const showOdds = !isGameResolved && !isGameStarted && !market.isPaused;
    const lineInfo = getLineInfoV2(market, 0);

    const areOddsValid = market.odds.every((odd) => odd < 1 && odd != 0);

    const showContainer = !showOdds || market.typeId === BetType.DOUBLE_CHANCE || areOddsValid;

    return showContainer ? (
        <Container>
            <Title>
                {BetTypeNameMap[market.typeId as BetType]}
                {lineInfo && market.typeId !== BetType.COMBINED_POSITIONS && ` ${lineInfo}`}
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

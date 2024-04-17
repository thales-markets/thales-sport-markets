import { BetTypeNameMap } from 'constants/tags';
import { BetType, Position } from 'enums/markets';
import React from 'react';
import { SportMarketInfoV2 } from 'types/markets';
import { getLineInfoV2, isOddValid } from 'utils/marketsV2';
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
    const lineInfo = getLineInfoV2(market, Position.HOME);

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const showContainer = !showOdds || areOddsValid;

    return showContainer ? (
        <Container>
            <Title>
                {BetTypeNameMap[market.typeId as BetType]}
                {lineInfo && market.typeId !== BetType.WINNER_TOTAL && ` ${lineInfo}`}
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

import { BetType } from 'enums/markets';
import { groupBy } from 'lodash';
import React, { useMemo } from 'react';
import { SportMarketInfoV2 } from 'types/markets';
import { isOddValid } from 'utils/marketsV2';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import { Wrapper } from './styled-components';

type SelectedMarketProps = {
    market: SportMarketInfoV2;
};

const SelectedMarket: React.FC<SelectedMarketProps> = ({ market }) => {
    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;

    const groupedChildMarkets = useMemo(
        () => groupBy(market.childMarkets, (childMarket: SportMarketInfoV2) => childMarket.typeId),
        [market.childMarkets]
    );

    // const totalNumberOfMarkets = market.childMarkets.length + 1;

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = isGameOpen && !areOddsValid && !areChildMarketsOddsValid;

    return (
        <Wrapper hideGame={hideGame}>
            <PositionsV2 markets={[market]} betType={BetType.WINNER} isGameOpen={false} />
            {Object.keys(groupedChildMarkets).map((key, index) => {
                const typeId = Number(key);
                const childMarkets = groupedChildMarkets[typeId];
                return <PositionsV2 key={index} markets={childMarkets} betType={typeId} isGameOpen={false} />;
            })}
        </Wrapper>
    );
};

export default SelectedMarket;

import Scroll from 'components/Scroll';
import { MarketType } from 'enums/marketTypes';
import { groupBy } from 'lodash';
import React, { useMemo, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { getMarketTypeFilter } from 'redux/modules/market';
import { SportMarket } from 'types/markets';
import { isOddValid } from 'utils/marketsV2';
import { getIsMobile } from '../../../../redux/modules/app';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import { Wrapper } from './styled-components';

type SelectedMarketProps = {
    market: SportMarket;
};

const SelectedMarket: React.FC<SelectedMarketProps> = ({ market }) => {
    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const isMobile = useSelector(getIsMobile);

    // hack to rerender scroll due to bug in scroll component when scroll should change state (become hidden/visible)
    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
    const refreshScroll = () => {
        if (ignored >= 0) {
            forceUpdate();
        }
    };

    const groupedChildMarkets = useMemo(() => {
        if (!marketTypeFilter.length) {
            return groupBy(market.childMarkets, (childMarket: SportMarket) => childMarket.typeId);
        } else {
            return groupBy(
                market.childMarkets.filter((childMarket) => marketTypeFilter.includes(childMarket.typeId)),
                (childMarket: SportMarket) => childMarket.typeId
            );
        }
    }, [market.childMarkets, marketTypeFilter]);

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = isGameOpen && !areOddsValid && !areChildMarketsOddsValid;

    return (
        <Scroll height={`calc(100vh - ${isMobile ? 0 : 188}px)`}>
            <Wrapper hideGame={hideGame}>
                {(!marketTypeFilter.length || marketTypeFilter.includes(MarketType.WINNER)) && (
                    <PositionsV2
                        markets={[market]}
                        marketType={MarketType.WINNER}
                        isGameOpen={isGameOpen}
                        onAccordionClick={refreshScroll}
                    />
                )}
                {Object.keys(groupedChildMarkets).map((key, index) => {
                    const typeId = Number(key);
                    const childMarkets = groupedChildMarkets[typeId];
                    return (
                        <PositionsV2
                            key={index}
                            markets={childMarkets}
                            marketType={typeId}
                            isGameOpen={isGameOpen}
                            onAccordionClick={refreshScroll}
                        />
                    );
                })}
            </Wrapper>
        </Scroll>
    );
};

export default SelectedMarket;

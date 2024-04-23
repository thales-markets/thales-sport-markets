import { BetType } from 'enums/markets';
import { groupBy } from 'lodash';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SportMarketInfoV2 } from 'types/markets';
import { isOddValid } from 'utils/marketsV2';
import { getBetTypeFilter, setSelectedMarket } from '../../../../redux/modules/market';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import { CloseIcon, Wrapper } from './styled-components';

type SelectedMarketProps = {
    market: SportMarketInfoV2;
};

const SelectedMarket: React.FC<SelectedMarketProps> = ({ market }) => {
    const dispatch = useDispatch();
    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const showOdds = !isPendingResolution && !isGameResolved && !market.isPaused;
    const betTypeFilter = useSelector(getBetTypeFilter);

    const groupedChildMarkets = useMemo(() => {
        if (betTypeFilter === undefined) {
            return groupBy(market.childMarkets, (childMarket: SportMarketInfoV2) => childMarket.typeId);
        } else {
            return groupBy(
                market.childMarkets.filter((childMarket) => childMarket.typeId === betTypeFilter),
                (childMarket: SportMarketInfoV2) => childMarket.typeId
            );
        }
    }, [market.childMarkets, betTypeFilter]);

    // const totalNumberOfMarkets = market.childMarkets.length + 1;

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = showOdds && !areOddsValid && !areChildMarketsOddsValid;

    return (
        <Wrapper hideGame={hideGame || false} isResolved={isGameRegularlyResolved || false}>
            <CloseIcon className="icon icon--close" onClick={() => dispatch(setSelectedMarket(''))} />
            {(betTypeFilter === undefined || betTypeFilter === BetType.WINNER) && (
                <PositionsV2 markets={[market]} betType={BetType.WINNER} isGameOpen={false} />
            )}
            {Object.keys(groupedChildMarkets).map((key, index) => {
                const typeId = Number(key);
                const childMarkets = groupedChildMarkets[typeId];
                return <PositionsV2 key={index} markets={childMarkets} betType={typeId} isGameOpen={false} />;
            })}
        </Wrapper>
    );
};

export default SelectedMarket;

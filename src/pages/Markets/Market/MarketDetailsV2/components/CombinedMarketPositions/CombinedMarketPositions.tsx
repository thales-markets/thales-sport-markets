import useAvailablePerPositionQuery from 'queries/markets/useAvailablePerPositionQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { CombinedMarket } from 'types/markets';
import CombinedPositionDetails from '../CombinedPositionDetails';

type CombinedMarketPositionsProps = {
    combinedMarket: CombinedMarket;
};

const CombinedMarketPositions: React.FC<CombinedMarketPositionsProps> = ({ combinedMarket }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const firstMarket = combinedMarket.markets[0];
    const secondMarket = combinedMarket.markets[1];

    const firstMarketLiquidity = useAvailablePerPositionQuery(firstMarket.address, {
        enabled: isAppReady,
    });

    const secondMarketLiquidity = useAvailablePerPositionQuery(secondMarket.address, {
        enabled: isAppReady,
    });

    const totalOdd = combinedMarket.totalOdd;

    const availablePositions: number = useMemo(() => {
        if (
            firstMarketLiquidity.isSuccess &&
            firstMarketLiquidity.data &&
            secondMarketLiquidity.isSuccess &&
            secondMarketLiquidity.data
        ) {
            const firstPositionAvailable = firstMarketLiquidity.data[combinedMarket.positions[0]]
                ? firstMarketLiquidity.data[combinedMarket.positions[0]].available
                : 0;
            const secondPositionAvailable = secondMarketLiquidity.data[combinedMarket.positions[1]]
                ? secondMarketLiquidity.data[combinedMarket.positions[1]].available
                : 0;

            if (
                firstPositionAvailable &&
                secondPositionAvailable &&
                firstPositionAvailable >= secondPositionAvailable
            ) {
                return firstPositionAvailable;
            } else {
                return secondPositionAvailable ? secondPositionAvailable : 0;
            }
        }
        return 0;
    }, [
        firstMarketLiquidity.isSuccess,
        firstMarketLiquidity.data,
        secondMarketLiquidity.isSuccess,
        secondMarketLiquidity.data,
        combinedMarket,
    ]);

    return (
        <CombinedPositionDetails
            markets={combinedMarket.markets}
            totalOdd={totalOdd}
            availablePerPosition={availablePositions}
            positions={combinedMarket.positions}
        />
    );
};

export default CombinedMarketPositions;

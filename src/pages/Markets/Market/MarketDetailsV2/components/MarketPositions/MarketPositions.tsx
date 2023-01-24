import { Position } from 'constants/options';
import useAvailablePerPositionQuery from 'queries/markets/useAvailablePerPositionQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { AvailablePerPosition, MarketData } from 'types/markets';
import { getVisibilityOfDrawOption } from 'utils/markets';
import PositionDetails from '../PositionDetails';

const defaultAvailablePerPosition: AvailablePerPosition = {
    [Position.HOME]: {
        available: undefined,
        buyBonus: undefined,
    },
    [Position.AWAY]: {
        available: undefined,
        buyBonus: undefined,
    },
    [Position.DRAW]: {
        available: undefined,
        buyBonus: undefined,
    },
};

type MarketPositionsProps = {
    market: MarketData;
};

const MarketPositions: React.FC<MarketPositionsProps> = ({ market }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [lastValidAvailablePerPosition, setLastValidAvailablePerPosition] = useState<AvailablePerPosition>(
        defaultAvailablePerPosition
    );

    const availablePerPositionQuery = useAvailablePerPositionQuery(market.address, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (availablePerPositionQuery.isSuccess && availablePerPositionQuery.data) {
            setLastValidAvailablePerPosition(availablePerPositionQuery.data);
        }
    }, [availablePerPositionQuery.isSuccess, availablePerPositionQuery.data]);

    const availablePerPosition: AvailablePerPosition = useMemo(() => {
        if (availablePerPositionQuery.isSuccess && availablePerPositionQuery.data) {
            return availablePerPositionQuery.data;
        }
        return lastValidAvailablePerPosition;
    }, [availablePerPositionQuery.isSuccess, availablePerPositionQuery.data, lastValidAvailablePerPosition]);

    const showDrawOdds = getVisibilityOfDrawOption(market.tags, market.betType);

    return (
        <>
            <PositionDetails
                market={market}
                odd={market.positions[Position.HOME].odd}
                availablePerPosition={availablePerPosition[Position.HOME]}
                position={Position.HOME}
            />
            {showDrawOdds && (
                <PositionDetails
                    market={market}
                    odd={market.positions[Position.DRAW].odd}
                    availablePerPosition={availablePerPosition[Position.DRAW]}
                    position={Position.DRAW}
                />
            )}
            <PositionDetails
                market={market}
                odd={market.positions[Position.AWAY].odd}
                availablePerPosition={availablePerPosition[Position.AWAY]}
                position={Position.AWAY}
            />
        </>
    );
};

export default MarketPositions;

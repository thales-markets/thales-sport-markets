import useAvailablePerPositionQuery from 'queries/markets/useAvailablePerPositionQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { AvailablePerPosition, SportMarketInfo } from 'types/markets';
import { getVisibilityOfDrawOption } from 'utils/markets';
import PositionDetails from '../PositionDetails';
import { Position } from 'enums/markets';

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
    market: SportMarketInfo;
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
                odd={market.homeOdds}
                availablePerPosition={availablePerPosition[Position.HOME]}
                position={Position.HOME}
            />
            {showDrawOdds && (
                <PositionDetails
                    market={market}
                    odd={market.drawOdds}
                    availablePerPosition={availablePerPosition[Position.DRAW]}
                    position={Position.DRAW}
                />
            )}
            {!market.isOneSideMarket && (
                <PositionDetails
                    market={market}
                    odd={market.awayOdds}
                    availablePerPosition={availablePerPosition[Position.AWAY]}
                    position={Position.AWAY}
                />
            )}
        </>
    );
};

export default MarketPositions;

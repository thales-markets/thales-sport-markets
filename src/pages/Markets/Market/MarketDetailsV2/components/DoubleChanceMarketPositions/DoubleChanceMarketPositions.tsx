import useAvailablePerDoubleChancePositionQuery from 'queries/markets/useAvailablePerDoubleChancePositionQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { AvailablePerDoubleChancePosition, DoubleChanceMarketsInfo, SportMarketInfo } from 'types/markets';
import PositionDetails from '../PositionDetails';
import { DoubleChanceMarketType, Position } from 'enums/markets';

const defaultAvailablePerDoubleChancePosition: AvailablePerDoubleChancePosition = {
    [DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE]: {
        available: undefined,
        buyBonus: undefined,
    },
    [DoubleChanceMarketType.NO_DRAW]: {
        available: undefined,
        buyBonus: undefined,
    },
    [DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE]: {
        available: undefined,
        buyBonus: undefined,
    },
};

type DoubleChanceMarketPositionsProps = {
    markets: SportMarketInfo[];
    showOdds: boolean;
};

const DoubleChanceMarketPositions: React.FC<DoubleChanceMarketPositionsProps> = ({ markets, showOdds }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [
        lastValidAvailablePerDoubleChancePosition,
        setLastValidAvailablePerDoubleChancePosition,
    ] = useState<AvailablePerDoubleChancePosition>(defaultAvailablePerDoubleChancePosition);

    const availablePerPerDoubleChancePositionQuery = useAvailablePerDoubleChancePositionQuery(markets, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (availablePerPerDoubleChancePositionQuery.isSuccess && availablePerPerDoubleChancePositionQuery.data) {
            setLastValidAvailablePerDoubleChancePosition(availablePerPerDoubleChancePositionQuery.data);
        }
    }, [availablePerPerDoubleChancePositionQuery.isSuccess, availablePerPerDoubleChancePositionQuery.data]);

    const availablePerDoubleChancePosition: AvailablePerDoubleChancePosition = useMemo(() => {
        if (availablePerPerDoubleChancePositionQuery.isSuccess && availablePerPerDoubleChancePositionQuery.data) {
            return availablePerPerDoubleChancePositionQuery.data;
        }
        return lastValidAvailablePerDoubleChancePosition;
    }, [
        availablePerPerDoubleChancePositionQuery.isSuccess,
        availablePerPerDoubleChancePositionQuery.data,
        lastValidAvailablePerDoubleChancePosition,
    ]);

    const doubleChanceMarkets = Object.assign(
        {},
        ...markets.map((item) => ({
            [item.doubleChanceMarketType as DoubleChanceMarketType]: item,
        }))
    ) as DoubleChanceMarketsInfo;

    return (
        <>
            {((doubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE].homeOdds < 1 &&
                doubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE].homeOdds != 0) ||
                !showOdds) && (
                <PositionDetails
                    market={doubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE]}
                    odd={doubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE].homeOdds}
                    availablePerPosition={
                        availablePerDoubleChancePosition[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE]
                    }
                    position={Position.HOME}
                />
            )}
            {((doubleChanceMarkets[DoubleChanceMarketType.NO_DRAW].homeOdds < 1 &&
                doubleChanceMarkets[DoubleChanceMarketType.NO_DRAW].homeOdds != 0) ||
                !showOdds) && (
                <PositionDetails
                    market={doubleChanceMarkets[DoubleChanceMarketType.NO_DRAW]}
                    odd={doubleChanceMarkets[DoubleChanceMarketType.NO_DRAW].homeOdds}
                    availablePerPosition={availablePerDoubleChancePosition[DoubleChanceMarketType.NO_DRAW]}
                    position={Position.HOME}
                />
            )}
            {((doubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE].homeOdds < 1 &&
                doubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE].homeOdds != 0) ||
                !showOdds) && (
                <PositionDetails
                    market={doubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE]}
                    odd={doubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE].homeOdds}
                    availablePerPosition={
                        availablePerDoubleChancePosition[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE]
                    }
                    position={Position.HOME}
                />
            )}
        </>
    );
};

export default DoubleChanceMarketPositions;

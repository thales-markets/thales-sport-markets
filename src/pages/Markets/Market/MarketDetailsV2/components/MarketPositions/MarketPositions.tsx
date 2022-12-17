import { Position } from 'constants/options';
import useAvailablePerPositionQuery from 'queries/markets/useAvailablePerPositionQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
// import { useTranslation } from 'react-i18next';
import { MarketData } from 'types/markets';
import { getVisibilityOfDrawOptionByTagId } from 'utils/markets';
import PositionDetails from '../PositionDetails';

type MarketPositionsProps = {
    market: MarketData;
};

const MarketPositions: React.FC<MarketPositionsProps> = ({ market }) => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const availablePerPositionQuery = useAvailablePerPositionQuery(market.address, {
        enabled: isWalletConnected,
    });

    const availablePerPosition =
        availablePerPositionQuery.isSuccess && availablePerPositionQuery.data
            ? availablePerPositionQuery.data
            : {
                  [Position.HOME]: {
                      available: 0,
                      buyImpactPrice: 0,
                  },
                  [Position.AWAY]: {
                      available: 0,
                      buyImpactPrice: 0,
                  },
                  [Position.DRAW]: {
                      available: 0,
                      buyImpactPrice: 0,
                  },
              };

    const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);

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

import React from 'react';
import { SportMarketInfoV2 } from 'types/markets';
import PositionDetailsV2 from '../PositionDetailsV2';

type MarketPositionsProps = {
    market: SportMarketInfoV2;
};

const MarketPositions: React.FC<MarketPositionsProps> = ({ market }) => {
    return (
        <>
            {market.odds.map((_, index) => (
                <PositionDetailsV2 key={index} market={market} position={index} />
            ))}
        </>
    );
};

export default MarketPositions;

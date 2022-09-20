import React from 'react';
import { MarketData } from 'types/markets';
import MatchInfo from './components/MatchInfo';

type MarketDetailsPropType = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    return (
        <>
            <MatchInfo market={market} />
        </>
    );
};

export default MarketDetails;

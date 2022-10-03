import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Toggle from 'components/Toggle/Toggle';
import MatchInfo from './components/MatchInfo';

import { Position, Side } from 'constants/options';
import { MarketData } from 'types/markets';
import Positions from './components/Positions';
import useAvailablePerSideQuery from 'queries/markets/useAvailablePerSideQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected } from 'redux/modules/wallet';
import AMM from './components/AMM';

type MarketDetailsPropType = {
    market: MarketData;
    selectedSide: Side;
    setSelectedSide: (side: Side) => void;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market, selectedSide, setSelectedSide }) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const availablePerSideQuery = useAvailablePerSideQuery(market.address, selectedSide, {
        enabled: isWalletConnected,
    });

    const availablePerSide =
        availablePerSideQuery.isSuccess && availablePerSideQuery.data
            ? availablePerSideQuery.data
            : {
                  positions: {
                      [Position.HOME]: {
                          available: 0,
                      },
                      [Position.AWAY]: {
                          available: 0,
                      },
                      [Position.DRAW]: {
                          available: 0,
                      },
                  },
              };

    console.log('Market ', market);
    return (
        <>
            <Toggle
                label={{
                    firstLabel: t('common.buy-side'),
                    secondLabel: t('common.sell-side'),
                    fontSize: '18px',
                }}
                active={selectedSide === Side.SELL}
                dotSize="18px"
                dotBackground="#303656"
                dotBorder="3px solid #3FD1FF"
                handleClick={() => {
                    setSelectedSide(selectedSide === Side.BUY ? Side.SELL : Side.BUY);
                }}
            />
            <MatchInfo market={market} />
            <Positions
                market={market}
                selectedSide={selectedSide}
                availablePerSide={availablePerSide}
                selectedPosition={selectedPosition}
                setSelectedPosition={setSelectedPosition}
            />
            <AMM
                market={market}
                selectedSide={selectedSide}
                selectedPosition={selectedPosition}
                availablePerSide={availablePerSide}
            />
        </>
    );
};

export default MarketDetails;

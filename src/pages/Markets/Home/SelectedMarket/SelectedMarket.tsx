import useSportMarketV2Query from 'queries/markets/useSportMarketV2Query';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getSelectedMarket } from 'redux/modules/market';
import { getNetworkId } from 'redux/modules/wallet';
import { SportMarketInfoV2 } from 'types/markets';
import SimpleLoader from '../../../../components/SimpleLoader';
import SelectedMarketDetails from '../SelectedMarketDetails';

const SelectedMarket: React.FC = () => {
    const selectedMarket = useSelector(getSelectedMarket);
    const isAppReady = useSelector(getIsAppReady);
    const networkId = useSelector(getNetworkId);
    const [lastValidMarket, setLastValidMarket] = useState<SportMarketInfoV2 | undefined>(undefined);

    const marketQuery = useSportMarketV2Query(selectedMarket, true, networkId, {
        enabled: isAppReady && selectedMarket !== '',
    });

    useEffect(() => {
        if (marketQuery.isSuccess && marketQuery.data) {
            setLastValidMarket(marketQuery.data);
        }
    }, [selectedMarket, marketQuery.isSuccess, marketQuery.data]);

    return lastValidMarket ? <SelectedMarketDetails market={lastValidMarket} /> : <SimpleLoader />;
};

export default SelectedMarket;

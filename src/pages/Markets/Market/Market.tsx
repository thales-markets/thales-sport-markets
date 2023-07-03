import SimpleLoader from 'components/SimpleLoader';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { SportMarketInfo } from 'types/markets';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import MarketDetailsV2 from './MarketDetailsV2';
import { getNetworkId } from 'redux/modules/wallet';
import useSportMarketQuery from 'queries/markets/useSportMarketQuery';

type MarketProps = RouteComponentProps<{
    marketAddress: string;
}>;

const Market: React.FC<MarketProps> = (props) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [lastValidMarket, setLastValidMarket] = useState<SportMarketInfo | undefined>(undefined);
    const { trackPageView } = useMatomo();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const { params } = props.match;
    const marketAddress = params && params.marketAddress ? params.marketAddress : '';

    const singleMarketQuery = useSportMarketQuery(marketAddress, networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (singleMarketQuery.isSuccess && singleMarketQuery.data) {
            setLastValidMarket(singleMarketQuery.data);
        }
    }, [marketAddress, singleMarketQuery.isSuccess, singleMarketQuery.data]);

    useEffect(() => {
        trackPageView({});
    }, [trackPageView]);

    return <Container>{lastValidMarket ? <MarketDetailsV2 market={lastValidMarket} /> : <SimpleLoader />}</Container>;
};

const Container = styled(FlexDivColumn)`
    align-items: center;
    width: 100%;
`;

export default Market;

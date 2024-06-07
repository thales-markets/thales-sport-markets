import SimpleLoader from 'components/SimpleLoader';
import useSportMarketV2Query from 'queries/markets/useSportMarketV2Query';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { SportMarket } from 'types/markets';
import MarketDetailsV2 from './MarketDetailsV2';

type MarketProps = RouteComponentProps<{
    marketAddress: string;
}>;

const Market: React.FC<MarketProps> = (props) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [lastValidMarket, setLastValidMarket] = useState<SportMarket | undefined>(undefined);
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const { params } = props.match;
    const marketAddress = params && params.marketAddress ? params.marketAddress : '';

    const singleMarketQuery = useSportMarketV2Query(marketAddress, false, networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (singleMarketQuery.isSuccess && singleMarketQuery.data) {
            setLastValidMarket(singleMarketQuery.data);
        }
    }, [marketAddress, singleMarketQuery.isSuccess, singleMarketQuery.data]);

    return (
        <Container>
            {lastValidMarket && !singleMarketQuery.isLoading ? (
                <MarketDetailsV2 market={lastValidMarket} />
            ) : (
                <SimpleLoader />
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    align-items: center;
    width: 100%;
`;

export default Market;

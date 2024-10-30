import SimpleLoader from 'components/SimpleLoader';
import useSportMarketV2Query from 'queries/markets/useSportMarketV2Query';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { SportMarket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import MarketDetailsV2 from './MarketDetailsV2';

const Market: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [lastValidMarket, setLastValidMarket] = useState<SportMarket | undefined>(undefined);

    const networkId = useChainId();
    const client = useClient();

    const params = useParams() as { marketAddress: string };
    const marketAddress = params && params.marketAddress ? params.marketAddress : '';

    const singleMarketQuery = useSportMarketV2Query(
        marketAddress,
        false,
        !!lastValidMarket?.live,
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    useEffect(() => {
        if (singleMarketQuery.isSuccess && singleMarketQuery.data) {
            setLastValidMarket(singleMarketQuery.data);
        }
    }, [marketAddress, singleMarketQuery.isSuccess, singleMarketQuery.data]);

    useEffect(() => {
        setLastValidMarket(undefined);
    }, [networkId]);

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

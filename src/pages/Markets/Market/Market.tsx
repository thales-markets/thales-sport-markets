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
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import { Trans } from 'react-i18next';
import { Info } from '../Home/Home';
import { getNetworkId } from 'redux/modules/wallet';
import { NetworkIdByName } from 'utils/network';
import useSportMarketsQueryNew from 'queries/markets/useSportsMarketsQueryNew';
import { GlobalFiltersEnum } from 'constants/markets';

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

    const marketQuery = useSportMarketsQueryNew(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (marketQuery.isSuccess && marketQuery.data) {
            let market: SportMarketInfo | undefined = undefined;
            for (const propertyName in marketQuery.data) {
                const marketsGroup = marketQuery.data[propertyName as GlobalFiltersEnum];
                if (marketsGroup) {
                    market = marketsGroup.find((market) => market.address == marketAddress);
                }
                if (market) break;
            }
            setLastValidMarket(market);
        }
    }, [marketQuery.isSuccess, marketQuery.data, marketAddress]);

    useEffect(() => {
        trackPageView({});
    }, [trackPageView]);

    return (
        <Container>
            {networkId !== NetworkIdByName.ArbitrumOne && (
                <Info>
                    <Trans
                        i18nKey="rewards.op-rewards-banner-message"
                        components={{
                            bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                        }}
                    />
                </Info>
            )}
            {lastValidMarket ? <MarketDetailsV2 market={lastValidMarket} /> : <SimpleLoader />}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    align-items: center;
    width: 100%;
`;

export default Market;

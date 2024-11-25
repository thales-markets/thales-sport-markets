import { LiquidityPoolMap } from 'constants/liquidityPool';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { PnlTab } from 'enums/ui';
import useLiquidityPoolDataQuery from 'queries/liquidityPool/useLiquidityPoolDataQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { LiquidityPoolData } from 'types/liquidityPool';
import useQueryParam from 'utils/useQueryParams';
import { useChainId, useClient } from 'wagmi';
import Stats from './components/Stats';
import { Container } from './styled-components';

const PnL: React.FC = () => {
    const networkId = useChainId();
    const client = useClient();

    const isAppReady = useSelector(getIsAppReady);

    const [selectedTabParam, setSelectedTabParam] = useQueryParam('selected-tab', PnlTab.LP_STATS);
    const [selectedTab, setSelectedTab] = useState<PnlTab>(PnlTab.LP_STATS);
    const [lastValidLiquidityPoolData, setLastValidLiquidityPoolData] = useState<LiquidityPoolData | undefined>(
        undefined
    );

    const liquidityPoolAddress = LiquidityPoolMap[networkId]
        ? LiquidityPoolMap[networkId][LiquidityPoolCollateral.USDC]?.address || ''
        : '';
    const liquidityPoolDataQuery = useLiquidityPoolDataQuery(
        liquidityPoolAddress,
        'USDC',
        { networkId, client },
        {
            enabled: isAppReady && liquidityPoolAddress !== '',
        }
    );

    useEffect(() => {
        if (liquidityPoolDataQuery.isSuccess && liquidityPoolDataQuery.data) {
            setLastValidLiquidityPoolData(liquidityPoolDataQuery.data);
        }
    }, [liquidityPoolDataQuery.isSuccess, liquidityPoolDataQuery.data]);

    const liquidityPoolData: LiquidityPoolData | undefined = useMemo(() => {
        if (liquidityPoolDataQuery.isSuccess && liquidityPoolDataQuery.data) {
            return liquidityPoolDataQuery.data;
        }
        return lastValidLiquidityPoolData;
    }, [liquidityPoolDataQuery.isSuccess, liquidityPoolDataQuery.data, lastValidLiquidityPoolData]);

    useEffect(() => {
        if (Object.values(PnlTab).includes(selectedTabParam.toLowerCase() as PnlTab)) {
            setSelectedTab(selectedTabParam.toLowerCase() as PnlTab);
        } else {
            setSelectedTab(PnlTab.LP_STATS);
        }
    }, [selectedTabParam]);

    const handleTabChange = (tab: PnlTab) => {
        setSelectedTab(tab);
        setSelectedTabParam(tab);
    };

    return (
        <Container>
            {liquidityPoolData && (
                <Stats
                    selectedTab={selectedTab}
                    setSelectedTab={handleTabChange}
                    currentRound={liquidityPoolData.round}
                />
            )}
        </Container>
    );
};

export default PnL;

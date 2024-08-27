import useLiquidityPoolReturnQuery from 'queries/liquidityPool/useLiquidityPoolReturnQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatPercentage } from 'thales-utils';
import { LiquidityPoolReturn } from 'types/liquidityPool';
import {
    ContentInfoContainer,
    LiquidityPoolInfoContainer,
    LiquidityPoolInfoTitle,
    LiquidityPoolReturnInfo,
    LiquidityPoolReturnlabel,
} from '../styled-components';

const Return: React.FC<{ liquidityPoolAddress: string }> = ({ liquidityPoolAddress }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [liquidityPoolReturn, setLiquidityPoolReturn] = useState<LiquidityPoolReturn | undefined>(undefined);

    const liquidityPoolReturnQuery = useLiquidityPoolReturnQuery(networkId, liquidityPoolAddress, {
        enabled: isAppReady,
    });

    useEffect(
        () =>
            setLiquidityPoolReturn(
                liquidityPoolReturnQuery.isSuccess && liquidityPoolReturnQuery.data
                    ? liquidityPoolReturnQuery.data
                    : undefined
            ),
        [liquidityPoolReturnQuery.isSuccess, liquidityPoolReturnQuery.data]
    );

    return liquidityPoolReturn ? (
        <ContentInfoContainer>
            <LiquidityPoolInfoTitle>{t('liquidity-pool.return.title')}</LiquidityPoolInfoTitle>
            <LiquidityPoolInfoContainer>
                <LiquidityPoolReturnlabel>{t('liquidity-pool.return.arr')}:</LiquidityPoolReturnlabel>
                <LiquidityPoolReturnInfo>{formatPercentage(liquidityPoolReturn.arr)}</LiquidityPoolReturnInfo>
            </LiquidityPoolInfoContainer>
            <LiquidityPoolInfoContainer>
                <LiquidityPoolReturnlabel>{t('liquidity-pool.return.apr')}:</LiquidityPoolReturnlabel>
                <LiquidityPoolReturnInfo>{formatPercentage(liquidityPoolReturn.apr)}</LiquidityPoolReturnInfo>
            </LiquidityPoolInfoContainer>
            <LiquidityPoolInfoContainer>
                <LiquidityPoolReturnlabel>{t('liquidity-pool.return.apy')}:</LiquidityPoolReturnlabel>
                <LiquidityPoolReturnInfo>{formatPercentage(liquidityPoolReturn.apy)}</LiquidityPoolReturnInfo>
            </LiquidityPoolInfoContainer>
        </ContentInfoContainer>
    ) : null;
};

export default Return;

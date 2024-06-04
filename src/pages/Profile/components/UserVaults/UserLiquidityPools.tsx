import React from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { getLiquidityPools } from 'utils/liquidityPool';
import { LiquidityPool } from '../../../../types/liquidityPool';
import TransactionsTable from './components/TransactionsTable';
import UserLP from './components/UserLP';

const UserLiquidityPools: React.FC = () => {
    const networkId = useSelector(getNetworkId);
    const liquidityPools = getLiquidityPools(networkId);

    return (
        <>
            <Wrapper>
                {liquidityPools.map((item: LiquidityPool) => (
                    <UserLP key={item.address} lp={item} />
                ))}
            </Wrapper>
            <TransactionsTable />
        </>
    );
};

const Wrapper = styled(FlexDivCentered)`
    margin-top: 5px;
    gap: 12px;
    flex-wrap: wrap;
    max-width: 780px;
`;

export default UserLiquidityPools;

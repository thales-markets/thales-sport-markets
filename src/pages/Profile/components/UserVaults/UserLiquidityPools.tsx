import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { getLiquidityPools } from 'utils/liquidityPool';
import { useChainId } from 'wagmi';
import { LiquidityPool } from '../../../../types/liquidityPool';
import TransactionsTable from './components/TransactionsTable';
import UserLP from './components/UserLP';

const UserLiquidityPools: React.FC = () => {
    const networkId = useChainId();

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

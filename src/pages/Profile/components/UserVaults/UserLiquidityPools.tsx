import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import TransactionsTable from './components/TransactionsTable';
import UserLP from './components/UserLP';

const UserLiquidityPools: React.FC = () => {
    return (
        <>
            <Wrapper>
                <UserLP />
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

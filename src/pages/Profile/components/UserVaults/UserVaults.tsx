import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import UserVaultAndLpTransactionsTable from './components/TransactionsTable';
import UserLP from './components/UserLP';

const UserVaults: React.FC = () => {
    return (
        <>
            <Wrapper>
                <UserLP />
            </Wrapper>
            <UserVaultAndLpTransactionsTable />
        </>
    );
};

const Wrapper = styled(FlexDivCentered)`
    margin-top: 5px;
    gap: 12px;
    flex-wrap: wrap;
    max-width: 780px;
`;

export default UserVaults;

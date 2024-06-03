import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { Coins } from 'thales-utils';
import { LiquidityPoolMap } from '../../../../constants/liquidityPool';
import { getNetworkId } from '../../../../redux/modules/wallet';
import TransactionsTable from './components/TransactionsTable';
import UserLP from './components/UserLP';

const UserLiquidityPools: React.FC = () => {
    const networkId = useSelector(getNetworkId);
    return (
        <>
            <Wrapper>
                {Object.values(LiquidityPoolMap[networkId]).map((item: any, index: number) => (
                    <UserLP
                        key={item}
                        address={item.address}
                        collateral={Object.keys(LiquidityPoolMap[networkId])[index].toUpperCase() as Coins}
                    />
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

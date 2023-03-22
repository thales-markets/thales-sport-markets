import { VAULT_MAP } from 'constants/vault';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import UserVaultAndLpTransactionsTable from './components/TransactionsTable/UserVaultAndLpTransactionsTable';
import UserLP from './components/UserLP';
import UserVault from './components/UserVault';

const UserVaults: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const vaults = useMemo(() => {
        const arr = [];
        for (const key in VAULT_MAP) {
            arr.push({ key, vaultAddress: VAULT_MAP[key].addresses[networkId] });
        }
        return arr;
    }, [networkId]);

    return (
        <>
            <Wrapper>
                {vaults.map((obj, index) => {
                    if (obj.vaultAddress)
                        return <UserVault key={index} vaultName={obj.key} vaultAddress={obj.vaultAddress} />;
                })}
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

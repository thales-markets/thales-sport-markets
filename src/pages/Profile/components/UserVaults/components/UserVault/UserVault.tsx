import useUserVaultDataQuery from 'queries/vault/useUserVaultDataQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';

const UserVault: React.FC<{ vaultName: string; vaultAddress: string }> = ({ vaultName, vaultAddress }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const userVaultDataQuery = useUserVaultDataQuery(vaultAddress, walletAddress, networkId, {
        enabled: isWalletConnected && !!vaultAddress,
    });

    console.log(userVaultDataQuery.data);

    const vaultAllocation = userVaultDataQuery.isSuccess ? userVaultDataQuery.data?.balanceTotal : 0;

    return (
        <VaultCard>
            <TitleWrapper>
                <Icon className={`icon icon--${vaultName}`} />
                <Title>{vaultName}</Title>
            </TitleWrapper>
            <ContentWrapper>
                <TextWrapper>
                    <PreLabel></PreLabel>
                    <Value>{vaultAllocation}</Value>
                    <PostLabel></PostLabel>
                </TextWrapper>
                <Button></Button>
            </ContentWrapper>
        </VaultCard>
    );
};

const VaultCard = styled.div`
    width: 100%;
    max-width: 220px;
    height: 200px;
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border-radius: 5px;
`;

const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
    border-bottom: 2px solid #5f6180;
    height: 50px;
`;

const Title = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 16px;
    line-height: 19px;

    color: #ffffff;
`;

const Icon = styled.i`
    padding-right: 4px;
`;

const ContentWrapper = styled.div``;

const TextWrapper = styled.div``;

const PreLabel = styled.span``;
const Value = styled.span``;
const PostLabel = styled.span``;
const Button = styled.button``;

export default UserVault;

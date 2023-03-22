import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import useLiquidityPoolUserDataQuery from 'queries/liquidityPool/useLiquidityPoolUserDataQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';

const UserLP: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [lastValidData, setLastValidData] = useState<number>(0);

    const userLpQuery = useLiquidityPoolUserDataQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    useEffect(() => {
        if (userLpQuery.isSuccess && userLpQuery.data) {
            setLastValidData(userLpQuery.data?.balanceTotal);
        }
    }, [userLpQuery.isSuccess, userLpQuery.data]);

    return (
        <SPAAnchor href={ROUTES.LiquidityPool}>
            <VaultCard>
                <TitleWrapper>
                    <Icon className={`icon icon--liquidity-pool`} />
                    <Title> {t(`profile.lp-title`)}</Title>
                </TitleWrapper>
                <ContentWrapper>
                    <TextWrapper>
                        <PreLabel>{t('profile.in-lp')}</PreLabel>
                        <Value>{lastValidData?.toFixed(2)}</Value>
                        <PostLabel>USD</PostLabel>
                    </TextWrapper>
                    <Button>{t('profile.go-to-lp')}</Button>
                </ContentWrapper>
            </VaultCard>
        </SPAAnchor>
    );
};

const VaultCard = styled.div`
    width: 100%;
    max-width: 220px;
    min-width: 220px;
    height: 200px;
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        transform: scale(1.02);
    }
    @media (max-width: 476px) {
        width: 100%;
        max-width: 100%;
        min-width: 300px;
    }
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

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100%;
    max-height: 150px;
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const PreLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
`;
const Value = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 23px;
    text-align: center;
    color: #3fd1ff;
`;
const PostLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 23px;
    text-align: center;
`;
const Button = styled.button`
    width: 136px;
    background: #3fd1ff;
    border-radius: 3.64362px;
    text-transform: uppercase;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 19px;
    text-align: center;
    letter-spacing: 0.025em;
    cursor: pointer;
    border: none;
`;

export default UserLP;

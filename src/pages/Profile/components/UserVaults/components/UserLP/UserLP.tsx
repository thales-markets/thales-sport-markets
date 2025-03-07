import Button from 'components/Button';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import useLiquidityPoolUserDataQuery from 'queries/liquidityPool/useLiquidityPoolUserDataQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { formatCurrency } from 'thales-utils';
import { LiquidityPool } from 'types/liquidityPool';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { buildHref } from 'utils/routes';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

type UserLPProps = {
    lp: LiquidityPool;
};

const UserLP: React.FC<UserLPProps> = ({ lp }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [lastValidData, setLastValidData] = useState<number>(0);
    const lpCollateral = lp.collateral.toLowerCase() as LiquidityPoolCollateral;

    const networkId = useChainId();
    const client = useClient();
    const { isConnected, address } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const userLpQuery = useLiquidityPoolUserDataQuery(
        lp.address,
        lp.collateral,
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    useEffect(() => {
        if (userLpQuery.isSuccess && userLpQuery.data) {
            setLastValidData(userLpQuery.data?.balanceTotal);
        }
    }, [userLpQuery.isSuccess, userLpQuery.data]);

    return (
        <>
            <SPAAnchor href={`${buildHref(ROUTES.LiquidityPool)}?collateral=${lpCollateral}`}>
                <LiquidityPoolCard>
                    <TitleWrapper>
                        <Icon className={`icon icon--liquidity-pool`} />
                        <Title>{lp.name}</Title>
                    </TitleWrapper>
                    <ContentWrapper>
                        <TextWrapper>
                            <PreLabel>{t('profile.in-lp')}</PreLabel>
                            <Value>{formatCurrency(lastValidData)}</Value>
                            <PostLabel>{lp.collateral}</PostLabel>
                        </TextWrapper>
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            width="136px"
                            fontSize="14px"
                            padding="1px 2px"
                            height="20px"
                        >
                            {`${t('profile.go-to')} ${lp.name}`}
                        </Button>
                    </ContentWrapper>
                </LiquidityPoolCard>
            </SPAAnchor>
        </>
    );
};

const LiquidityPoolCard = styled.div`
    width: 100%;
    max-width: 220px;
    min-width: 220px;
    height: 200px;
    background: ${(props) => props.theme.background.secondary};
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
    border-bottom: 2px solid ${(props) => props.theme.borderColor.primary};
    height: 50px;
`;

const Title = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 19px;
    color: ${(props) => props.theme.textColor.primary};
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
    font-weight: 400;
    font-size: 12px;
    margin-bottom: 5px;
`;
const Value = styled.span`
    font-weight: 600;
    font-size: 20px;
    text-align: center;
    margin-bottom: 5px;
    color: ${(props) => props.theme.textColor.quaternary};
`;
const PostLabel = styled.span`
    font-weight: 600;
    font-size: 14px;
    text-align: center;
`;

export default UserLP;

import Button from 'components/Button';
import SPAAnchor from 'components/SPAAnchor';
import i18n from 'i18n';
import useParlayLiquidityPoolUserDataQuery from 'queries/liquidityPool/useParlayLiquidityPoolUserDataQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { buildLpLink } from 'utils/routes';

const UserLP: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [lastValidData, setLastValidData] = useState<number>(0);
    const [parlayLPData, setParlayLPData] = useState<number>(0);
    const language = i18n.language;

    const userLpQuery = useParlayLiquidityPoolUserDataQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });
    const parlayLpQuery = useParlayLiquidityPoolUserDataQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    useEffect(() => {
        if (userLpQuery.isSuccess && userLpQuery.data) {
            setLastValidData(userLpQuery.data?.balanceTotal);
        }
    }, [userLpQuery.isSuccess, userLpQuery.data]);

    useEffect(() => {
        if (parlayLpQuery.isSuccess && parlayLpQuery.data) {
            setParlayLPData(parlayLpQuery.data?.balanceTotal);
        }
    }, [parlayLpQuery.isSuccess, parlayLpQuery.data]);

    return (
        <>
            <SPAAnchor href={buildLpLink(language, 'single')}>
                <LiquidityPoolCard>
                    <TitleWrapper>
                        <Icon className={`icon icon--liquidity-pool`} />
                        <Title> {t(`profile.single-lp-title`)}</Title>
                    </TitleWrapper>
                    <ContentWrapper>
                        <TextWrapper>
                            <PreLabel>{t('profile.in-lp')}</PreLabel>
                            <Value>{lastValidData?.toFixed(2)}</Value>
                            <PostLabel>USD</PostLabel>
                        </TextWrapper>
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            width="136px"
                            fontSize="14px"
                            padding="1px 2px"
                            height="20px"
                        >
                            {t('profile.go-to-single-lp')}
                        </Button>
                    </ContentWrapper>
                </LiquidityPoolCard>
            </SPAAnchor>
            <SPAAnchor href={buildLpLink(language, 'parlay')}>
                <LiquidityPoolCard>
                    <TitleWrapper>
                        <Icon className={`icon icon--liquidity-pool`} />
                        <Title> {t(`profile.parlay-lp-title`)}</Title>
                    </TitleWrapper>
                    <ContentWrapper>
                        <TextWrapper>
                            <PreLabel>{t('profile.in-lp')}</PreLabel>
                            <Value>{parlayLPData?.toFixed(2)}</Value>
                            <PostLabel>USD</PostLabel>
                        </TextWrapper>
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            width="136px"
                            fontSize="14px"
                            padding="1px 2px"
                            height="20px"
                        >
                            {t('profile.go-to-parlay-lp')}
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
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
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
    color: ${(props) => props.theme.textColor.quaternary};
`;
const PostLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 23px;
    text-align: center;
`;

export default UserLP;

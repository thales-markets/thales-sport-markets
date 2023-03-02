import styled from 'styled-components';
import React, { CSSProperties, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexDivColumn } from 'styles/common';
import Button from 'components/Button';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { MarchMadTabs } from '../Tabs/Tabs';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { initialBracketsData } from 'constants/marchMadness';
import localStore from 'utils/localStore';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import { getIsAppReady } from 'redux/modules/app';
import Loader from 'components/Loader';
import { history } from 'utils/routes';
import queryString from 'query-string';

type HomeProps = {
    setSelectedTab?: (tab: MarchMadTabs) => void;
};

const Home: React.FC<HomeProps> = ({ setSelectedTab }) => {
    const { t } = useTranslation();

    const { openConnectModal } = useConnectModal();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const lsBrackets = localStore.get(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress);
    const [isButtonDisabled, setIsButtonDisabled] = useState(lsBrackets !== undefined);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
        refetchInterval: 60 * 1000,
    });
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    const isBracketsLocked = useMemo(() => (marchMadnessData ? !marchMadnessData.isMintAvailable : false), [
        marchMadnessData,
    ]);

    const buttonClickHandler = () => {
        if (isWalletConnected) {
            localStore.set(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress, initialBracketsData);
            setIsButtonDisabled(true);
            history.push({
                pathname: location.pathname,
                search: queryString.stringify({
                    tab: MarchMadTabs.BRACKETS,
                }),
            });
            setSelectedTab && setSelectedTab(MarchMadTabs.BRACKETS);
        } else {
            openConnectModal?.();
        }
    };

    const daysLeftForMint = useMemo(() => (marchMadnessData ? marchMadnessData.daysLeftToMint : 0), [marchMadnessData]);

    return (
        <Container>
            {marchMadnessDataQuery.isSuccess ? (
                <>
                    <RowTitle>{t('march-madness.home.title')}</RowTitle>
                    <RowTimeInfo>{t('march-madness.home.time-info', { days: daysLeftForMint })}</RowTimeInfo>
                    <TextWrapper marginTop={7} padding="17px 23px">
                        <Text>{t('march-madness.home.text-1')}</Text>
                    </TextWrapper>
                    <TextWrapper marginTop={10} padding="20px 23px">
                        <Text>{t('march-madness.home.text-2')}</Text>
                        <TextList>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-2a')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-2b')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-2c')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-2d')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-2e')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-2f')}</Text>
                            </TextBullet>
                        </TextList>
                        <Text>{t('march-madness.home.text-2g')}</Text>
                    </TextWrapper>
                    {(!isWalletConnected || !isBracketsLocked) && (
                        <Button style={customButtonStyle} disabled={isButtonDisabled} onClick={buttonClickHandler}>
                            {isWalletConnected
                                ? t('march-madness.home.button-create')
                                : t('march-madness.home.button-connect')}
                        </Button>
                    )}
                </>
            ) : (
                <Loader />
            )}
        </Container>
    );
};

const customButtonStyle: CSSProperties = {
    width: '653px',
    height: '64px',
    marginTop: '16px',
    marginBottom: '200px',
    background: '#ffffff',
    border: '3px solid #0E94CB',
    fontSize: '30px',
    fontFamily: "'NCAA' !important",
    textTransform: 'uppercase',
    color: '#021631',
};

const Container = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const RowTitle = styled.div`
    display: flex;
    flex-direction: row;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 60px;
    line-height: 69px;
    color: #ffffff;
    margin-top: 20px;
`;

const RowTimeInfo = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 90%;
    min-height: 77px;
    background: linear-gradient(270deg, #da252f -1.63%, #5c2c3b 18.12%, #021630 36.93%, #0c99d0 65.71%, #02223e 96.12%);
    margin-top: 32px;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 35px;
    line-height: 40px;
    text-align: center;
    letter-spacing: 10px;
    text-transform: uppercase;
    color: #ffffff;
    padding: 10px 20px;
`;

const TextWrapper = styled(FlexDivColumn)<{ marginTop: number; padding: string }>`
    width: 90%;
    background: #0e94cb;
    border: 2px solid #0e94cb;
    margin-top: ${(props) => props.marginTop}px;
    padding: ${(props) => props.padding};
`;

const Text = styled.p`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 30px;
    color: #ffffff;
`;

const TextList = styled.ul`
    list-style-type: disc;
`;
const TextBullet = styled.li`
    color: #ffffff;
    margin-left: 30px;
`;

export default Home;

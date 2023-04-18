import styled from 'styled-components';
import React, { CSSProperties, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
import { LINKS } from 'constants/links';
import { NetworkIdByName } from 'utils/network';
import { useLocation } from 'react-router-dom';

type HomeProps = {
    setSelectedTab?: (tab: MarchMadTabs) => void;
};

const Home: React.FC<HomeProps> = ({ setSelectedTab }) => {
    const { t } = useTranslation();

    const { openConnectModal } = useConnectModal();
    const location = useLocation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const lsBrackets = localStore.get(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress);
    const [isButtonDisabled, setIsButtonDisabled] = useState(lsBrackets !== undefined);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
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

    const timeLeftToMint = useMemo(() => {
        return {
            days: Math.floor((marchMadnessData?.hoursLeftToMint || 0) / 24),
            hours:
                (marchMadnessData?.hoursLeftToMint || 0) -
                Math.floor((marchMadnessData?.hoursLeftToMint || 0) / 24) * 24,
        };
    }, [marchMadnessData?.hoursLeftToMint]);

    const reward = networkId === NetworkIdByName.ArbitrumOne ? '40,000 THALES' : '13,000 OP';
    const firstPoolReward = networkId === NetworkIdByName.ArbitrumOne ? '30,000 THALES' : '10,000 OP';
    const secondPoolReward = networkId === NetworkIdByName.ArbitrumOne ? '10,000 THALES' : '3,000 OP';
    const volume = networkId === NetworkIdByName.ArbitrumOne ? '10 USDC' : '10 sUSD';

    return (
        <Container>
            {marchMadnessDataQuery.isLoading ? (
                <Loader />
            ) : (
                <>
                    <RowTitle>{t('march-madness.home.title')}</RowTitle>
                    {!isBracketsLocked && (
                        <RowTimeInfo>
                            {t('march-madness.home.time-info', {
                                days:
                                    timeLeftToMint.days +
                                    ' ' +
                                    (timeLeftToMint.days === 1
                                        ? t('common.time-remaining.day')
                                        : t('common.time-remaining.days')),
                                hours:
                                    timeLeftToMint.hours +
                                    ' ' +
                                    (timeLeftToMint.hours === 1
                                        ? t('common.time-remaining.hour')
                                        : t('common.time-remaining.hours')),
                            })}
                        </RowTimeInfo>
                    )}
                    <TextWrapper marginTop={10} padding="14px 23px">
                        <Text>
                            <Trans
                                i18nKey="march-madness.home.text-1"
                                components={{
                                    bold: <BoldText />,
                                    reward,
                                }}
                            />
                        </Text>
                    </TextWrapper>
                    <TextWrapper marginTop={10} padding="20px 23px">
                        <Text>
                            <Trans
                                i18nKey="march-madness.home.text-2"
                                components={{
                                    bold: <BoldText />,
                                    reward,
                                }}
                            />
                        </Text>
                        <br />
                        <Text>
                            <Trans
                                i18nKey="march-madness.home.text-3"
                                components={{
                                    bold: <BoldText />,
                                    reward: firstPoolReward,
                                }}
                            />
                        </Text>
                        <TextList>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-3a')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-3b')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-3c')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-3d')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-3e')}</Text>
                            </TextBullet>
                            <TextBullet>
                                <Text>{t('march-madness.home.text-3f')}</Text>
                            </TextBullet>
                        </TextList>
                        <br />
                        <Text>
                            <Trans
                                i18nKey="march-madness.home.text-4"
                                components={{
                                    bold: <BoldText />,
                                    reward: secondPoolReward,
                                    volume,
                                }}
                            />
                        </Text>
                        <br />
                        <Text>
                            <Trans
                                i18nKey="march-madness.home.text-5"
                                components={{
                                    mediumLink: (
                                        <Link target="_blank" rel="noreferrer" href={LINKS.MarchMadness.Medium} />
                                    ),
                                }}
                            />
                        </Text>
                    </TextWrapper>
                    {(!isWalletConnected || !isBracketsLocked) && (
                        <Button style={customButtonStyle} disabled={isButtonDisabled} onClick={buttonClickHandler}>
                            {isWalletConnected
                                ? t('march-madness.home.button-create')
                                : t('march-madness.home.button-connect')}
                        </Button>
                    )}
                </>
            )}
        </Container>
    );
};

const customButtonStyle: CSSProperties = {
    width: '653px',
    height: '64px',
    marginTop: '16px',
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
    margin-bottom: 200px;
`;

const RowTitle = styled.div`
    display: flex;
    flex-direction: row;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 50px;
    line-height: 58px;
    color: #ffffff;
    margin-top: 10px;
`;

const RowTimeInfo = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 90%;
    min-height: 70px;
    background: linear-gradient(270deg, #da252f -1.63%, #5c2c3b 18.12%, #021630 36.93%, #0c99d0 65.71%, #02223e 96.12%);
    margin-top: 16px;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 30px;
    line-height: 35px;
    text-align: center;
    letter-spacing: 8px;
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

const Text = styled.span`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
`;

const BoldText = styled(Text)`
    font-weight: 700;
    text-transform: uppercase;
`;

const Link = styled.a`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    text-decoration: underline;
    color: #ffffff;
    :hover {
        color: #021631;
    }
`;

const TextList = styled.ul`
    list-style-type: disc;
`;
const TextBullet = styled.li`
    color: #ffffff;
    margin-left: 30px;
`;

export default Home;

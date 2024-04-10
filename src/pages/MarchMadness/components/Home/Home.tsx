import Button from 'components/Button';
import Loader from 'components/Loader';
import { START_MINTING_DATE } from 'constants/marchMadness';
import { SUPPORTED_NETWORKS_PARAMS } from 'constants/network';
import ROUTES from 'constants/routes';
import { hoursToSeconds, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { Network } from 'enums/network';
import useInterval from 'hooks/useInterval';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
    switchToNetworkId,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { changeNetwork } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getIsMintingStarted, isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import { history, navigateTo } from 'utils/routes';
import { useSwitchNetwork } from 'wagmi';
import { MarchMadTabs } from '../Tabs/Tabs';

type HomeProps = {
    setSelectedTab?: (tab: MarchMadTabs) => void;
};

const COMP_RULES = [
    'march-madness.home.comp-rules-0',
    'march-madness.home.comp-rules-0-a',
    'march-madness.home.comp-rules-1',
    'march-madness.home.comp-rules-2',
    'march-madness.home.comp-rules-3',
    'march-madness.home.comp-rules-4',
    'march-madness.home.comp-rules-5',
    'march-madness.home.comp-rules-6',
    'march-madness.home.comp-rules-7',
    'march-madness.home.comp-rules-8',
    'march-madness.home.comp-rules-9',
];

const VOLUME__INCETIVES_RULES = [
    'march-madness.home.volume-incetives-1',
    'march-madness.home.volume-incetives-2',
    'march-madness.home.volume-incetives-3',
    'march-madness.home.volume-incetives-4',
];

const BRACKETS_INCETIVES_RULES = [
    'march-madness.home.brackets-points-rules-1',
    'march-madness.home.brackets-points-rules-2',
    'march-madness.home.brackets-points-rules-3',
    'march-madness.home.brackets-points-rules-4',
    'march-madness.home.brackets-points-rules-5',
    'march-madness.home.brackets-points-rules-6',
    'march-madness.home.brackets-points-rules-7',
];

const Home: React.FC<HomeProps> = ({ setSelectedTab }) => {
    const { t } = useTranslation();

    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();
    const { switchNetwork } = useSwitchNetwork();

    const location = useLocation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [showCompRules, setShowCompRules] = useState(false);
    const [showVolumeIncentives, setShowVolumeIncentives] = useState(false);
    const [showPointsSystem, setShowPointsSystem] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: '--',
        hours: '--',
        minutes: '--',
        seconds: '--',
    });

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
    });
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    const isBracketsLocked = useMemo(() => (marchMadnessData ? !marchMadnessData.isMintAvailable : false), [
        marchMadnessData,
    ]);

    const isMintingStarted = getIsMintingStarted();

    const buttonTitle = () => {
        if (isWalletConnected) {
            if (isMarchMadnessAvailableForNetworkId(networkId)) {
                return t('march-madness.home.button-create');
            } else {
                return t('march-madness.home.button-switch');
            }
        } else {
            return t('march-madness.home.button-connect');
        }
    };

    const buttonClickHandler = async () => {
        if (isWalletConnected) {
            if (networkId !== Network.Arbitrum) {
                SUPPORTED_NETWORKS_PARAMS;
                await changeNetwork(SUPPORTED_NETWORKS_PARAMS[Network.Arbitrum], () => {
                    switchNetwork?.(Network.Arbitrum);
                    // Trigger App.js init
                    // do not use updateNetworkSettings(networkId) as it will trigger queries before provider in App.js is initialized
                    dispatch(
                        switchToNetworkId({
                            networkId: Network.Arbitrum,
                        })
                    );
                });
            } else {
                if (isMintingStarted) {
                    history.push({
                        pathname: location.pathname,
                        search: queryString.stringify({
                            tab: MarchMadTabs.BRACKETS,
                        }),
                    });
                    setSelectedTab && setSelectedTab(MarchMadTabs.BRACKETS);
                }
            }
        } else {
            dispatch(
                setWalletConnectModalVisibility({
                    visibility: true,
                })
            );
        }
    };

    const switchToLeaderboard = () => {
        if (isMintingStarted) {
            history.push({
                pathname: location.pathname,
                search: queryString.stringify({
                    tab: MarchMadTabs.LEADERBOARD,
                }),
            });
            setSelectedTab && setSelectedTab(MarchMadTabs.LEADERBOARD);
        }
    };

    // setting default time for cooldown to not show zeroes
    useEffect(() => {
        if (START_MINTING_DATE > Date.now()) {
            const secondsLeftToMint = millisecondsToSeconds(START_MINTING_DATE - Date.now());
            const daysToMint = Math.floor((secondsLeftToMint || 0) / hoursToSeconds(24));
            const hoursToMint = Math.floor(((secondsLeftToMint || 0) - daysToMint * 24 * 60 * 60) / 3600);
            const minutesToMint = Math.floor(
                ((secondsLeftToMint || 0) - daysToMint * 24 * 60 * 60 - hoursToMint * 60 * 60) / 60
            );
            const secondsToMint =
                (secondsLeftToMint || 0) - daysToMint * 24 * 60 * 60 - hoursToMint * 60 * 60 - minutesToMint * 60;
            setTimeLeft({
                days: daysToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
                hours: hoursToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
                minutes: minutesToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
                seconds: secondsToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
            });
        }
    }, []);

    useInterval(() => {
        let secondsLeftToMint = 0;
        if (START_MINTING_DATE > Date.now()) {
            secondsLeftToMint = millisecondsToSeconds(START_MINTING_DATE - Date.now());
        } else if (marchMadnessData) {
            secondsLeftToMint = millisecondsToSeconds(
                secondsToMilliseconds(marchMadnessData.mintEndingDate) - Date.now()
            );
        }
        const daysToMint = Math.floor((secondsLeftToMint || 0) / hoursToSeconds(24));
        const hoursToMint = Math.floor(((secondsLeftToMint || 0) - daysToMint * 24 * 60 * 60) / 3600);
        const minutesToMint = Math.floor(
            ((secondsLeftToMint || 0) - daysToMint * 24 * 60 * 60 - hoursToMint * 60 * 60) / 60
        );
        const secondsToMint =
            (secondsLeftToMint || 0) - daysToMint * 24 * 60 * 60 - hoursToMint * 60 * 60 - minutesToMint * 60;
        setTimeLeft({
            days: daysToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
            hours: hoursToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
            minutes: minutesToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
            seconds: secondsToMint.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
        });
    }, 1000);

    return (
        <Container>
            {marchMadnessDataQuery.isLoading ? (
                <Loader />
            ) : (
                <>
                    <PageTitle>{t('march-madness.home.title')}</PageTitle>
                    {!isBracketsLocked && (
                        <>
                            <TimeLeft>
                                {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                            </TimeLeft>

                            <TimeLeftDescription>
                                {t(
                                    isMintingStarted ? 'march-madness.home.time-info' : 'march-madness.home.time-info-a'
                                )}
                            </TimeLeftDescription>
                        </>
                    )}

                    <Text>{t('march-madness.home.description')}</Text>

                    <DropdownWrapper>
                        <LabelArrowWrapper
                            onClick={() => {
                                setShowCompRules(!showCompRules);
                            }}
                        >
                            <DropdownLabel>{t('march-madness.home.bracket-comp-rules-label')}</DropdownLabel>
                            <i className={`icon icon--arrow-${showCompRules ? 'up' : 'down'}`} />
                        </LabelArrowWrapper>
                        {showCompRules && (
                            <ListWrapper>
                                {COMP_RULES.map((text: string, index: number) => (
                                    <ListItem key={index}>
                                        <Trans
                                            i18nKey={text}
                                            components={{
                                                b: <BoldContent />,
                                                a: <Link onClick={buttonClickHandler} />,
                                                c: <Link onClick={switchToLeaderboard} />,
                                                d: (
                                                    <LinkAvailable
                                                        onClick={() =>
                                                            window.open(
                                                                'https://medium.com/@OvertimeMarkets.xyz/37663de78d28'
                                                            )
                                                        }
                                                    />
                                                ),
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </ListWrapper>
                        )}
                    </DropdownWrapper>

                    <DropdownWrapper>
                        <LabelArrowWrapper
                            onClick={() => {
                                setShowPointsSystem(!showPointsSystem);
                            }}
                        >
                            <DropdownLabel>{t('march-madness.home.brackets-points-system-label')}</DropdownLabel>
                            <i className={`icon icon--arrow-${showPointsSystem ? 'up' : 'down'}`} />
                        </LabelArrowWrapper>
                        {showPointsSystem && (
                            <>
                                <Text style={{ margin: '12px 0', display: 'block' }}>
                                    {t('march-madness.home.brackets-points-explanation')}
                                </Text>
                                <ListWrapper>
                                    {BRACKETS_INCETIVES_RULES.map((text: string, index: number) => (
                                        <ListItem key={index}>
                                            <Trans
                                                i18nKey={text}
                                                components={{
                                                    b: <BoldContent />,
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </ListWrapper>
                            </>
                        )}
                    </DropdownWrapper>

                    <DropdownWrapper>
                        <LabelArrowWrapper
                            onClick={() => {
                                setShowVolumeIncentives(!showVolumeIncentives);
                            }}
                        >
                            <DropdownLabel>{t('march-madness.home.volume-incetives-label')}</DropdownLabel>
                            <i className={`icon icon--arrow-${showVolumeIncentives ? 'up' : 'down'}`} />
                        </LabelArrowWrapper>
                        {showVolumeIncentives && (
                            <ListWrapper>
                                {VOLUME__INCETIVES_RULES.map((text: string, index: number) => (
                                    <ListItem key={index}>
                                        <Trans
                                            i18nKey={text}
                                            components={{
                                                b: <BoldContent />,
                                                a: <Link onClick={switchToLeaderboard} />,
                                                p: <LinkAvailable onClick={() => navigateTo(ROUTES.Promotions.Home)} />,
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </ListWrapper>
                        )}
                    </DropdownWrapper>

                    {(!isWalletConnected || !isBracketsLocked || !isMarchMadnessAvailableForNetworkId(networkId)) && (
                        <Button
                            additionalStyles={{
                                width: '100%',
                                height: '64px',
                                marginTop: '16px',
                                background: theme.marchMadness.button.background.senary,
                                border: `none`,
                                fontSize: '30px',
                                fontFamily: theme.fontFamily.primary,
                                textTransform: 'uppercase',
                                color: theme.marchMadness.button.textColor.primary,
                            }}
                            disabled={isWalletConnected && !isMintingStarted}
                            onClick={buttonClickHandler}
                        >
                            {buttonTitle()}
                        </Button>
                    )}
                </>
            )}
        </Container>
    );
};

const Container = styled.div`
    margin: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 200px;
    max-width: 494px;
`;

const PageTitle = styled.h1`
    color: #f25623;
    white-space: nowrap;
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 50px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
    @media (max-width: 500px) {
        font-size: 34px;
    }
`;

const TimeLeft = styled.h2`
    color: #fff;
    text-align: center;
    white-space: nowrap;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 53px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 6.8px;
    max-width: 494px;
    margin: 6px 0;
    white-space: nowrap;
    @media (max-width: 500px) {
        font-size: 31px;
    }
`;

const TimeLeftDescription = styled.h3`
    color: #f25623;
    text-align: center;
    white-space: nowrap;
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 30px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 4.8px;
    text-transform: uppercase;
    white-space: nowrap;
    @media (max-width: 500px) {
        font-size: 25px;
        letter-spacing: 1px;
    }
`;

const Text = styled.span`
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    text-align: justify;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;
    margin-top: 30px;
    margin-bottom: 50px;
    letter-spacing: 1.4px;
    white-space: break-spaces;
`;

const DropdownWrapper = styled.div`
    width: 100%;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 2px solid ${(props) => props.theme.marchMadness.borderColor.senary};
`;

const LabelArrowWrapper = styled(FlexDivSpaceBetween)`
    cursor: pointer;
    i {
        font-size: 30px;
    }
`;

const DropdownLabel = styled.h3`
    color: #fff;
    font-family: Roboto;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 157%; /* 34.54px */
    letter-spacing: 2px;
`;

const ListWrapper = styled.ul`
    list-style-type: disc;
    padding-left: 16px;
`;

const ListItem = styled.li`
    color: #fff;
    font-family: Roboto;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 157%; /* 34.54px */
    letter-spacing: 1.2px;
    margin-top: 8px;
`;

const BoldContent = styled.span`
    font-weight: bold;
`;

const Link = styled.span`
    /* text-decoration: underline;
    cursor: pointer; */
`;

const LinkAvailable = styled.span`
    text-decoration: underline;
    cursor: pointer;
`;

export default Home;

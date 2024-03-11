import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Loader from 'components/Loader';
import { DEFAULT_BRACKET_ID, initialBracketsData } from 'constants/marchMadness';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import queryString from 'query-string';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { localStore } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getLocalStorageKey } from 'utils/marchMadness';
import { history } from 'utils/routes';
import { MarchMadTabs } from '../Tabs/Tabs';
import { hoursToMinutes } from 'date-fns';
import { FlexDivSpaceBetween } from 'styles/common';

type HomeProps = {
    setSelectedTab?: (tab: MarchMadTabs) => void;
};

const COMP_RULES = [
    'march-madness.home.comp-rules-0',
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

    const { openConnectModal } = useConnectModal();
    const location = useLocation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const lsBrackets = localStore.get(getLocalStorageKey(DEFAULT_BRACKET_ID, networkId, walletAddress));
    const [isButtonDisabled, setIsButtonDisabled] = useState(lsBrackets !== undefined);

    const [showCompRules, setShowCompRules] = useState(false);
    const [showVolumeIncentives, setShowVolumeIncentives] = useState(false);
    const [showPointsSystem, setShowPointsSystem] = useState(false);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
    });
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    const isBracketsLocked = useMemo(() => (marchMadnessData ? !marchMadnessData.isMintAvailable : false), [
        marchMadnessData,
    ]);

    const buttonClickHandler = () => {
        console.log('jes please');
        if (isWalletConnected) {
            localStore.set(getLocalStorageKey(DEFAULT_BRACKET_ID, networkId, walletAddress), initialBracketsData);
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

    const switchToLeaderboard = () => {
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({
                tab: MarchMadTabs.LEADERBOARD,
            }),
        });
        setSelectedTab && setSelectedTab(MarchMadTabs.LEADERBOARD);
    };

    const timeLeftToMint = useMemo(() => {
        const daysToMint = Math.floor((marchMadnessData?.minutesLeftToMint || 0) / hoursToMinutes(24));
        const hoursToMint = Math.floor(((marchMadnessData?.minutesLeftToMint || 0) - daysToMint * 24 * 60) / 60);
        const minutesToMint = (marchMadnessData?.minutesLeftToMint || 0) - daysToMint * 24 * 60 - hoursToMint * 60;
        return {
            days: daysToMint,
            hours: hoursToMint,
            minutes: minutesToMint,
        };
    }, [marchMadnessData?.minutesLeftToMint]);

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
                                {`${timeLeftToMint.days}d ${timeLeftToMint.hours}h ${timeLeftToMint.minutes}m`}
                            </TimeLeft>
                            <TimeLeftDescription>{t('march-madness.home.time-info')}</TimeLeftDescription>
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
                                                    <Link
                                                        onClick={() =>
                                                            window.open(
                                                                'https://medium.com/@OvertimeMarkets.xyz/weekly-match-preview-460e8ad462ac'
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
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </ListWrapper>
                        )}
                    </DropdownWrapper>

                    {(!isWalletConnected || !isBracketsLocked) && (
                        <Button
                            additionalStyles={{
                                width: '100%',
                                height: '64px',
                                marginTop: '16px',
                                background: theme.marchMadness.button.background.senary,
                                border: `none`,
                                fontSize: '30px',
                                fontFamily: "'NCAA' !important",
                                textTransform: 'uppercase',
                                color: theme.marchMadness.button.textColor.primary,
                            }}
                            disabled={isButtonDisabled}
                            onClick={buttonClickHandler}
                        >
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
    font-family: Legacy !important;
    font-size: 50px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
`;

const TimeLeft = styled.h2`
    color: #fff;
    text-align: center;
    font-family: Legacy !important;
    font-size: 97px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 11.8px;
    text-transform: uppercase;
    max-width: 494px;
    margin: 6px auto;
    white-space: nowrap;
`;

const TimeLeftDescription = styled.h3`
    color: #f25623;

    text-align: center;
    font-family: Legacy !important;
    font-size: 30px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 4.8px;
    text-transform: uppercase;
`;

const Text = styled.span`
    color: #fff;
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
    text-decoration: underline;
    cursor: pointer;
`;

export default Home;

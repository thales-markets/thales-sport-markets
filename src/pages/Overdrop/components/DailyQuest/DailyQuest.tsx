import axios from 'axios';
import Button from 'components/Button';
import TextInput from 'components/fields/TextInput';
import WheelOfFortune from 'components/WheelOfFortune';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ROUTES from 'constants/routes';
import { getDayOfYear } from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { refetchUserOverdrop } from 'utils/queryConnector';
import { navigateTo } from 'utils/routes';
import { useAccount } from 'wagmi';

const DAILY_QUESTS = [
    {
        icon: 'icon icon--logo',
        title: 'Place Overtime Bet',
        description: 'Make any bet on Overtime platform',
        buttonText: 'Start',
        onClick: () => navigateTo(ROUTES.Markets.Home),
        completed: false,
    },
    {
        icon: 'sidebar-icon sidebar-icon--speed-markets',
        title: 'Speed Market Trade',
        description: 'Complete 1 speed market position',
        buttonText: 'Start',
        onClick: () => console.log('Speed Market Bet Started'),
        completed: false,
    },
    {
        icon: 'icon icon--social',
        title: 'Share on Social',
        description: 'Post with your affiliate link',
        buttonText: 'Send',
        onClick: () => console.log('Social link Bet Started'),
        completed: false,
        social: true,
    },
];

const DailyQuest: React.FC = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [showSpinTheWheel, setShowSpinTheWheel] = useState(false);
    const { address, isConnected } = useAccount();
    const [tweetUrl, setTweetUrl] = useState('');
    const isMobile = useSelector(getIsMobile);

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });
    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const postTweet = useCallback(async () => {
        if (address) {
            const toastTwitter = toast.loading(t('markets.parlay.share-ticket.verifying-tweet'));
            try {
                const response = await axios.post(`${generalConfig.OVERDROP_API_URL}/user-twitter`, {
                    address,
                    tweetUrl,
                });

                if (response.data.success) {
                    toast.update(toastTwitter, getSuccessToastOptions(response.data.status));
                    refetchUserOverdrop(address);
                } else {
                    toast.update(toastTwitter, getErrorToastOptions(response.data.error));
                }
            } catch (e) {
                console.log(e);
                toast.update(toastTwitter, getErrorToastOptions(t('markets.parlay.share-ticket.network-error')));
            }
        }
    }, [address, tweetUrl, t]);

    const isSpinTheWheelCompleted = useMemo(() => {
        if (userData) {
            const today = getDayOfYear(new Date());
            if (userData.lastTradeOvertime) {
                const lastTradeDay = getDayOfYear(new Date(userData.lastTradeOvertime));
                if (today === lastTradeDay) {
                    DAILY_QUESTS[0].completed = true;
                } else {
                    DAILY_QUESTS[0].completed = false;
                }
            } else {
                DAILY_QUESTS[0].completed = false;
            }
            if (userData.lastTradeSpeed) {
                const lastSpeedTradeDay = getDayOfYear(new Date(userData.lastTradeSpeed));
                if (today === lastSpeedTradeDay) {
                    DAILY_QUESTS[1].completed = true;
                } else {
                    DAILY_QUESTS[1].completed = false;
                }
            } else {
                DAILY_QUESTS[1].completed = false;
            }
            if (userData.lastTwitterActivity) {
                const lastTwitterDay = getDayOfYear(new Date(userData.lastTwitterActivity));
                if (today === lastTwitterDay) {
                    DAILY_QUESTS[2].completed = true;
                } else {
                    DAILY_QUESTS[2].completed = false;
                }
            } else {
                DAILY_QUESTS[2].completed = false;
            }

            if (userData.wheel && userData.wheel.lastSpinTime) {
                return getDayOfYear(new Date(userData.wheel.lastSpinTime)) === today;
            }
        }
        return false;
    }, [userData]);

    const isSocialUrlValid = tweetUrl.startsWith('https://x.com/') || tweetUrl.startsWith('https://twitter.com/');

    return (
        <Container>
            {DAILY_QUESTS.map((quest, index) => (
                <DailyQuestItem social={quest.social} completed={quest.completed} key={index}>
                    <FlexDivCentered>
                        <Icon className={quest.icon} />
                        <HeaderWrapper>
                            <Title>{quest.title}</Title>
                            <Description>{quest.description}</Description>
                        </HeaderWrapper>
                    </FlexDivCentered>

                    {quest.completed ? (
                        <FlexDivCentered gap={4}>
                            <FinishedText>Finished</FinishedText>
                            <FinishedIcon />
                        </FlexDivCentered>
                    ) : (
                        <ActionWrapper full={quest.social} gap={10}>
                            {quest.social && (
                                <TextInput
                                    width={isMobile ? '100%' : '350px'}
                                    height="30px"
                                    disabled={quest.completed}
                                    borderColor="transparent"
                                    placeholder="Place your tweet or cast url here"
                                    value={tweetUrl}
                                    inputFontSize={'12px'}
                                    onChange={(e: any) => setTweetUrl(e.target.value)}
                                    margin={'0px'}
                                />
                            )}
                            <Button
                                borderRadius="8px"
                                textColor={theme.textColor.quaternary}
                                borderColor={theme.borderColor.quaternary}
                                disabled={quest.social ? !isSocialUrlValid : false}
                                backgroundColor="transparent"
                                width="62px"
                                height="30px"
                                fontSize="12px"
                                lineHeight="12px"
                                additionalStyles={{ textTransform: 'capitalize' }}
                                onClick={quest.social ? postTweet : quest.onClick}
                            >
                                {quest.buttonText}
                            </Button>
                        </ActionWrapper>
                    )}
                </DailyQuestItem>
            ))}
            <DailyQuestItem completed={isSpinTheWheelCompleted}>
                <FlexDivCentered>
                    <Icon className={'icon icon--wheel'} />
                    <HeaderWrapper>
                        <Title>Daily Spin the Wheel</Title>
                        <BadgeWrapper>
                            <Badge1>XP BOOST</Badge1> <Badge2>OVERDROP XP</Badge2>
                        </BadgeWrapper>
                    </HeaderWrapper>
                </FlexDivCentered>
                {isSpinTheWheelCompleted ? (
                    <FlexDivCentered gap={4}>
                        <FinishedText>{`${userData?.wheel?.reward?.amount} ${userData?.wheel?.reward?.type}`}</FinishedText>
                        <FinishedIcon />
                    </FlexDivCentered>
                ) : (
                    <>
                        <SpinTheWheelText>Complete daily quests to unlock bonus rewards</SpinTheWheelText>
                        <Button
                            borderRadius="8px"
                            textColor={theme.textColor.quaternary}
                            borderColor={theme.borderColor.quaternary}
                            backgroundColor="transparent"
                            width="62px"
                            height="30px"
                            fontSize="12px"
                            lineHeight="12px"
                            additionalStyles={{ textTransform: 'capitalize' }}
                            onClick={() => setShowSpinTheWheel(!showSpinTheWheel)}
                        >
                            Spin
                        </Button>
                    </>
                )}
            </DailyQuestItem>
            {showSpinTheWheel && <WheelOfFortune />}
        </Container>
    );
};

export default DailyQuest;

const Container = styled.div`
    border-radius: 8px;
    background: ${(props) => props.theme.background.quinary};
    padding: 20px 24px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        padding: 10px 12px;
    }
    margin-bottom: 20px;
`;

const DailyQuestItem = styled(FlexDivSpaceBetween)<{ completed?: boolean; social?: boolean }>`
    height: 76px;
    border-radius: 8px;
    padding: 18px 22px;
    width: 100%;
    background: ${(props) => props.theme.overdrop.background.octonary};
    border: ${(props) =>
        props.completed ? ' 2px solid #8AF6A8' : `2px solid ${props.theme.overdrop.background.octonary}`};
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        ${(props) =>
            props.social &&
            `
        flex-direction: column;
        align-items: flex-start;
        height: auto;
        width: 100%;
        gap: 10px;

       `}
    }
`;

const Icon = styled.i`
    font-size: ${(props) => (props.className?.includes('logo') ? '30px' : '28px')};
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 10px;
`;

const HeaderWrapper = styled(FlexDivColumnCentered)`
    gap: 2px;
`;

const Title = styled.h3`
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Description = styled.p`
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px; /* 133.333% */
    color: ${(props) => props.theme.textColor.secondary};
`;

const SpinTheWheelText = styled.p`
    color: #3c498a;
    color: ${(props) => props.theme.textColor.septenary};
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
`;

const Badge1 = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    height: 20px;
    font-size: 10px;
    white-space: pre;
    font-weight: 400;
    line-height: 10px;

    padding: 4px 11px;

    border-radius: 8494.157px;
    border: 0.85px solid rgba(63, 255, 255, 0.3);
    background: rgba(63, 255, 255, 0.1);
    color: ${(props) => props.theme.textColor.quaternary};
`;

const Badge2 = styled(Badge1)`
    border-radius: 8494.157px;
    border: 0.85px solid rgba(219, 161, 17, 0.3);
    background: rgba(219, 161, 17, 0.1);
    color: ${(props) => props.theme.overdrop.textColor.octonary};
`;

const BadgeWrapper = styled(FlexDivCentered)`
    gap: 4px;
`;

const FinishedText = styled.p`
    color: #8af6a8;
    font-size: 12px;
    font-weight: 600;
    line-height: normal;
`;

const FinishedIcon = styled.i.attrs({ className: 'icon icon--resolvedmarkets' })`
    color: #8af6a8;
`;

const ActionWrapper = styled(FlexDivCentered)<{ full?: boolean }>`
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: ${(props) => (props.full ? '100%' : '')};
    }
`;

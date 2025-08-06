import Button from 'components/Button';
import WheelOfFortune from 'components/WheelOfFortune';
import ROUTES from 'constants/routes';
import { getDayOfYear } from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getSpeedMarketsWidgetOpen, setSpeedMarketsWidgetOpen } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { navigateTo } from 'utils/routes';
import { useAccount } from 'wagmi';
import SocialShareModal from '../SocialShareModal';

const DAILY_QUESTS = [
    {
        icon: 'icon icon--logo',
        title: 'overdrop.daily-quest.ot.title',
        description: 'overdrop.daily-quest.ot.desc',
        buttonText: 'Start',
        completed: false,
    },
    {
        icon: 'sidebar-icon sidebar-icon--speed-markets',
        title: 'overdrop.daily-quest.speed.title',
        description: 'overdrop.daily-quest.speed.desc',
        buttonText: 'Start',
        completed: false,
        speed: true,
    },
    {
        icon: 'icon icon--social',
        title: 'overdrop.daily-quest.social.title',
        description: 'overdrop.daily-quest.social.desc',
        buttonText: 'Start',
        completed: false,
        social: true,
    },
];

const DailyQuest: React.FC = () => {
    const theme = useTheme();
    const { t } = useTranslation();

    const [showSpinTheWheel, setShowSpinTheWheel] = useState(false);
    const [showSocialModal, setShowSocialModal] = useState(false);
    const isSpeedMarketOpen = useSelector(getSpeedMarketsWidgetOpen);

    const { address, isConnected } = useAccount();
    const dispatch = useDispatch();

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });
    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    useMemo(() => {
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
        }
    }, [userData]);

    const isSpinTheWheelCompleted = useMemo(() => {
        if (userData) {
            const today = getDayOfYear(new Date());

            if (userData.wheel && userData.wheel.lastSpinTime) {
                return getDayOfYear(new Date(userData.wheel.lastSpinTime)) === today;
            }
        }
        return false;
    }, [userData]);

    const spintTheWheelRewardText = useMemo(() => {
        if (userData && isSpinTheWheelCompleted) {
            if (userData.wheel?.reward?.xpAmount) {
                return `${userData.wheel?.reward?.boostAmount}% XP Boost + ${userData.wheel?.reward?.xpAmount}XP`;
            } else {
                return `${userData.wheel?.reward?.boostAmount}% XP Boost`;
            }
        }
        return false;
    }, [isSpinTheWheelCompleted, userData]);

    return (
        <Container>
            <FlexDivSpaceBetween>
                <HeaderTitle>{t('overdrop.daily-quest.title')}</HeaderTitle>
                <Reward>{t('overdrop.daily-quest.reward')}</Reward>
            </FlexDivSpaceBetween>
            <Explainer>{t('overdrop.daily-quest.explainer')}</Explainer>

            {DAILY_QUESTS.map((quest, index) => (
                <DailyQuestItem social={quest.social} completed={quest.completed} key={index}>
                    <FlexDivCentered>
                        <Icon className={quest.icon} />
                        <HeaderWrapper>
                            <Title>{t(quest.title)}</Title>
                            <Description>{t(quest.description)}</Description>
                        </HeaderWrapper>
                    </FlexDivCentered>

                    {!isConnected ? (
                        <></>
                    ) : quest.completed ? (
                        <FinishedContainer gap={4}>
                            <FinishedText>Finished</FinishedText>
                            <FinishedIcon />
                        </FinishedContainer>
                    ) : (
                        <FlexDivCentered gap={10}>
                            <Button
                                borderRadius="8px"
                                textColor={theme.textColor.quaternary}
                                borderColor={theme.borderColor.quaternary}
                                backgroundColor="transparent"
                                disabled={quest.speed && isSpeedMarketOpen}
                                width="62px"
                                height="30px"
                                fontSize="12px"
                                lineHeight="12px"
                                additionalStyles={{ textTransform: 'capitalize' }}
                                onClick={
                                    quest.social
                                        ? () => setShowSocialModal(true)
                                        : quest.speed
                                        ? () => dispatch(setSpeedMarketsWidgetOpen(true))
                                        : () => navigateTo(ROUTES.Markets.Home)
                                }
                            >
                                {quest.buttonText}
                            </Button>
                        </FlexDivCentered>
                    )}
                </DailyQuestItem>
            ))}

            <SpinTheWheelText>{t('overdrop.daily-quest.complete-daily-quest')}</SpinTheWheelText>

            <WheelItem completed={isSpinTheWheelCompleted}>
                <FlexDivCentered>
                    <Icon className={'icon icon--wheel'} />
                    <HeaderWrapper>
                        <Title>{t('overdrop.daily-quest.daily-spin')}</Title>
                        <BadgeWrapper>
                            <Badge1>{t('overdrop.daily-quest.badge.boost')}</Badge1>{' '}
                            <Badge2>{t('overdrop.daily-quest.badge.xp')}</Badge2>
                        </BadgeWrapper>
                    </HeaderWrapper>
                </FlexDivCentered>

                {!isConnected ? (
                    <></>
                ) : isSpinTheWheelCompleted ? (
                    <FinishedContainer gap={4}>
                        <FinishedText>{spintTheWheelRewardText}</FinishedText>
                        <FinishedIcon />
                    </FinishedContainer>
                ) : (
                    <>
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
                            {t('overdrop.daily-quest.spin')}
                        </Button>
                    </>
                )}
            </WheelItem>
            {showSpinTheWheel && <WheelOfFortune onClose={() => setShowSpinTheWheel(false)} />}
            {showSocialModal && <SocialShareModal onClose={() => setShowSocialModal(false)} />}
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

const HeaderTitle = styled.h3`
    font-size: 18px;
    font-weight: 500;
    line-height: 28px;
    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        font-size: 16px;
    }
`;

const Explainer = styled(FlexDiv)`
    font-size: 14px;
    line-height: 18px;
`;

const Reward = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 18px;
    font-weight: 700;
    line-height: 28px;
    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        font-size: 16px;
    }
`;

const DailyQuestItem = styled(FlexDivSpaceBetween)<{ completed?: boolean; social?: boolean }>`
    position: relative;
    height: 76px;
    border-radius: 8px;
    padding: 18px 22px;
    width: 100%;
    background: ${(props) => props.theme.overdrop.background.octonary};
    border: ${(props) =>
        props.completed ? ' 2px solid #8AF6A8' : `2px solid ${props.theme.overdrop.background.octonary}`};

    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        padding: 18px 12px;
    }
`;

const WheelItem = styled(DailyQuestItem)`
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        height: 84px;
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

    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        font-size: 12px;
    }
`;

const Description = styled.p`
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    white-space: pre;
`;

const SpinTheWheelText = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 12px;
    font-weight: 400;
    line-height: normal;
    margin-bottom: -10px;
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
    justify-content: start;
`;

const FinishedContainer = styled(FlexDivCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        position: absolute;
        right: 2px;
        bottom: 2px;
    }
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

import badge from 'assets/images/overdrop/badge.png';
import dailyQuest from 'assets/images/overdrop/dailyQuest.png';
import Button from 'components/Button';
import OutsideClickHandler from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import WheelOfFortune from 'components/WheelOfFortune';
import ROUTES from 'constants/routes';
import { getDayOfYear } from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import SocialShareModal from 'pages/Overdrop/components/SocialShareModal';
import useUserDailyQuestInfo from 'queries/overdrop/useUserDailyQuestInfo';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getSpeedMarketsWidgetOpen, setSpeedMarketsWidgetOpen } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumnStart,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { buildHref, navigateTo } from 'utils/routes';
import { useAccount } from 'wagmi';

const OverdropHeader: React.FC = () => {
    const { address, isConnected } = useAccount();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const theme = useTheme();
    const isSpeedMarketOpen = useSelector(getSpeedMarketsWidgetOpen);
    const dispatch = useDispatch();
    const [showSpinTheWheel, setShowSpinTheWheel] = useState(false);
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [isRefetching, setIsRefetching] = useState(true);
    const { t } = useTranslation();
    const location = useLocation();

    const userDataQuery = useUserDailyQuestInfo(address as string, {
        enabled: isConnected,
        refetchInterval: isRefetching ? 5000 : false,
    });
    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const isOTTradeCompleted = useMemo(() => {
        if (userData) {
            const today = getDayOfYear(new Date());
            if (userData.lastTradeOvertime) {
                const lastTradeDay = getDayOfYear(new Date(userData.lastTradeOvertime));
                return today === lastTradeDay;
            } else {
                return false;
            }
        }
    }, [userData]);

    const isSpeedTradeCompleted = useMemo(() => {
        if (userData) {
            const today = getDayOfYear(new Date());
            if (userData.lastTradeSpeed) {
                const lastTradeDay = getDayOfYear(new Date(userData.lastTradeSpeed));
                return today === lastTradeDay;
            } else {
                return false;
            }
        }
    }, [userData]);

    const isSocialQuestDone = useMemo(() => {
        if (userData) {
            const today = getDayOfYear(new Date());
            if (userData.lastTwitterActivity) {
                const lastSocialActivity = getDayOfYear(new Date(userData.lastTwitterActivity));
                return today === lastSocialActivity;
            } else {
                return false;
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

    const completedQuest = useMemo(() => {
        let result = 0;
        if (isOTTradeCompleted) result++;
        if (isSpeedTradeCompleted) result++;
        if (isSocialQuestDone) result++;
        return result;
    }, [isOTTradeCompleted, isSpeedTradeCompleted, isSocialQuestDone]);

    const spintTheWheelRewardText = useMemo(() => {
        if (userData && isSpinTheWheelCompleted) {
            if (userData.wheel?.reward?.xpAmount) {
                return `${userData.wheel?.reward?.boostAmount}% XP Boost \n+ ${userData.wheel?.reward?.xpAmount} XP`;
            } else {
                return `${userData.wheel?.reward?.boostAmount}% XP Boost`;
            }
        }
        return false;
    }, [isSpinTheWheelCompleted, userData]);

    useEffect(() => {
        setIsRefetching(!isOTTradeCompleted || !isSpeedTradeCompleted);
    }, [isOTTradeCompleted, isSpeedTradeCompleted]);

    return (
        <Wrapper>
            <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Overdrop)}>
                <FirstSection>
                    <img src={badge} />
                    <Title>Overdrop League</Title>
                </FirstSection>
            </SPAAnchor>
            <FlexDivRowCentered gap={8}>
                <img src={dailyQuest} />
                <QuestTitle>Daily Quest</QuestTitle>
                <FlexDivCentered gap={4}>
                    <QuestDot className="icon icon--resolvedmarkets" completed={isOTTradeCompleted} />
                    <QuestDot className="icon icon--resolvedmarkets" completed={isSpeedTradeCompleted} />
                    <QuestDot className="icon icon--resolvedmarkets" completed={isSocialQuestDone} />
                </FlexDivCentered>
                <Arrow
                    className="icon icon--arrow-down"
                    onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                    }}
                />
            </FlexDivRowCentered>

            {isDropdownOpen && (
                <OutsideClickHandler
                    onOutsideClick={(e) => {
                        if ((e as any).target.className.includes('icon icon--arrow-down')) {
                            return;
                        }
                        setIsDropdownOpen(false);
                    }}
                >
                    <DropdownWrapper>
                        <DropdownHeader>
                            <FlexDivStart gap={8}>
                                <DropdownTitle>Daily Quest</DropdownTitle>
                                <FlexDivCentered gap={4}>
                                    <QuestDot className="icon icon--resolvedmarkets" completed={isOTTradeCompleted} />
                                    <QuestDot
                                        className="icon icon--resolvedmarkets"
                                        completed={isSpeedTradeCompleted}
                                    />
                                    <QuestDot className="icon icon--resolvedmarkets" completed={isSocialQuestDone} />
                                </FlexDivCentered>
                            </FlexDivStart>
                            <BadgeLabel>WIN 10% BOOST + 200 XP</BadgeLabel>
                        </DropdownHeader>
                        <ItemWrapper completed={isOTTradeCompleted}>
                            <ItemFirstSection gap={4}>
                                <Icon className="icon icon--logo" />
                                <FlexDivColumnStart>
                                    <ItemTitle>{t('overdrop.daily-quest.ot.title')}</ItemTitle>
                                    <ItemDescription>{t('overdrop.daily-quest.ot.desc')}</ItemDescription>
                                </FlexDivColumnStart>
                            </ItemFirstSection>
                            {isOTTradeCompleted ? (
                                <CheckmarkIcon className="icon icon--resolvedmarkets" />
                            ) : (
                                <Button
                                    padding="6px 12px"
                                    textColor={theme.textColor.primary}
                                    backgroundColor={theme.borderColor.senary}
                                    borderRadius="8px"
                                    width="54px"
                                    disabled={location.pathname === ROUTES.Markets.Home}
                                    borderColor={theme.borderColor.senary}
                                    fontSize="12px"
                                    additionalStyles={{ textTransform: 'capitalize' }}
                                    fontWeight="600"
                                    onClick={() => navigateTo(ROUTES.Markets.Home)}
                                >
                                    Start
                                </Button>
                            )}
                        </ItemWrapper>
                        <ItemWrapper completed={isSpeedTradeCompleted}>
                            <ItemFirstSection gap={4}>
                                <Icon className="sidebar-icon sidebar-icon--speed-markets" />
                                <FlexDivColumnStart>
                                    <ItemTitle>{t('overdrop.daily-quest.speed.title')}</ItemTitle>
                                    <ItemDescription>{t('overdrop.daily-quest.speed.desc')}</ItemDescription>
                                </FlexDivColumnStart>
                            </ItemFirstSection>
                            {isSpeedTradeCompleted ? (
                                <CheckmarkIcon className="icon icon--resolvedmarkets" />
                            ) : (
                                <Button
                                    padding="6px 12px"
                                    textColor={theme.textColor.primary}
                                    backgroundColor={theme.borderColor.senary}
                                    borderRadius="8px"
                                    disabled={isSpeedMarketOpen}
                                    borderColor={'transparent'}
                                    width="54px"
                                    fontSize="12px"
                                    additionalStyles={{ textTransform: 'capitalize' }}
                                    fontWeight="600"
                                    onClick={() => dispatch(setSpeedMarketsWidgetOpen(true))}
                                >
                                    Start
                                </Button>
                            )}
                        </ItemWrapper>
                        <ItemWrapper completed={isSocialQuestDone}>
                            <ItemFirstSection gap={4}>
                                <Icon className="icon icon--social" />
                                <FlexDivColumnStart>
                                    <ItemTitle>{t('overdrop.daily-quest.social.title')}</ItemTitle>
                                    <ItemDescription>{t('overdrop.daily-quest.social.desc')}</ItemDescription>
                                </FlexDivColumnStart>
                            </ItemFirstSection>
                            {isSocialQuestDone ? (
                                <CheckmarkIcon className="icon icon--resolvedmarkets" />
                            ) : (
                                <Button
                                    padding="6px 12px"
                                    textColor={theme.textColor.primary}
                                    backgroundColor={theme.borderColor.senary}
                                    borderRadius="8px"
                                    borderColor={'transparent'}
                                    width="54px"
                                    fontSize="12px"
                                    additionalStyles={{ textTransform: 'capitalize' }}
                                    fontWeight="600"
                                    onClick={() => setShowSocialModal(true)}
                                >
                                    Start
                                </Button>
                            )}
                        </ItemWrapper>
                        <ProgressBar>
                            <Completed width={(completedQuest * 100) / 3} />
                        </ProgressBar>
                        <SpinTheWheelInfo completed={completedQuest === 3}>
                            {completedQuest === 3
                                ? t('overdrop.daily-quest.daily-quest-completed')
                                : t('overdrop.daily-quest.complete-daily-quest')}
                        </SpinTheWheelInfo>
                        <ItemWrapper completed={isSpinTheWheelCompleted}>
                            <ItemFirstSection gap={4}>
                                <Icon className="icon icon--wheel" />
                                <FlexDivColumnStart>
                                    <ItemTitle>{t('overdrop.daily-quest.daily-spin')}</ItemTitle>
                                    <ItemDescription>{t('overdrop.daily-quest.bonus-spin')}</ItemDescription>
                                </FlexDivColumnStart>
                            </ItemFirstSection>
                            {isSpinTheWheelCompleted ? (
                                <WheelReward>{spintTheWheelRewardText}</WheelReward>
                            ) : (
                                <Button
                                    padding="6px 12px"
                                    textColor={theme.textColor.tertiary}
                                    backgroundColor={theme.overdrop.background.gradient}
                                    borderRadius="8px"
                                    width="54px"
                                    borderColor={'transparent'}
                                    fontSize="12px"
                                    additionalStyles={{ textTransform: 'capitalize' }}
                                    fontWeight="600"
                                    onClick={() => setShowSpinTheWheel(true)}
                                >
                                    Spin
                                </Button>
                            )}
                        </ItemWrapper>
                    </DropdownWrapper>
                </OutsideClickHandler>
            )}
            {showSpinTheWheel && <WheelOfFortune onClose={() => setShowSpinTheWheel(false)} />}
            {showSocialModal && <SocialShareModal onClose={() => setShowSocialModal(false)} />}
        </Wrapper>
    );
};

export default OverdropHeader;

const Wrapper = styled(FlexDivStart)`
    align-items: center;
    border-radius: 16px;
    background: ${(props) => props.theme.overdrop.background.octonary};
    padding: 8px 12px;
    height: 32px;
    gap: 8px;
    position: relative;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin-bottom: 10px;
        margin-left: 10px;
    }
`;

const FirstSection = styled(FlexDivStart)`
    align-items: center;
    margin-left: -20px;
    gap: 4px;
    cursor: pointer;
`;

const Title = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};

    font-size: 10px;

    font-weight: 500;
    line-height: 16px;
    letter-spacing: 0.5px;
`;

const QuestTitle = styled.p`
    color: ${(props) => props.theme.overdrop.textColor.primary};

    font-size: 10px;

    font-weight: 500;
    line-height: 16px;
`;

const Arrow = styled.i`
    font-size: 14px;
    cursor: pointer;
`;

const DropdownWrapper = styled.div`
    width: 120%;
    background: ${(props) => props.theme.background.primary};

    position: absolute;
    top: 40px;
    left: -10%;
    z-index: 1000;
    border-radius: 12px;
    border: 1px solid ${(props) => props.theme.overdrop.background.octonary};
`;

const DropdownHeader = styled(FlexDivSpaceBetween)`
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    height: 56px;
    width: 100%;
    background: ${(props) => props.theme.overdrop.background.octonary};
    padding: 0 14px;
`;

const DropdownTitle = styled(QuestTitle)`
    font-size: 14px;
`;

const BadgeLabel = styled.div`
    border-radius: 20px;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.theme.overdrop.background.gradient};
    color: ${(props) => props.theme.background.primary};
    font-size: 10px;

    font-weight: 800;
    line-height: 16px;
`;

const ItemWrapper = styled(FlexDivSpaceBetween)<{ completed?: boolean }>`
    border-radius: 12px;
    background: ${(props) => props.theme.overdrop.background.octonary};
    margin: 12px;
    padding: 16px 10px;
    border: ${(props) => (props.completed ? `1px solid ${props.theme.textColor.quaternary}` : 'none')};
`;

const ItemTitle = styled.p`
    font-size: 12px;
    font-weight: 500;
    line-height: normal;
    white-space: pre;
`;

const ItemDescription = styled.p`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 10px;
    white-space: pre;
    font-weight: 400;
    line-height: normal;
`;

const ItemFirstSection = styled(FlexDivStart)`
    align-items: center;
`;

const Icon = styled.i`
    font-size: 24px;
`;

const ProgressBar = styled.div`
    margin: 12px;
    height: 4px;
    background: ${(props) => props.theme.background.tertiary};
    border-radius: 9999px;
`;
const Completed = styled.div<{ width: number }>`
    width: ${(props) => props.width}%;
    height: 4px;
    background: ${(props) => props.theme.overdrop.borderColor.progressBar};
    border-radius: 9999px;
`;

const CheckmarkIcon = styled.i`
    color: ${(props) => props.theme.textColor.quaternary};
    margin-right: 16px;
`;

const WheelReward = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 12px;
    max-width: 85px;
`;

const SpinTheWheelInfo = styled.p<{ completed?: boolean }>`
    color: ${(props) => (props.completed ? props.theme.textColor.quaternary : props.theme.background.tertiary)};
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    margin: 0 10px;
    margin-top: -4px;
    margin-left: 12px;
`;

const QuestDot = styled.i<{ completed?: boolean }>`
    color: ${(props) => (props.completed ? props.theme.textColor.quaternary : props.theme.background.tertiary)};
    font-size: 10px;
`;

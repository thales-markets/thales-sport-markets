import Progress from 'components/Progress';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSwipeable } from 'react-swipeable';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { OverdropUserData } from 'types/overdrop';
import { formatPoints, getCurrentLevelByPoints, getNextOverRewardLevel, getProgressLevel } from 'utils/overdrop';
import { useAccount } from 'wagmi';
import SmallBadge from '../SmallBadge';

const HIDE_FREE_BET_LEVEL = true;

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();

    const isMobile = useSelector(getIsMobile);

    const { address, isConnected } = useAccount();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [numberOfCards, setNumberOfCards] = useState<number>(isMobile ? 3 : 6);

    useEffect(() => {
        isMobile ? setNumberOfCards(4) : setNumberOfCards(6);
    }, [isMobile]);

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });

    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const levelItem = userData ? getCurrentLevelByPoints(userData.points) : OVERDROP_LEVELS[0];
    const nextOverRewardLevel = getNextOverRewardLevel(userData?.points);

    useEffect(() => {
        if (levelItem) {
            if (levelItem.level > OVERDROP_LEVELS.length - numberOfCards) {
                setCurrentStep(OVERDROP_LEVELS.length - numberOfCards);
            } else if (levelItem.level > numberOfCards) {
                setCurrentStep(levelItem.level - (isMobile ? 1 : 2));
            } else {
                setCurrentStep(levelItem.level - 2 > 0 ? levelItem.level - (isMobile ? 1 : 2) : 0);
            }
        }
    }, [levelItem, numberOfCards, isMobile]);

    const handleOnNext = () => {
        if (currentStep + 1 + numberOfCards == OVERDROP_LEVELS.length + 1) return;
        setCurrentStep(currentStep + 1);
    };

    const handleOnPrevious = () => {
        if (currentStep - 1 <= -1) return;
        setCurrentStep(currentStep - 1);
    };

    const handlers = useSwipeable({
        onSwipedRight: () => handleOnPrevious(),
        onSwipedLeft: () => handleOnNext(),
    });

    const progressLevel = getProgressLevel(
        userData?.points ?? 0,
        0,
        nextOverRewardLevel?.minimumPoints ?? OVERDROP_LEVELS[1].minimumPoints
    );

    return (
        <Wrapper>
            <BadgeWrapper {...handlers}>
                {OVERDROP_LEVELS.slice(1, OVERDROP_LEVELS.length).map((item, index) => {
                    return (
                        <SmallBadge
                            key={index}
                            level={item.level}
                            requiredPointsForLevel={item.minimumPoints}
                            levelName={item.levelName}
                            reached={levelItem ? item.level <= levelItem.level : false}
                        />
                    );
                })}
            </BadgeWrapper>

            <DetailsWrapper>
                {levelItem.level !== OVERDROP_LEVELS.length - 1 && !HIDE_FREE_BET_LEVEL && (
                    <ItemContainer>
                        <Label>{t('overdrop.overdrop-home.next-over-rewards-at')}</Label>
                        <ValueWrapper>
                            <ValueSecondary>
                                {nextOverRewardLevel
                                    ? `${formatPoints(nextOverRewardLevel?.minimumPoints)} @ LVL ${
                                          nextOverRewardLevel?.level
                                      }  (${formatCurrencyWithKey(
                                          CRYPTO_CURRENCY_MAP.OVER,
                                          nextOverRewardLevel?.voucherAmount ?? 0,
                                          0,
                                          true
                                      )})`
                                    : ''}
                            </ValueSecondary>
                        </ValueWrapper>

                        <ProgressContainer>
                            <Progress
                                progress={isNaN(progressLevel) ? 0 : progressLevel}
                                width="100%"
                                height="18px"
                                textBelow={`${formatPoints(userData?.points ?? 0)} / ${formatPoints(
                                    nextOverRewardLevel?.minimumPoints ?? OVERDROP_LEVELS[1].minimumPoints
                                )}`}
                            />
                        </ProgressContainer>
                        <Disclaimer>{t('overdrop.leveling-tree.payout-disclaimer')}</Disclaimer>
                    </ItemContainer>
                )}
            </DetailsWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    justify-content: space-around;
    flex-grow: 4;
    @media (max-width: 767px) {
        margin-top: 10px;
    }
`;

const BadgeWrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
`;

const DetailsWrapper = styled(FlexDivRow)`
    width: 100%;
    @media (max-width: 767px) {
        flex-direction: column;
        margin-left: 0px;
        padding: 0px 10px;
    }
`;

const ItemContainer = styled(FlexDivColumn)`
    max-width: 50%;
    align-items: center;
    justify-content: center;
    gap: 4px;
    @media (max-width: 767px) {
        min-width: 100%;
        margin-top: 10px;
    }
    text-align: center;
`;

const ValueWrapper = styled(FlexDivRow)``;

const Label = styled.span`
    font-size: 13px;
    font-weight: 700;
    line-height: 110%;
    margin-bottom: 5px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const ValueSecondary = styled(Label)`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.septenary};
`;

const ProgressContainer = styled(FlexDiv)`
    min-width: 100%;
`;

const Disclaimer = styled.p`
    font-size: 9px;
    font-weight: 400;
    line-height: 10px;
`;

export default BadgeOverview;

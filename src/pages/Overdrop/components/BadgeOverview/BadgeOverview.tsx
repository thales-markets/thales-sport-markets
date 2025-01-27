import Progress from 'components/Progress';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import useOpAndArbPriceQuery from 'queries/overdrop/useOpAndArbPriceQuery';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSwipeable } from 'react-swipeable';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { formatPoints, getCurrentLevelByPoints, getNextThalesRewardLevel, getProgressLevel } from 'utils/overdrop';
import { useAccount } from 'wagmi';
import SmallBadge from '../SmallBadge';

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const { address, isConnected } = useAccount();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [numberOfCards, setNumberOfCards] = useState<number>(isMobile ? 3 : 6);

    useEffect(() => {
        isMobile ? setNumberOfCards(4) : setNumberOfCards(6);
    }, [isMobile]);

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });

    const priceQuery = useOpAndArbPriceQuery();

    const exchangeRates = priceQuery.isSuccess && priceQuery.data ? priceQuery.data : null;

    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const levelItem = userData ? getCurrentLevelByPoints(userData.points) : OVERDROP_LEVELS[0];
    const nextThalesRewardLevel = getNextThalesRewardLevel(userData?.points);

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
        nextThalesRewardLevel?.minimumPoints ?? OVERDROP_LEVELS[1].minimumPoints
    );

    return (
        <Wrapper>
            <BadgeWrapper {...handlers}>
                <Arrow className={'icon-homepage icon--arrow-left'} onClick={() => handleOnPrevious()} />
                {OVERDROP_LEVELS.slice(currentStep, currentStep + numberOfCards).map((item, index) => {
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
                <Arrow className={'icon-homepage icon--arrow-right'} onClick={() => handleOnNext()} />
            </BadgeWrapper>
            <DetailsWrapper>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.current-rewards')}</Label>
                    <ValueWrapper>
                        <Value>
                            {formatCurrencyWithKey(
                                CRYPTO_CURRENCY_MAP.OP,
                                userData?.rewards?.op ? userData.rewards.op : 0
                            )}
                        </Value>
                        <Icon className="icon icon--op" />
                        <ValueSecondary>
                            {exchangeRates && userData
                                ? `= ${formatCurrencyWithSign('$', exchangeRates.op * userData.rewards.op, 2)}`
                                : 'N/A'}
                        </ValueSecondary>
                    </ValueWrapper>
                    <ValueWrapper>
                        <Value>
                            {formatCurrencyWithKey(
                                CRYPTO_CURRENCY_MAP.ARB,
                                userData?.rewards?.arb ? userData.rewards.arb : 0
                            )}
                        </Value>
                        <Icon className="icon icon--arb" />
                        <ValueSecondary>
                            {exchangeRates && userData
                                ? `= ${formatCurrencyWithSign('$', exchangeRates.arb * userData.rewards.arb, 2)}`
                                : 'N/A'}
                        </ValueSecondary>
                    </ValueWrapper>
                </ItemContainer>
                {levelItem.level !== OVERDROP_LEVELS.length - 1 && (
                    <ItemContainer>
                        <Label>{t('overdrop.overdrop-home.next-thales-rewards-at')}</Label>
                        <ValueWrapper>
                            <ValueSecondary>
                                {nextThalesRewardLevel
                                    ? `${formatPoints(nextThalesRewardLevel?.minimumPoints)} @ LVL ${
                                          nextThalesRewardLevel?.level
                                      }  (${formatCurrencyWithKey(
                                          'THALES',
                                          nextThalesRewardLevel?.voucherAmount ?? 0,
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
                                    nextThalesRewardLevel?.minimumPoints ?? OVERDROP_LEVELS[1].minimumPoints
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
    align-items: center;
    justify-content: space-between;
`;

const DetailsWrapper = styled(FlexDivRow)`
    width: 100%;
    margin-top: 20px;
    margin-left: 10px;
    @media (max-width: 767px) {
        flex-direction: column;
        margin-left: 0px;
        padding: 0px 10px;
    }
`;

const ItemContainer = styled(FlexDivColumn)`
    max-width: 50%;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 4px;
    @media (max-width: 767px) {
        min-width: 100%;
        margin-top: 10px;
    }
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

const Value = styled(Label)``;

const ValueSecondary = styled(Label)`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.septenary};
`;

const Arrow = styled.i`
    color: ${(props) => props.theme.button.background.senary};
    font-size: 18px;
    cursor: pointer;
`;

const Icon = styled.i`
    font-size: 15px;
    font-weight: 300;
    margin: 0 3px;
    color: ${(props) => props.theme.textColor.primary};
`;

const ProgressContainer = styled(FlexDiv)`
    min-width: 100%;
`;

const Disclaimer = styled.p`
    font-size: 12px;
    font-style: italic;
`;

export default BadgeOverview;

import Progress from 'components/Progress';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { formatPoints, getCurrentLevelByPoints, getNextThalesRewardLevel, getProgressLevel } from 'utils/overdrop';
import SmallBadge from '../SmallBadge/SmallBadge';

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [numberOfCards, setNumberOfCards] = useState<number>(6);

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userData: OverdropUserData | undefined = useMemo(() => {
        if (userDataQuery?.isSuccess && userDataQuery?.data) {
            return userDataQuery.data;
        }
        return;
    }, [userDataQuery.data, userDataQuery?.isSuccess]);

    const levelItem: OverdropLevel | undefined = useMemo(() => {
        if (userData) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            return levelItem;
        }
    }, [userData]);

    const nextThalesRewardLevel: OverdropLevel | undefined = useMemo(() => {
        if (userData) {
            const levelItem = getNextThalesRewardLevel(userData?.points);
            return levelItem;
        }
        return;
    }, [userData]);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    useEffect(() => {
        if (isMobile) setNumberOfCards(4);
        setNumberOfCards(6);
    }, [isMobile]);

    const handleOnNext = () => {
        if (currentStep + 1 + numberOfCards == OVERDROP_LEVELS.length + 1) return;
        setCurrentStep(currentStep + 1);
    };

    const handleOnPrevious = () => {
        if (currentStep - 1 <= -1) return;
        setCurrentStep(currentStep - 1);
    };

    return (
        <Wrapper>
            <BadgeWrapper>
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
                                ? `= ${formatCurrencyWithSign(
                                      '$',
                                      exchangeRates[CRYPTO_CURRENCY_MAP.OP] * userData.rewards.op,
                                      2
                                  )}`
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
                                ? `= ${formatCurrencyWithSign(
                                      '$',
                                      exchangeRates[CRYPTO_CURRENCY_MAP.ARB] * userData.rewards.arb,
                                      2
                                  )}`
                                : 'N/A'}
                        </ValueSecondary>
                    </ValueWrapper>
                </ItemContainer>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.next-thales-rewards-at')}</Label>
                    <ValueWrapper>
                        <ValueSecondary>
                            {nextThalesRewardLevel
                                ? `${formatPoints(nextThalesRewardLevel?.minimumPoints)} @ LVL ${
                                      nextThalesRewardLevel?.level
                                  }`
                                : ''}
                        </ValueSecondary>
                    </ValueWrapper>
                    {userData?.points && levelItem && nextThalesRewardLevel && (
                        <ProgressContainer>
                            <Progress
                                progress={getProgressLevel(
                                    userData?.points,
                                    levelItem?.minimumPoints,
                                    nextThalesRewardLevel?.minimumPoints
                                )}
                                width="100%"
                                height="18px"
                            />
                        </ProgressContainer>
                    )}
                </ItemContainer>
            </DetailsWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    justify-content: space-around;
    flex-grow: 4;
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

export default BadgeOverview;

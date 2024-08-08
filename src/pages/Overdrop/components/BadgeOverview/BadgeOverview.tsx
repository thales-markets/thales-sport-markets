import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { formatPoints, getCurrentLevelByPoints, getNextLevelItemByPoints } from 'utils/overdrop';
import SmallBadge from '../SmallBadge/SmallBadge';

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [numberOfCards, setNumberOfCards] = useState<number>(6);

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

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

    const nextLevelItem: OverdropLevel | undefined = useMemo(() => {
        if (userData) {
            const levelItem = getNextLevelItemByPoints(userData.points);
            return levelItem;
        }
    }, [userData]);

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
                        <Value>{`13.870,21 OP`}</Value>
                        <Icon className="icon icon--op" />
                        <ValueSecondary>{'= USD 9,167.42'}</ValueSecondary>
                    </ValueWrapper>
                    <ValueWrapper>
                        <Value>{`6.742,32 ARB`}</Value>
                        <Icon className="icon icon--arb" />
                        <ValueSecondary>{'= USD 9,167.42'}</ValueSecondary>
                    </ValueWrapper>
                </ItemContainer>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.next-thales-rewards-at')}</Label>
                    <ValueWrapper>
                        <ValueSecondary>
                            {nextLevelItem
                                ? `${formatPoints(nextLevelItem?.minimumPoints)} @ LVL ${nextLevelItem?.level}`
                                : ''}
                        </ValueSecondary>
                    </ValueWrapper>
                </ItemContainer>
            </DetailsWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
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
`;

const ItemContainer = styled(FlexDivColumn)`
    max-width: 50%;
    align-items: flex-start;
    justify-content: flex-start;
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
    font-weight: 400;
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

export default BadgeOverview;

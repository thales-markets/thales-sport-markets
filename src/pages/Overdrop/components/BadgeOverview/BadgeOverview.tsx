import Tooltip from 'components/Tooltip';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel, ThemeInterface } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import SmallBadge from '../SmallBadge/SmallBadge';

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
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
                            reached={levelItem ? item.level < levelItem.level : false}
                        />
                    );
                })}
                <Arrow className={'icon-homepage icon--arrow-right'} onClick={() => handleOnNext()} />
            </BadgeWrapper>
            <DetailsWrapper>
                <ItemContainer>
                    <ItemWrapper>
                        <Label>{t('overdrop.overdrop-home.level')}</Label>
                        <Value>{'#6 Semi-Pro'}</Value>
                    </ItemWrapper>
                    <Tooltip
                        iconColor={theme.textColor.septenary}
                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                        iconFontSize={14}
                        marginLeft={2}
                    />
                </ItemContainer>

                <ItemContainer>
                    <ItemWrapper>
                        <Label>{t('overdrop.overdrop-home.xp')}</Label>
                        <Value>{'7374 XP'}</Value>
                    </ItemWrapper>
                    <Tooltip
                        iconColor={theme.textColor.septenary}
                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                        iconFontSize={14}
                        marginLeft={2}
                    />
                </ItemContainer>
                <ItemContainer>
                    <ItemWrapper>
                        <Label>{t('overdrop.overdrop-home.next-level')}</Label>
                        <Value>{'3759 XP to lvl 7'}</Value>
                    </ItemWrapper>
                    <Tooltip
                        iconColor={theme.textColor.septenary}
                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                        iconFontSize={14}
                        marginLeft={2}
                    />
                </ItemContainer>
                <ItemContainer>
                    <ItemWrapper>
                        <Label>{t('overdrop.overdrop-home.level')}</Label>
                        <Value>{'#6 Semi-Pro'}</Value>
                    </ItemWrapper>
                    <Tooltip
                        iconColor={theme.textColor.septenary}
                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                        iconFontSize={14}
                        marginLeft={2}
                    />
                </ItemContainer>
                <ItemContainer>
                    <ItemWrapper>
                        <Label>{t('overdrop.overdrop-home.total-xp-multiplier')}</Label>
                        <Value>{'x 2.1'}</Value>
                    </ItemWrapper>
                    <Tooltip
                        iconColor={theme.textColor.septenary}
                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                        iconFontSize={14}
                        marginLeft={2}
                    />
                </ItemContainer>
                <ItemContainer>
                    <ItemWrapper>
                        <Label>{t('overdrop.overdrop-home.level')}</Label>
                        <Value>{'#6 Semi-Pro'}</Value>
                    </ItemWrapper>
                    <Tooltip
                        iconColor={theme.textColor.septenary}
                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                        iconFontSize={14}
                        marginLeft={2}
                    />
                </ItemContainer>
            </DetailsWrapper>
            <CurrentRewardsLabel>{t('overdrop.overdrop-home.current-rewards')}</CurrentRewardsLabel>
            <Rewards>
                {`13.870,21 OP`}
                <Icon className="icon icon--op" />
                {`6.742,32 ARB`}
                <Icon className="icon icon--arb" />
            </Rewards>
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

const DetailsWrapper = styled(FlexDivColumn)`
    width: 100%;
    margin-top: 20px;
`;

const ItemContainer = styled(FlexDivRow)`
    align-items: center;
`;

const ItemWrapper = styled(FlexDivRow)`
    width: 100%;
    padding: 4px 10px;
    margin-bottom: 5px;
    background-color: ${(props) => props.theme.overdrop.background.tertiary};
`;

const Label = styled.span`
    font-size: 13.5px;
    font-weight: 400;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const Value = styled.span`
    text-align: right;
    font-size: 13.5px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const Arrow = styled.i`
    color: ${(props) => props.theme.button.background.senary};
    font-size: 18px;
    cursor: pointer;
`;

const CurrentRewardsLabel = styled.span`
    margin-top: 16px;
    font-size: 13px;
    font-weight: 700;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
`;

const Rewards = styled.span`
    margin-top: 10px;
    font-size: 13px;
    font-weight: 700;
    color: ${(props) => props.theme.textColor.primary};
`;

const Icon = styled.i`
    font-size: 15px;
    font-weight: 300;
    margin: 0 3px;
    color: ${(props) => props.theme.textColor.primary};
`;

export default BadgeOverview;

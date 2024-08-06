import Tooltip from 'components/Tooltip';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import SmallBadge from '../SmallBadge/SmallBadge';

const NUMBER_OF_CARDS = 6;

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [currentStep, setCurrentStep] = useState<number>(0);

    const handleOnNext = () => {
        if (currentStep + 1 + NUMBER_OF_CARDS == OVERDROP_LEVELS.length + 1) return;
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
                {OVERDROP_LEVELS.slice(currentStep, currentStep + NUMBER_OF_CARDS).map((item, index) => {
                    return (
                        <SmallBadge
                            key={index}
                            level={item.level}
                            requiredPointsForLevel={item.minimumPoints}
                            levelName={item.levelName}
                            reached={item.level < 7}
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

export default BadgeOverview;

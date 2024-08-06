import Tooltip from 'components/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import SmallBadge from '../SmallBadge/SmallBadge';

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    return (
        <Wrapper>
            <BadgeWrapper>
                <SmallBadge level={4} requiredPointsForLevel={1000} levelName="challenger" reached={true} />
                <SmallBadge level={5} requiredPointsForLevel={2500} levelName="competitor" reached={true} />
                <SmallBadge level={6} requiredPointsForLevel={5000} levelName="semi-pro" reached={true} />
                <SmallBadge level={7} requiredPointsForLevel={10000} levelName="professional" reached={false} />
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

// const TooltipIcon = styled.i`
//     color: ${(props) => props.theme.textColor.septenary};
//     font-size: 15px;
//     margin-left: 4px;
// `;

export default BadgeOverview;

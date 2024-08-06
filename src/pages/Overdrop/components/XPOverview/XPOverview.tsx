import { OVERDROP_LEVELS } from 'constants/overdrop';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import ProgressLine from '../ProgressLine';

const XPOverview: React.FC = () => {
    const { t } = useTranslation();
    const levelItem = OVERDROP_LEVELS.find((item) => item.level == 6);

    return (
        <Wrapper>
            <Badge src={levelItem ? levelItem.largeBadge : ''} />
            <ProgressOverviewWrapper>
                <InfoWrapper>
                    <InfoItem>
                        <Label>{levelItem?.levelName}</Label>
                        <Value>{'#420'}</Value>
                    </InfoItem>
                    <InfoItemTotal>
                        <Label>{t('overdrop.overdrop-home.my-total-xp')}</Label>
                        <TotalValue>{'87,432.28 XP'}</TotalValue>
                    </InfoItemTotal>
                </InfoWrapper>
                <ProgressLine progress={65} currentPoints={7374} nextLevelPoints={8000} level={6} />
            </ProgressOverviewWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    padding: 18px;
    border-radius: 6px;
    flex-direction: row;
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.background.quinary} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    position: relative;
    align-items: center;
    height: 120px;
    @media (max-width: 767px) {
        height: 115px;
        padding: 8px;
    }
`;

const ProgressOverviewWrapper = styled(FlexDivColumn)``;

const InfoWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: space-between;
    @media (max-width: 767px) {
        flex-direction: column;
        flex-wrap: wrap;
    }
`;

const InfoItem = styled(FlexDivColumn)`
    align-items: flex-start;
    @media (max-width: 767px) {
        flex-direction: row;
        justify-content: flex-start;
    }
`;

const InfoItemTotal = styled(FlexDivColumn)`
    align-items: flex-start;
    @media (max-width: 767px) {
        justify-content: center;
        align-items: center;
    }
`;

const Label = styled.span`
    text-transform: uppercase;
    font-weight: 300;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

const Value = styled.span<{ highlight?: boolean }>`
    font-weight: 800;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => (props.highlight ? props.theme.textColor.primary : props.theme.textColor.primary)};
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

const TotalValue = styled.span<{ highlight?: boolean }>`
    font-weight: 800;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => (props.highlight ? props.theme.textColor.primary : props.theme.textColor.primary)};
    @media (max-width: 767px) {
        font-size: 27px;
        color: ${(props) => props.theme.overdrop.textColor.primary};
        font-weight: 700;
    }
`;

const Badge = styled.img`
    width: 190px;
    height: 190px;
    @media (max-width: 767px) {
        width: 170px;
        height: 170px;
    }
`;

export default XPOverview;

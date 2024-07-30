import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

const DailyRecap: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.daily-streak')}</Label>
                <Value>{'+50%'}</Value>
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.twitter-share')}</Label>
                <Value>{'+10%'}</Value>
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.twitter-xp-boost-resets')}</Label>
                <Value>{'08:30:55'}</Value>
            </ItemContainer>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    height: 100%;
    padding: 30px 19px;
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.background.quinary} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
`;

const ItemContainer = styled(FlexDivColumn)``;

const Label = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 2px;
`;

const Value = styled.span`
    font-size: 31px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

export default DailyRecap;

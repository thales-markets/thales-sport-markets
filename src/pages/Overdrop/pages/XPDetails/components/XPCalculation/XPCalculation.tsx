import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';

const XPCalculation: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <BoxWrapper>
                <BoxLabel>{t('overdrop.xp-details.days-in-row')}</BoxLabel>
                <Box>
                    <Badge>{'3'}</Badge>
                    <MainLabel>{t('overdrop.xp-details.daily-multiplier')}</MainLabel>
                    <Value>{'+30%'}</Value>
                </Box>
            </BoxWrapper>
            <Signs>{'+'}</Signs>
            <BoxWrapper>
                <BoxLabel>{t('overdrop.xp-details.shared-flex')}</BoxLabel>
                <Box>
                    <Badge>{<Icon className="icon icon--x" />}</Badge>
                    <MainLabel>{t('overdrop.xp-details.twitter-multiplier')}</MainLabel>
                    <Value>{'+10%'}</Value>
                </Box>
            </BoxWrapper>
            <Signs>{'='}</Signs>
            <BoxWrapper>
                <MainLabel>{t('overdrop.xp-details.total-bonus')}</MainLabel>
                <HighlightedValue>{'+40%'}</HighlightedValue>
            </BoxWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    justify-content: center;
    align-items: center;
    margin: 25px 0px;
    width: 50%;
`;

const BoxWrapper = styled(FlexDivColumn)`
    align-items: center;
    justify-content: center;
`;

const Box = styled(FlexDivColumn)`
    position: relative;
    align-items: center;
    justify-content: center;
    border-radius: 6.5px;
    padding: 7px 14px;
    width: 100px;
    border: 2px solid transparent;
    background: linear-gradient(${(props) => props.theme.overdrop.background.active} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
`;

const MainLabel = styled.span`
    font-size: 13px;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const BoxLabel = styled(MainLabel)`
    font-size: 9.5px;
    font-weight: 400;
    margin-bottom: 5px;
`;

const Value = styled(MainLabel)`
    font-size: 29px;
    font-weight: 800;
`;

const Signs = styled(Value)``;

const HighlightedValue = styled(Value)`
    font-size: 35px;
    font-weight: 700;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const Badge = styled(FlexDivCentered)`
    width: 24px;
    position: absolute;
    top: -10px;
    left: -10px;
    height: 24px;
    color: ${(props) => props.theme.overdrop.textColor.secondary};
    font-weight: 900;
    font-size: 13px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.overdrop.badge.background.primary};
`;

const Icon = styled.i`
    font-size: 13px;
`;

export default XPCalculation;

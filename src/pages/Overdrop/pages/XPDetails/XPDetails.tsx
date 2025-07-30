import Explainer from 'pages/Overdrop/components/Explainer';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import XPCalculation from './components/XPCalculation';
import XPHistoryTable from './components/XPHistoryTable';

const XPDetails: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <Heading>{t('markets.parlay.overdrop.how-it-works')}</Heading>
            <Paragraph>{t(`markets.parlay.overdrop.tooltip.how-it-works-1`)}</Paragraph>
            <Paragraph>{t(`markets.parlay.overdrop.tooltip.how-it-works-2`)}</Paragraph>
            <Paragraph>{t(`markets.parlay.overdrop.tooltip.how-it-works-3`)}</Paragraph>
            <CalculationWrapper>
                <XPCalculation />
            </CalculationWrapper>
            <Explainer />
            <Heading>{t('overdrop.xp-details.xp-history')}</Heading>
            <XPHistoryTable />
        </>
    );
};

const Heading = styled.h2`
    font-size: 13.5px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 8px;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const CalculationWrapper = styled(FlexDivCentered)``;

const Paragraph = styled.p`
    font-size: 13.5px;
    font-weight: 300;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 12px;
    line-height: 1.2;
`;

export default XPDetails;

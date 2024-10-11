import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import XPCalculation from './components/XPCalculation';
import XPHistoryTable from './components/XPHistoryTable';
import Explainer from 'pages/Overdrop/components/Explainer';

const XPDetails: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <Heading>{t('markets.parlay.overdrop.base-xp')}</Heading>
            <Paragraph>{t(`markets.parlay.overdrop.tooltip.base-xp`)}</Paragraph>
            <Heading>{t('overdrop.xp-details.active-xp-bonus')}</Heading>
            <Paragraph>{t('overdrop.xp-details.paragraph')}</Paragraph>
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
`;

export default XPDetails;

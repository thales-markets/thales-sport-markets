import { t } from 'i18next';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivStart } from 'styles/common';
import Step from './components/Step';

export enum WizardStep {
    INSTALL_METAMASK,
    CONNECT_METAMASK,
    BUY,
    EXCHANGE,
    TRADE,
}

const Wizard: React.FC = () => {
    const steps: WizardStep[] = [WizardStep.INSTALL_METAMASK, WizardStep.BUY, WizardStep.EXCHANGE, WizardStep.TRADE];
    return (
        <Container>
            <WizardTitle>{t('wizard.title')}</WizardTitle>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                return (
                    <React.Fragment key={index}>
                        <Step stepNumber={stepNumber} stepType={step} />
                        {stepNumber !== steps.length && <HorizontalLine />}
                    </React.Fragment>
                );
            })}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 100%;
    margin-bottom: 40px;
`;

const WizardTitle = styled(FlexDivStart)`
    font-weight: 600;
    font-size: 20px;
    line-height: 23px;
    color: #ffffff;
    margin-top: 20px;
    margin-bottom: 40px;
    margin-left: 20%;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1.5px solid #5f6180;
    background: #5f6180;
    border-radius: 3px;
`;

export default Wizard;

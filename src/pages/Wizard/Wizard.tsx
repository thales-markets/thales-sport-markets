import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivStart } from 'styles/common';
import Step from './components/Step/Step';

export enum WizardStep {
    CONNECT_METAMASK,
    FUND,
    EXCHANGE,
    TRADE,
}

const Wizard: React.FC = () => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const steps: WizardStep[] = [WizardStep.CONNECT_METAMASK, WizardStep.FUND, WizardStep.EXCHANGE, WizardStep.TRADE];
    const [currentStep, setCurrentStep] = useState(isWalletConnected ? WizardStep.FUND : WizardStep.CONNECT_METAMASK);

    useEffect(() => {
        if (isWalletConnected) {
            setCurrentStep(WizardStep.FUND);
        } else {
            setCurrentStep(WizardStep.CONNECT_METAMASK);
        }
    }, [isWalletConnected]);

    return (
        <Container>
            <WizardTitle>{t('wizard.title')}</WizardTitle>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                return (
                    <React.Fragment key={index}>
                        <Step
                            stepNumber={stepNumber}
                            stepType={step}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                        />
                        {stepNumber !== steps.length && <HorizontalLine />}
                    </React.Fragment>
                );
            })}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 80%;
    margin-bottom: 40px;
`;

const WizardTitle = styled(FlexDivStart)`
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    color: #ffffff;
    margin-top: 20px;
    margin-bottom: 40px;
    margin-left: 10%;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1.5px solid #5f6180;
    background: #5f6180;
    border-radius: 3px;
`;

export default Wizard;

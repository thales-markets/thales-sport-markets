import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { WizardStep } from '../Wizard';

type StepProps = {
    stepNumber: number;
    stepType: WizardStep;
};

const Step: React.FC<StepProps> = ({ stepNumber, stepType }) => {
    console.log(stepNumber);

    const getStepDescription = (type: WizardStep) => {
        let transKey = 'wizard.steps.description';
        switch (type) {
            case WizardStep.INSTALL_METAMASK:
                transKey += '.install-mm';
                break;
            case WizardStep.CONNECT_METAMASK:
                transKey += '.connect-mm';
                break;
            case WizardStep.BUY:
                transKey += '.buy';
                break;
            case WizardStep.EXCHANGE:
                transKey += '.exchange';
                break;
            case WizardStep.TRADE:
                transKey += '.trade';
                break;
        }
        return (
            <Trans
                i18nKey={transKey}
                components={{
                    b: <strong />,
                }}
            />
        );
    };

    return (
        <Container>
            <StepSection widthPer={20}></StepSection>
            <StepSection widthPer={60}>
                <StepDescription>{getStepDescription(stepType)}</StepDescription>
            </StepSection>
            <StepSection widthPer={20}></StepSection>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
`;

const StepSection = styled.div<{ widthPer?: number }>`
    width: ${(props) => (props.widthPer ? props.widthPer : 100)}%;
`;

const StepDescription = styled.p`
    text-align: justify;
`;

export default Step;

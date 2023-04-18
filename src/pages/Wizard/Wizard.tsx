import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivStart } from 'styles/common';
import YouTubeVideo from '../../components/YouTubeVideo';
import Step from './components/Step/Step';

export enum WizardStep {
    CONNECT_METAMASK,
    FUND,
    EXCHANGE,
    TRADE,
}

const Wizard: React.FC = () => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

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
                        {!isMobile && stepNumber !== steps.length && <HorizontalLine />}
                    </React.Fragment>
                );
            })}
            <VideoContainer>
                <YouTubeVideo
                    source="https://www.youtube.com/embed/udYpsNueZp4"
                    title="What are Overtime Markets and how to participate?  *UPDATED* Overtime Markets video walk through"
                />
            </VideoContainer>
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
    @media (max-width: 950px) {
        margin: 20px auto;
    }
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1.5px solid #5f6180;
    background: #5f6180;
    border-radius: 3px;
`;

const VideoContainer = styled.div`
    margin-top: 50px;
`;

export default Wizard;

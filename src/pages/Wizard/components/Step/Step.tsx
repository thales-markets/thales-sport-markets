import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import SwapModal from 'components/SwapModal';
import ROUTES from 'constants/routes';
import { t } from 'i18next';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { buildHref } from 'utils/routes';
import { WizardStep } from '../../Wizard';
import FundModal from '../FundModal';

type StepProps = {
    stepNumber: number;
    stepType: WizardStep;
    currentStep: WizardStep;
    setCurrentStep: (step: WizardStep) => void;
};

const Step: React.FC<StepProps> = ({ stepNumber, stepType, currentStep, setCurrentStep }) => {
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [showFundModal, setShowFundModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);

    const stepTitle = useMemo(() => {
        let transKey = 'wizard.steps.title';
        switch (stepType) {
            case WizardStep.CONNECT_METAMASK:
                transKey += '.connect-wallet';
                break;
            case WizardStep.FUND:
                transKey += '.fund';
                break;
            case WizardStep.EXCHANGE:
                transKey += '.exchange';
                break;
            case WizardStep.TRADE:
                transKey += '.trade';
                break;
        }
        return t(transKey);
    }, [stepType]);

    const stepDescription = useMemo(() => {
        let transKey = 'wizard.steps.description';
        switch (stepType) {
            case WizardStep.CONNECT_METAMASK:
                transKey += '.connect-wallet';
                break;
            case WizardStep.FUND:
                transKey += '.fund';
                break;
            case WizardStep.EXCHANGE:
                transKey += '.exchange';
                break;
            case WizardStep.TRADE:
                transKey += '.trade';
                break;
        }
        return t(transKey);
    }, [stepType]);

    const getStepAction = () => {
        let className = '';
        let transKey = 'wizard.steps.action';
        switch (stepType) {
            case WizardStep.CONNECT_METAMASK:
                className = 'icon--wallet-connected';
                transKey += isWalletConnected ? '.connected' : '.connect-wallet';
                break;
            case WizardStep.FUND:
                className = 'icon--card';
                transKey += '.fund';
                break;
            case WizardStep.EXCHANGE:
                className = 'icon--exchange';
                transKey += '.exchange';
                break;
            case WizardStep.TRADE:
                className = 'icon--logo';
                transKey += '.trade';
                break;
        }
        return (
            <StepAction>
                <StepActionIconWrapper isActive={isActive} pulsate={!isMobile}>
                    <StepActionIcon
                        className={`icon ${className}`}
                        isDisabled={isDisabled}
                        onClick={onStepActionClickHandler}
                    />
                </StepActionIconWrapper>
                <StepActionLabel isDisabled={isDisabled} onClick={onStepActionClickHandler}>
                    <StepActionName>{t(transKey)}</StepActionName>
                    {!isMobile && <LinkIcon className={`icon icon--arrow-external`} isActive={isActive} />}
                </StepActionLabel>
            </StepAction>
        );
    };

    const isActive = currentStep === stepType;
    const isDisabled = !isWalletConnected && stepType !== WizardStep.CONNECT_METAMASK;

    const onStepActionClickHandler = () => {
        if (isDisabled) {
            return;
        }
        setCurrentStep(stepType);
        switch (stepType) {
            case WizardStep.CONNECT_METAMASK:
                isWalletConnected ? openAccountModal?.() : openConnectModal?.();
                break;
            case WizardStep.FUND:
                setShowFundModal(true);
                break;
            case WizardStep.EXCHANGE:
                setShowSwapModal(true);
                break;
            case WizardStep.TRADE:
                window.open(buildHref(ROUTES.Markets.Home));
                break;
        }
    };

    const changeCurrentStep = () => (isDisabled ? null : setCurrentStep(stepType));

    return (
        <Container>
            {isMobile ? (
                <StepActionSection isActive={isActive} isDisabled={isDisabled}>
                    {getStepAction()}
                </StepActionSection>
            ) : (
                <>
                    <StepNumberSection>
                        <StepNumberWrapper isActive={isActive} isDisabled={isDisabled} onClick={changeCurrentStep}>
                            <StepNumber isActive={isActive}>{stepNumber}</StepNumber>
                        </StepNumberWrapper>
                    </StepNumberSection>
                    <StepDescriptionSection isActive={isActive} isDisabled={isDisabled} onClick={changeCurrentStep}>
                        <StepTitle>{stepTitle}</StepTitle>
                        <StepDescription>{stepDescription}</StepDescription>
                    </StepDescriptionSection>
                    <StepActionSection isActive={isActive} isDisabled={isDisabled}>
                        {getStepAction()}
                    </StepActionSection>
                </>
            )}
            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
            {showSwapModal && <SwapModal onClose={() => setShowSwapModal(false)} />}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    margin-top: 20px;
    margin-bottom: 20px;
    @media (max-width: 950px) {
        margin-top: 10px;
        margin-bottom: 10px;
    }
`;

const StepNumberSection = styled(FlexDivCentered)`
    width: 10%;
`;

const StepDescriptionSection = styled(FlexDivColumn)<{ isActive: boolean; isDisabled?: boolean }>`
    width: 60%;
    color: ${(props) => (props.isActive ? '#ffffff' : '#5F6180')};
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
`;

const StepActionSection = styled(FlexDivCentered)<{ isActive: boolean; isDisabled?: boolean }>`
    width: 30%;
    text-align: center;
    color: ${(props) => (props.isActive ? '#3FD1FF' : '#5f6180')};
    @media (max-width: 950px) {
        width: 100%;
        text-align: start;
        justify-content: start;
    }
`;

const StepAction = styled.div`
    @media (max-width: 950px) {
        display: flex;
    }
`;

const StepTitle = styled.span`
    font-weight: 700;
    font-size: 20px;
    line-height: 27px;

    margin-bottom: 10px;
`;

const StepDescription = styled.p`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    text-align: justify;
`;

const StepNumberWrapper = styled.div<{ isActive: boolean; isDisabled?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    ${(props) => (props.isActive ? 'border: 2px solid #3FD1FF;' : '')}
    ${(props) => (props.isActive ? '' : 'background: #5f6180;')}
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
`;

const StepNumber = styled.span<{ isActive: boolean }>`
    font-weight: 700;
    font-size: 29px;
    line-height: 43px;
    text-transform: uppercase;
    color: ${(props) => (props.isActive ? '#ffffff' : '#1a1c2b')};
`;

const StepActionIconWrapper = styled.div<{ isActive: boolean; pulsate?: boolean }>`
    animation: ${(props) => (props.pulsate && props.isActive ? 'pulsing 1s ease-in' : '')};
    animation-iteration-count: ${(props) => (props.pulsate && props.isActive ? 'infinite;' : '')};

    @media (max-width: 950px) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        ${(props) => (props.isActive ? 'border: 2px solid #3FD1FF;' : '')}
        ${(props) => (props.isActive ? '' : 'background: #5f6180;')}
    }

    @keyframes pulsing {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.3);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

const StepActionIcon = styled.i<{ isDisabled?: boolean }>`
    font-size: 35px;
    padding-bottom: 15px;
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
    @media (max-width: 950px) {
        padding-bottom: 0;
        color: #ffffff;
        font-size: 30px;
    }
`;

const StepActionLabel = styled.div<{ isDisabled?: boolean }>`
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
    @media (max-width: 950px) {
        display: flex;
        align-items: center;
        margin-left: 20px;
    }
`;

const StepActionName = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    @media (max-width: 950px) {
        font-size: 20px;
        line-height: 27px;
    }
`;

const LinkIcon = styled.i<{ isActive: boolean }>`
    font-size: 14px;
    margin-left: 10px;
    animation: ${(props) => (props.isActive ? 'pulsing 1s ease-in' : '')};
    animation-iteration-count: ${(props) => (props.isActive ? 'infinite;' : '')};
`;

export default Step;

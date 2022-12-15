import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import SwapModal from 'components/SwapModal';
import ROUTES from 'constants/routes';
import { t } from 'i18next';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { buildHref } from 'utils/routes';
import { WizardStep } from '../../Wizard';
import BuyBridgeSendModal from '../BuyBridgeSendModal';

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

    const [showBuyModal, setShowBuyModal] = useState(false);
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
                className = 'icon--wallet-connected'; // TODO:
                transKey += '.fund';
                break;
            case WizardStep.EXCHANGE:
                className = 'icon--wallet-connected'; // TODO:
                transKey += '.exchange';
                break;
            case WizardStep.TRADE:
                className = 'icon--logo';
                transKey += '.trade';
                break;
        }
        return (
            <div>
                <StepActionIcon
                    className={`icon ${className}`}
                    isDisabled={isDisabled}
                    onClick={onStepActionClickHandler}
                />
                <StepActionLabel isDisabled={isDisabled} onClick={onStepActionClickHandler}>
                    <StepActionName>{t(transKey)}</StepActionName>
                    <LinkIcon className={`icon icon--arrow-external`} />
                </StepActionLabel>
            </div>
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
                setShowBuyModal(true);
                break;
            case WizardStep.EXCHANGE:
                setShowSwapModal(true);
                break;
            case WizardStep.TRADE:
                window.open(buildHref(ROUTES.Markets.Home));
                break;
        }
    };

    return (
        <Container>
            <StepNumberSection
                isActive={isActive}
                isDisabled={isDisabled}
                onClick={() => (isDisabled ? null : setCurrentStep(stepType))}
            >
                <StepNumberWrapper isActive={isActive}>
                    <StepNumber isActive={isActive}>{stepNumber}</StepNumber>
                </StepNumberWrapper>
            </StepNumberSection>
            <StepDescriptionSection isActive={isActive}>
                <StepTitle>{stepTitle}</StepTitle>
                <StepDescription>{stepDescription}</StepDescription>
            </StepDescriptionSection>
            <StepActionSection isActive={isActive} isDisabled={isDisabled}>
                {getStepAction()}
            </StepActionSection>
            {showBuyModal && <BuyBridgeSendModal onClose={() => setShowBuyModal(false)} />}
            {showSwapModal && <SwapModal onClose={() => setShowSwapModal(false)} />}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    margin-top: 20px;
    margin-bottom: 20px;
`;

const StepNumberSection = styled(FlexDivCentered)<{ isActive: boolean; isDisabled?: boolean }>`
    width: 10%;
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
`;

const StepDescriptionSection = styled(FlexDivColumn)<{ isActive: boolean }>`
    width: 60%;
    color: ${(props) => (props.isActive ? '#ffffff' : '#5F6180')};
`;

const StepActionSection = styled(FlexDivCentered)<{ isActive: boolean; isDisabled?: boolean }>`
    width: 30%;
    text-align: center;
    color: ${(props) => (props.isActive ? '#3FD1FF' : '#5f6180')};
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

const StepNumberWrapper = styled.div<{ isActive: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    ${(props) => (props.isActive ? 'border: 2px solid #3FD1FF;' : '')}
    ${(props) => (props.isActive ? '' : 'background: #5f6180;')}
`;

const StepNumber = styled.span<{ isActive: boolean }>`
    font-weight: 700;
    font-size: 29px;
    line-height: 43px;
    text-transform: uppercase;
    color: ${(props) => (props.isActive ? '#ffffff' : '#1a1c2b')};
`;

const StepActionIcon = styled.i<{ isDisabled?: boolean }>`
    font-size: 35px;
    margin-bottom: 15px;
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
`;

const StepActionLabel = styled.div<{ isDisabled?: boolean }>`
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
`;

const StepActionName = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
`;

const LinkIcon = styled.i`
    font-size: 14px;
    margin-left: 10px;
`;

export default Step;

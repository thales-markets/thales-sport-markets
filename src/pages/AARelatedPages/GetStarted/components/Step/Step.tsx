import ROUTES from 'constants/routes';
import { GetStartedStep } from 'enums/wizard';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getIsConnectedViaParticle,
    getIsWalletConnected,
    getNetworkId,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { getDefaultCollateral } from 'utils/collaterals';
import { getDefaultNetworkName, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref, navigateTo } from 'utils/routes';

type StepProps = {
    stepNumber: number;
    stepType: GetStartedStep;
    currentStep: GetStartedStep;
    setCurrentStep: (step: GetStartedStep) => void;
};

const Step: React.FC<StepProps> = ({ stepNumber, stepType, currentStep, setCurrentStep }) => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const dispatch = useDispatch();

    const stepTitle = useMemo(() => {
        let transKey = 'get-started.steps.title';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                transKey += isConnectedViaParticle && isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                transKey += '.trade';
                break;
        }
        return t(transKey);
    }, [isConnectedViaParticle, isWalletConnected, stepType]);

    const stepDescription = useMemo(() => {
        let transKey = 'get-started.steps.description';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                transKey += isConnectedViaParticle && isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                transKey += '.trade';
                break;
        }

        return t(transKey, {
            network: getNetworkNameByNetworkId(networkId, true) || getDefaultNetworkName(true),
            collateral: getDefaultCollateral(networkId),
        });
    }, [stepType, networkId, isConnectedViaParticle, isWalletConnected]);

    const getStepAction = () => {
        let className = '';
        let transKey = 'get-started.steps.action';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                className = 'icon--card';
                transKey += isConnectedViaParticle && isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                className = 'icon--card';
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
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
    const isDisabled = !isWalletConnected && stepType !== GetStartedStep.LOG_IN;

    const onStepActionClickHandler = () => {
        if (isDisabled) {
            return;
        }
        setCurrentStep(stepType);
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                dispatch(
                    setWalletConnectModalVisibility({
                        visibility: true,
                    })
                );
                break;
            case GetStartedStep.DEPOSIT:
                navigateTo(buildHref(ROUTES.Deposit));
                break;
            case GetStartedStep.TRADE:
                navigateTo(buildHref(ROUTES.Markets.Home));
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
    color: ${(props) => (props.isActive ? props.theme.textColor.primary : props.theme.textColor.secondary)};
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
`;

const StepActionSection = styled(FlexDivCentered)<{ isActive: boolean; isDisabled?: boolean }>`
    width: 30%;
    text-align: center;
    color: ${(props) => (props.isActive ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
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
    ${(props) => (props.isActive ? `border: 2px solid ${props.theme.borderColor.quaternary};` : '')}
    ${(props) => (props.isActive ? '' : `background: ${props.theme.background.tertiary};`)}
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
`;

const StepNumber = styled.span<{ isActive: boolean }>`
    font-weight: 700;
    font-size: 29px;
    line-height: 43px;
    text-transform: uppercase;
    color: ${(props) =>
        props.isActive ? props.theme.button.textColor.secondary : props.theme.button.textColor.primary};
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
        ${(props) => (props.isActive ? `border: 2px solid ${props.theme.borderColor.quaternary};` : '')}
        ${(props) => (props.isActive ? '' : `background: ${props.theme.background.tertiary};`)}
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
        color: ${(props) => props.theme.textColor.primary};
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

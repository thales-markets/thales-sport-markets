import { GetStartedStep } from 'enums/wizard';
import { t } from 'i18next';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivStart } from 'styles/common';
import { getCollaterals } from 'utils/collaterals';
import Step from './components/Step';

const GetStarted: React.FC = () => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const steps: GetStartedStep[] = [GetStartedStep.LOG_IN, GetStartedStep.DEPOSIT, GetStartedStep.TRADE];
    const [currentStep, setCurrentStep] = useState<GetStartedStep>(
        isWalletConnected && isConnectedViaParticle ? GetStartedStep.DEPOSIT : GetStartedStep.LOG_IN
    );

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId, isConnectedViaParticle).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total ? total : 0;
        } catch (e) {
            return 0;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, isConnectedViaParticle]);

    useEffect(() => {
        if (totalBalanceValue > 0) {
            setCurrentStep(GetStartedStep.TRADE);
            return;
        }
        if (isWalletConnected) {
            setCurrentStep(GetStartedStep.DEPOSIT);
        } else {
            setCurrentStep(GetStartedStep.LOG_IN);
        }
    }, [isWalletConnected, totalBalanceValue]);

    return (
        <Container>
            <Title>{t('get-started.title')}</Title>
            <ProgressDisplayWrapper>
                {steps.map((step, index) => {
                    return <ProgressBar key={`progress-${index}`} selected={step <= currentStep} />;
                })}
            </ProgressDisplayWrapper>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                return (
                    <React.Fragment key={index}>
                        <Step
                            stepNumber={stepNumber}
                            stepType={step}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            hasFunds={totalBalanceValue > 0}
                        />
                        {!isMobile && stepNumber !== steps.length && <HorizontalLine />}
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

const Title = styled(FlexDivStart)`
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 20px;
    margin-bottom: 40px;
    @media (max-width: 950px) {
        margin: 20px auto;
    }
`;

const ProgressDisplayWrapper = styled(FlexDiv)`
    margin-top: 30px;
    height: 20px;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
`;

const ProgressBar = styled(FlexDiv)<{ selected?: boolean }>`
    height: 10px;
    width: 32%;
    border-radius: 10px;
    background-color: ${(props) =>
        props.selected ? props.theme.progressBar.selected : props.theme.progressBar.unselected};
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1.5px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.tertiary};
    border-radius: 3px;
`;

export default GetStarted;

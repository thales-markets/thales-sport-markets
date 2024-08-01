import Button from 'components/Button';
import Modal from 'components/Modal';
import SimpleLoader from 'components/SimpleLoader';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BuyTicketStep } from 'enums/tickets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { defaultButtonProps } from '../styled-components';
import { Coins } from 'thales-utils';

type BuyStepsModalProps = {
    step: BuyTicketStep;
    isFailed: boolean;
    currencyKey: Coins;
    onSubmit: () => void;
    onClose: () => void;
};

const BuyStepsModal: React.FC<BuyStepsModalProps> = ({ step, isFailed, currencyKey, onSubmit, onClose }) => {
    const { t } = useTranslation();

    const getLoader = () => (
        <LoaderContainer>
            <SimpleLoader size={24} strokeWidth={4} />
        </LoaderContainer>
    );

    const getCheckmark = () => <Checkmark className="icon icon--correct" />;
    const getFailureMark = () => <FailureMark className="icon icon--wrong" />;

    const statusFailedOrInProgress = isFailed ? getFailureMark() : getLoader();
    const isEth = currencyKey === CRYPTO_CURRENCY_MAP.ETH;

    return (
        <Modal title={''} onClose={onClose} shouldCloseOnOverlayClick={false}>
            <Container>
                {!isEth && (
                    <FlexDivRow>
                        <Text>
                            {t('markets.parlay.buy-steps.approve-swap', { currencyKey: CRYPTO_CURRENCY_MAP.THALES })}:
                        </Text>
                        {step === BuyTicketStep.APPROVE_SWAP ? statusFailedOrInProgress : getCheckmark()}
                    </FlexDivRow>
                )}
                <FlexDivRow>
                    <Text>{t('markets.parlay.buy-steps.swap', { currencyKey: CRYPTO_CURRENCY_MAP.THALES })}:</Text>
                    {step === BuyTicketStep.SWAP
                        ? statusFailedOrInProgress
                        : step > BuyTicketStep.SWAP
                        ? getCheckmark()
                        : ''}
                </FlexDivRow>
                <FlexDivRow>
                    <Text>
                        {t('markets.parlay.buy-steps.approve-buy', { currencyKey: CRYPTO_CURRENCY_MAP.THALES })}:
                    </Text>
                    {step === BuyTicketStep.APPROVE_BUY
                        ? statusFailedOrInProgress
                        : step > BuyTicketStep.APPROVE_BUY
                        ? getCheckmark()
                        : ''}
                </FlexDivRow>
                <FlexDivRow>
                    <Text>{t('markets.parlay.buy-steps.buy', { currencyKey: CRYPTO_CURRENCY_MAP.THALES })}:</Text>
                    {step === BuyTicketStep.BUY
                        ? statusFailedOrInProgress
                        : step > BuyTicketStep.BUY
                        ? getCheckmark()
                        : ''}
                </FlexDivRow>

                {isFailed && (
                    <FlexDivCentered>
                        <Button onClick={onSubmit} {...defaultButtonProps} width="150px">
                            {t('common.try-again')}
                        </Button>
                    </FlexDivCentered>
                )}
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 300px;
    gap: 20px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const Text = styled.span`
    font-weight: 400;
    font-size: 16px;
    line-height: 30px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Checkmark = styled.i`
    color: ${(props) => props.theme.success.textColor.primary};
    line-height: 30px;
    padding: 0 5px;
`;

const FailureMark = styled.i`
    color: ${(props) => props.theme.error.textColor.primary};
    line-height: 30px;
    padding: 0 5px;
`;

const LoaderContainer = styled(FlexDivColumn)`
    position: relative;
    max-width: 30px;
    max-height: 30px;
`;

export default BuyStepsModal;

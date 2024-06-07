import Button from 'components/Button';
import Modal from 'components/Modal';
import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import { BigNumber, ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { bigNumberFormatter, coinParser } from 'thales-utils';
import { getCollateral } from 'utils/collaterals';

type ApprovalModalProps = {
    defaultAmount: number | string;
    collateralIndex?: number;
    tokenSymbol: string;
    isAllowing: boolean;
    onSubmit: (approveAmount: BigNumber) => void;
    onClose: () => void;
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({
    defaultAmount,
    collateralIndex,
    tokenSymbol,
    isAllowing,
    onSubmit,
    onClose,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [amount, setAmount] = useState<number | string>(defaultAmount);
    const [approveAll, setApproveAll] = useState<boolean>(true);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);

    const maxApproveAmount = bigNumberFormatter(ethers.constants.MaxUint256);
    const isAmountEntered = Number(amount) > 0;
    const isButtonDisabled = !isWalletConnected || isAllowing || (!approveAll && (!isAmountEntered || !isAmountValid));

    const amountConverted = coinParser(
        Number(amount).toString(),
        networkId,
        getCollateral(networkId, collateralIndex || 0)
    );

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <Button
                    onClick={() =>
                        dispatch(
                            setWalletConnectModalVisibility({
                                visibility: true,
                            })
                        )
                    }
                >
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (!approveAll && !isAmountEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-amount`)}</Button>;
        }
        return (
            <Button
                disabled={isButtonDisabled}
                onClick={() => onSubmit(approveAll ? ethers.constants.MaxUint256 : amountConverted)}
            >
                {!isAllowing
                    ? t('common.enable-wallet-access.approve-label', { currencyKey: tokenSymbol })
                    : t('common.enable-wallet-access.approve-progress-label', {
                          currencyKey: tokenSymbol,
                      })}
            </Button>
        );
    };

    useEffect(() => {
        setIsAmountValid(Number(amount) === 0 || (Number(amount) > 0 && Number(amount) <= maxApproveAmount));
    }, [amount, maxApproveAmount]);

    return (
        <Modal
            title={t('common.enable-wallet-access.approve-label', { currencyKey: tokenSymbol })}
            onClose={onClose}
            shouldCloseOnOverlayClick={false}
            customStyle={{ overlay: { zIndex: 2000 } }}
        >
            <Container>
                <CheckboxContainer>
                    <Checkbox
                        disabled={isAllowing}
                        checked={approveAll}
                        value={approveAll.toString()}
                        onChange={(e: any) => setApproveAll(e.target.checked || false)}
                        label={t('common.enable-wallet-access.approve-all-label')}
                    />
                </CheckboxContainer>
                <OrText>{t('common.or')}</OrText>
                <NumericInput
                    value={amount}
                    onChange={(_, value) => setAmount(value)}
                    disabled={approveAll || isAllowing}
                    label={t('common.enable-wallet-access.custom-amount-label')}
                    currencyLabel={tokenSymbol}
                    showValidation={!approveAll && !isAmountValid}
                    validationMessage={t('common.errors.invalid-amount-max', { max: maxApproveAmount })}
                />
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 350px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 30px 0 10px 0;
`;

const CheckboxContainer = styled(FlexDivCentered)`
    margin: 30px 0 5px 0;
`;

const OrText = styled(FlexDivCentered)`
    font-style: normal;
    font-size: 17px;
    line-height: 100%;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 10px;
    margin-bottom: 15px;
`;

export default ApprovalModal;

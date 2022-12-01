import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { getIsAppReady } from 'redux/modules/app';
import { PAYMENT_CURRENCY } from 'constants/currency';
import { BigNumber, ethers } from 'ethers';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { toast } from 'react-toastify';
import { MAX_GAS_LIMIT } from 'constants/network';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ApprovalModal from 'components/ApprovalModal';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import SelectInput from 'components/SelectInput';
import Checkbox from 'components/fields/Checkbox';
import { getAddress, isAddress } from 'ethers/lib/utils';
import { LINKS } from 'constants/links';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Tooltip, withStyles } from '@material-ui/core';

type MintVoucherModalProps = {
    onClose: () => void;
};

const VOUCHER_OPTIONS: Array<{ value: number; label: string }> = [
    { value: 20, label: '20 sUSD' },
    { value: 50, label: '50 sUSD' },
    { value: 100, label: '100 sUSD' },
    { value: 200, label: '200 sUSD' },
    { value: 500, label: '500 sUSD' },
    { value: 1000, label: '1000 sUSD' },
];

export const MintVoucherModal: React.FC<MintVoucherModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');

    const { openConnectModal } = useConnectModal();

    const [amount, setAmount] = useState<number>(-1);
    const [isAnotherWallet, setIsAnotherWallet] = useState<boolean>(false);
    const [recipient, setRecipient] = useState<string>('');

    const isAmountEntered = Number(amount) > 0;
    const insufficientBalance = Number(paymentTokenBalance) < Number(amount) || Number(paymentTokenBalance) === 0;
    const isRecipientEntered =
        (recipient !== undefined && recipient.trim() !== '' && isAnotherWallet) || !isAnotherWallet;
    const isRecipientValid =
        ((!isWalletConnected || recipient === undefined || recipient.trim() === '' || isAddress(recipient)) &&
            isAnotherWallet) ||
        !isAnotherWallet;

    const isButtonDisabled =
        !isWalletConnected ||
        !isAmountEntered ||
        insufficientBalance ||
        isSubmitting ||
        !isRecipientEntered ||
        !isRecipientValid;

    const paymentTokenBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    useEffect(() => {
        const { signer, sUSDContract, overtimeVoucherContract } = networkConnector;
        if (signer && sUSDContract && overtimeVoucherContract) {
            const addressToApprove = overtimeVoucherContract.address;
            const sUSDContractWithSigner = sUSDContract.connect(signer);
            const getAllowance = async () => {
                try {
                    const parsedAmount = ethers.utils.parseEther(Number(amount).toString());
                    const allowance = await checkAllowance(
                        parsedAmount,
                        sUSDContractWithSigner,
                        walletAddress,
                        addressToApprove
                    );
                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected) {
                getAllowance();
            }
        }
    }, [walletAddress, isWalletConnected, hasAllowance, amount, isAllowing]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer, sUSDContract, overtimeVoucherContract } = networkConnector;
        if (signer && sUSDContract && overtimeVoucherContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsAllowing(true);

            try {
                const addressToApprove = overtimeVoucherContract.address;
                const sUSDContractWithSigner = sUSDContract.connect(signer);

                const tx = (await sUSDContractWithSigner.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('market.toast-message.approve-success', { token: PAYMENT_CURRENCY }))
                    );
                    setIsAllowing(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsAllowing(false);
            }
        }
    };

    const handleSubmit = async () => {
        const { overtimeVoucherContract, signer } = networkConnector;
        if (overtimeVoucherContract && signer) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);
                const parsedAmount = ethers.utils.parseEther(Number(amount).toString());

                const tx = await overtimeVoucherContractWithSigner.mint(
                    isAnotherWallet ? getAddress(recipient) : getAddress(walletAddress),
                    parsedAmount,
                    {
                        gasLimit: MAX_GAS_LIMIT,
                    }
                );
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('common.voucher.modal.button.confirmation-message')));
                    setAmount(-1);
                    setIsAnotherWallet(false);
                    setRecipient('');
                    setIsSubmitting(false);
                    onClose();
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <ModalButton onClick={() => openConnectModal?.()}>{t('common.wallet.connect-your-wallet')}</ModalButton>
            );
        }
        if (insufficientBalance) {
            return <ModalButton disabled={true}>{t(`common.errors.insufficient-balance`)}</ModalButton>;
        }
        if (!isAmountEntered) {
            return <ModalButton disabled={true}>{t(`common.errors.enter-amount`)}</ModalButton>;
        }
        if (!isRecipientValid) {
            return <ModalButton disabled={true}>{t(`common.errors.invalid-address`)}</ModalButton>;
        }
        if (!isRecipientEntered) {
            return <ModalButton disabled={true}>{t(`common.errors.enter-address`)}</ModalButton>;
        }
        if (!hasAllowance) {
            return (
                <ModalButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: PAYMENT_CURRENCY })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: PAYMENT_CURRENCY,
                          })}
                </ModalButton>
            );
        }
        return (
            <ModalButton disabled={isButtonDisabled} onClick={handleSubmit}>
                {!isSubmitting
                    ? t('common.voucher.modal.button.mint-label')
                    : t('common.voucher.modal.button.mint-progress-label')}
            </ModalButton>
        );
    };

    return (
        <Modal
            title={t('common.voucher.modal.title', { currencyKey: PAYMENT_CURRENCY })}
            onClose={onClose}
            shouldCloseOnOverlayClick={false}
        >
            <Container>
                <Description>
                    <Trans
                        i18nKey="common.voucher.modal.description"
                        components={{
                            p: <p />,
                            tip: <DescriptionLink href={LINKS.TIP76} key="tip" />,
                        }}
                    />
                </Description>
                <InputContainer>
                    <InputLabel>{t('common.voucher.modal.voucher-amount-label')}:</InputLabel>
                    <SelectContainer>
                        <SelectInput
                            options={VOUCHER_OPTIONS}
                            handleChange={(value) => setAmount(Number(value))}
                            defaultValue={amount}
                            width={200}
                            isDisabled={isAllowing || isSubmitting}
                        />
                    </SelectContainer>
                </InputContainer>
                <CheckboxContainer isAnotherWallet={isAnotherWallet}>
                    <Checkbox
                        disabled={isAllowing || isSubmitting}
                        checked={isAnotherWallet}
                        value={isAnotherWallet.toString()}
                        onChange={(e: any) => setIsAnotherWallet(e.target.checked || false)}
                        label={t('common.voucher.modal.another-wallet-label')}
                    />
                </CheckboxContainer>
                {isAnotherWallet && (
                    <InputContainer>
                        <InputLabel>{t('common.voucher.modal.recipient-wallet-label')}:</InputLabel>
                        <ValidationTooltip
                            open={!isRecipientValid}
                            title={t('common.errors.invalid-address') as string}
                            placement={'top'}
                            arrow={true}
                        >
                            <Input
                                type="text"
                                disabled={isAllowing || isSubmitting}
                                placeholder={t('common.voucher.modal.recipient-wallet-placeholder')}
                                value={recipient}
                                onChange={(event) => {
                                    setRecipient(event.target.value);
                                }}
                            />
                        </ValidationTooltip>
                    </InputContainer>
                )}
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    tokenSymbol={PAYMENT_CURRENCY}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 400px;
    margin-top: 50px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const Description = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 15px;
    color: ${(props) => props.theme.textColor.primary};
    p {
        margin-bottom: 10px;
    }
    a {
        cursor: pointer;
        color: #91bced;
        &:hover {
            color: #00f9ff;
        }
    }
`;

const TextLink = styled.a`
    color: #91bced;
    &:hover {
        color: #00f9ff;
    }
`;

const DescriptionLink: React.FC<{ href: string }> = ({ children, href }) => {
    return (
        <TextLink target="_blank" rel="noreferrer" href={href}>
            {children}
        </TextLink>
    );
};

const SelectContainer = styled.div`
    width: 200px;
`;

const InputContainer = styled(FlexDivColumnCentered)`
    margin-top: 5px;
    margin-bottom: 20px;
`;

const CheckboxContainer = styled(InputContainer)<{ isAnotherWallet: boolean }>`
    margin-top: 25px;
    margin-bottom: ${(props) => (props.isAnotherWallet ? '10px' : '30px')};
    margin-left: 2px;
`;

const InputLabel = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    margin-bottom: 6px;
    margin-left: 1px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Input = styled.input`
    background: ${(props) => props.theme.input.background.primary};
    border-radius: 5px;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    color: ${(props) => props.theme.input.textColor.primary};
    width: 100%;
    height: 34px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 15px;
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
    &:focus {
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const ValidationTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        width: '400px',
        maxWidth: '400px',
        marginBottom: '7px',
        backgroundColor: '#303656',
        color: '#E26A78',
        border: '1.5px solid #E26A78',
        borderRadius: '2px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    arrow: {
        '&:before': {
            border: '1.5px solid #E26A78',
            backgroundColor: '#303656',
            boxSizing: 'border-box',
        },
        width: '13px',
        height: '10px',
        bottom: '-2px !important',
    },
}))(Tooltip);

const ButtonContainer = styled(FlexDivCentered)``;

const ModalButton = styled(Button)``;

export default MintVoucherModal;

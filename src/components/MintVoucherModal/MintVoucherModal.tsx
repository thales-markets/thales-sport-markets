import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { getIsAppReady } from 'redux/modules/app';
import { BigNumber, ethers } from 'ethers';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ApprovalModal from 'components/ApprovalModal';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import SelectInput from 'components/SelectInput';
import Checkbox from 'components/fields/Checkbox';
import { getAddress, isAddress } from 'ethers/lib/utils';
import { LINKS } from 'constants/links';
import { refetchBalances } from 'utils/queryConnector';
import TextInput from '../fields/TextInput/TextInput';
import { coinParser } from 'thales-utils';
import { getDefaultCollateral } from 'utils/collaterals';
import { SupportedNetwork } from 'types/network';

type MintVoucherModalProps = {
    onClose: () => void;
};

const getVoucherOptions = (networkId: SupportedNetwork): Array<{ value: number; label: string }> => {
    const collateral = getDefaultCollateral(networkId);
    return [
        { value: 5, label: `5 ${collateral}` },
        { value: 10, label: `10 ${collateral}` },
        { value: 20, label: `20 ${collateral}` },
        { value: 50, label: `50 ${collateral}` },
        { value: 100, label: `100 ${collateral}` },
        { value: 200, label: `200 ${collateral}` },
        { value: 500, label: `500 ${collateral}` },
        { value: 1000, label: `1000 ${collateral}` },
    ];
};

const MintVoucherModal: React.FC<MintVoucherModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');

    const [amount, setAmount] = useState<number>(-1);
    const [isAnotherWallet, setIsAnotherWallet] = useState<boolean>(false);
    const [recipient, setRecipient] = useState<string>('');

    const VOUCHER_OPTIONS = getVoucherOptions(networkId);

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
                    const parsedAmount = coinParser(Number(amount).toString(), networkId);
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
    }, [walletAddress, isWalletConnected, hasAllowance, amount, isAllowing, networkId]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer, sUSDContract, overtimeVoucherContract } = networkConnector;
        if (signer && sUSDContract && overtimeVoucherContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsAllowing(true);

            try {
                const addressToApprove = overtimeVoucherContract.address;
                const sUSDContractWithSigner = sUSDContract.connect(signer);

                const tx = (await sUSDContractWithSigner.approve(
                    addressToApprove,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(
                            t('market.toast-message.approve-success', {
                                token: getDefaultCollateral(networkId),
                            })
                        )
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
                const parsedAmount = coinParser(Number(amount).toString(), networkId);

                const tx = await overtimeVoucherContractWithSigner.mint(
                    isAnotherWallet ? getAddress(recipient) : getAddress(walletAddress),
                    parsedAmount
                );
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('common.voucher.modal.button.confirmation-message')));
                    setAmount(-1);
                    setIsAnotherWallet(false);
                    setRecipient('');
                    setIsSubmitting(false);
                    setTimeout(() => {
                        refetchBalances(walletAddress, networkId);
                    }, 2000);
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
        if (insufficientBalance) {
            return <Button disabled={true}>{t(`common.errors.insufficient-balance`)}</Button>;
        }
        if (!isAmountEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-amount`)}</Button>;
        }
        if (!isRecipientValid) {
            return <Button disabled={true}>{t(`common.errors.invalid-address`)}</Button>;
        }
        if (!isRecipientEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-address`)}</Button>;
        }
        if (!hasAllowance) {
            return (
                <Button disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', {
                              currencyKey: getDefaultCollateral(networkId),
                          })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: getDefaultCollateral(networkId),
                          })}
                </Button>
            );
        }
        return (
            <Button disabled={isButtonDisabled} onClick={handleSubmit}>
                {!isSubmitting
                    ? t('common.voucher.modal.button.mint-label')
                    : t('common.voucher.modal.button.mint-progress-label')}
            </Button>
        );
    };

    return (
        <Modal
            title={t('common.voucher.modal.title', { currencyKey: getDefaultCollateral(networkId) })}
            onClose={onClose}
            shouldCloseOnOverlayClick={false}
            customStyle={{ overlay: { zIndex: 200 } }}
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
                            defaultValue={VOUCHER_OPTIONS.findIndex((item) => item.value === amount)}
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
                        <TextInput
                            label={t('common.voucher.modal.recipient-wallet-label')}
                            disabled={isAllowing || isSubmitting}
                            placeholder={t('common.voucher.modal.recipient-wallet-placeholder')}
                            value={recipient}
                            onChange={(event: any) => {
                                setRecipient(event.target.value);
                            }}
                            showValidation={!isRecipientValid}
                            validationMessage={t('common.errors.invalid-address')}
                        />
                    </InputContainer>
                )}
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    tokenSymbol={getDefaultCollateral(networkId)}
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
        color: ${(props) => props.theme.link.textColor.primary};
        :hover {
            text-decoration: underline;
        }
    }
`;

const DescriptionLink: React.FC<{ href: string }> = ({ children, href }) => {
    return (
        <a target="_blank" rel="noreferrer" href={href}>
            {children}
        </a>
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

const ButtonContainer = styled(FlexDivCentered)``;

export default MintVoucherModal;

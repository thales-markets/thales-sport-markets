import { Chip } from '@material-ui/core';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import Modal from 'components/Modal';
import Checkbox from 'components/fields/Checkbox/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import TextArea from 'components/fields/TextArea';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { BigNumber, ethers } from 'ethers';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { coinParser, formatCurrencyWithKey } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getCollateral, getCollateralAddress, getCollateralIndex, getFreeBetCollaterals } from 'utils/collaterals';
import freeBetHolder from 'utils/contracts/freeBetHolder';
import { checkAllowance, getDefaultCollateralIndexForNetworkId } from 'utils/network';
import networkConnector from 'utils/networkConnector';

type FreeBetFundModalProps = {
    onClose: () => void;
};

const FreeBetFundModal: React.FC<FreeBetFundModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [amount, setAmount] = useState<number | string>('');
    const [validationMessage, setValidationMessage] = useState<string>('');
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [collateralIndex, setCollateralIndex] = useState<number>(getDefaultCollateralIndexForNetworkId(networkId));
    const [fundWalletAddress, setFundWalletAddress] = useState<string>('');
    const [fundWalletValidationMessage, setFundWalletValidationMessage] = useState<string>('');
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);

    const [isFundBatch, setIsFundBatch] = useState<boolean>(false);
    const [fundBatchRaw, setFundBatchRaw] = useState<string>('');
    const [validationForTextArea, setValidationForTextArea] = useState<string>('');

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const walletAddressInputRef = useRef<HTMLDivElement>(null);
    const walletAddressInputRefVisible = !!walletAddressInputRef?.current?.getBoundingClientRect().width;

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const multipleCollateralBalances = useMemo(() => {
        return multipleCollateralBalancesQuery?.data && multipleCollateralBalancesQuery?.isSuccess
            ? multipleCollateralBalancesQuery.data
            : [];
    }, [multipleCollateralBalancesQuery.data, multipleCollateralBalancesQuery?.isSuccess]);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const selectedCollateral = useMemo(() => getCollateral(networkId, collateralIndex), [networkId, collateralIndex]);
    const selectedCollateralBalance = useMemo(() => {
        if (multipleCollateralBalances) {
            return multipleCollateralBalances[selectedCollateral];
        }
        return 0;
    }, [multipleCollateralBalances, selectedCollateral]);

    const isButtonDisabled = useMemo(() => {
        return (
            inProgress ||
            isAllowing ||
            !amount ||
            (!isFundBatch && (!fundWalletAddress || !!fundWalletValidationMessage)) ||
            (isFundBatch && (!fundBatchRaw || !!validationForTextArea)) ||
            !!validationMessage
        );
    }, [
        amount,
        fundBatchRaw,
        fundWalletAddress,
        fundWalletValidationMessage,
        inProgress,
        isAllowing,
        isFundBatch,
        validationForTextArea,
        validationMessage,
    ]);

    useEffect(() => {
        if (fundWalletAddress && !ethers.utils.isAddress(fundWalletAddress))
            return setFundWalletValidationMessage(t('profile.free-bet-modal.invalid-wallet-address'));
        return setFundWalletValidationMessage('');
    }, [fundWalletAddress, t]);

    useEffect(() => {
        if (amount && Number(amount) > selectedCollateralBalance)
            return setValidationMessage(t('profile.free-bet-modal.no-funds'));
        return setValidationMessage('');
    }, [amount, selectedCollateralBalance, t]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer, multipleCollateral } = networkConnector;
        const freeBetHolderContractAddress = freeBetHolder && freeBetHolder?.addresses[networkId];

        if (signer && multipleCollateral && freeBetHolderContractAddress) {
            const collateralContractWithSigner = multipleCollateral[selectedCollateral]?.connect(signer);
            const id = toast.loading(t('profile.free-bet-modal.transaction-pending'));
            setIsAllowing(true);

            try {
                const tx = (await collateralContractWithSigner?.approve(
                    freeBetHolderContractAddress,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(
                            t('profile.free-bet-modal.approve-success', { token: selectedCollateral })
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

        if (Number(amount) > selectedCollateralBalance) {
            return <Button disabled={true}>{t('profile.free-bet-modal.insufficient-balance')}</Button>;
        }

        if (isFundBatch && Number(amount) * bulkWalletAddresses.length > selectedCollateralBalance) {
            return <Button disabled={true}>{t('profile.free-bet-modal.insufficient-balance')}</Button>;
        }

        if (!hasAllowance) {
            return (
                <Button onClick={() => setOpenApprovalModal(true)}>
                    {t('common.enable-wallet-access.approve-label', { currencyKey: selectedCollateral })}
                </Button>
            );
        }

        if (isAllowing) {
            return (
                <Button disabled={true}>
                    {t('common.enable-wallet-access.approve-progress-label', {
                        currencyKey: selectedCollateral,
                    })}
                </Button>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={() => handleSubmit()}>
                {inProgress ? t('profile.free-bet-modal.funding') : t('profile.free-bet-modal.fund')}
            </Button>
        );
    };

    const handleSubmit = async () => {
        const { signer, multipleCollateral, freeBetHolderContract } = networkConnector;

        if (signer && multipleCollateral && freeBetHolderContract && (fundWalletAddress || bulkWalletAddresses)) {
            const collateralAddress = getCollateralAddress(
                networkId,
                getCollateralIndex(networkId, selectedCollateral)
            );
            const freeBetHolderContractWithSigner = freeBetHolderContract?.connect(signer);
            const id = toast.loading(t('profile.free-bet-modal.transaction-pending'));
            setInProgress(true);

            const amountFormatted = coinParser(amount.toString(), networkId, selectedCollateral);

            try {
                const tx = isFundBatch
                    ? ((await freeBetHolderContractWithSigner?.fundBatch(
                          bulkWalletAddresses,
                          collateralAddress,
                          amountFormatted
                      )) as ethers.ContractTransaction)
                    : ((await freeBetHolderContractWithSigner?.fund(
                          fundWalletAddress,
                          collateralAddress,
                          amountFormatted
                      )) as ethers.ContractTransaction);
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                console.log('txResult ', txResult);

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(
                            t('profile.free-bet-modal.fund-successful', { token: selectedCollateral })
                        )
                    );
                    setInProgress(false);
                    onClose();
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setInProgress(false);
            }
        }
    };

    const handleAddressDelete = (walletAddress: string) => {
        if (fundBatchRaw.includes(',')) {
            setFundBatchRaw(fundBatchRaw.replace(`${walletAddress},`, ''));
        } else {
            setFundBatchRaw(fundBatchRaw.replace(`${walletAddress}\n`, ''));
        }
    };

    const bulkWalletAddresses = useMemo(() => {
        if (fundBatchRaw) {
            const splitByNewLine = fundBatchRaw.includes(',') ? fundBatchRaw.split(',') : fundBatchRaw.split(/\r?\n/);
            if (splitByNewLine.find((item) => !ethers.utils.isAddress(item.trim()))) {
                setValidationForTextArea(t('profile.free-bet-modal.one-or-more-address-invalid'));
            } else {
                setValidationForTextArea('');
            }
            return splitByNewLine
                .filter((item) => item.trim() !== '' && ethers.utils.isAddress(item.trim()))
                .map((item) => item.trim());
        }
        return [];
    }, [fundBatchRaw, t]);

    useEffect(() => {
        const { signer, multipleCollateral } = networkConnector;

        const freeBetHolderContractAddress = freeBetHolder && freeBetHolder?.addresses[networkId];

        if (signer && multipleCollateral && freeBetHolderContractAddress) {
            const collateralContractWithSigner = multipleCollateral[selectedCollateral]?.connect(signer);

            const getAllowance = async () => {
                const amountForCheck = isFundBatch ? Number(amount) * bulkWalletAddresses.length : Number(amount);

                try {
                    const parsedAmount = coinParser(Number(amountForCheck).toString(), networkId, selectedCollateral);
                    const allowance = await checkAllowance(
                        parsedAmount,
                        collateralContractWithSigner,
                        walletAddress,
                        freeBetHolderContractAddress
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
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        amount,
        isAllowing,
        networkId,
        selectedCollateral,
        isFundBatch,
        bulkWalletAddresses.length,
    ]);

    return (
        <Modal
            title={t('profile.free-bet-modal.title')}
            onClose={() => onClose()}
            shouldCloseOnOverlayClick={false}
            customStyle={{ overlay: { zIndex: 2000 }, content: { minHeight: '500px', width: isMobile ? '90%' : '' } }}
        >
            <Container>
                <CheckboxWrapper>
                    <Label>{t('profile.free-bet-modal.fund-batch')}</Label>
                    <CheckboxContainer>
                        <Checkbox
                            disabled={false}
                            checked={isFundBatch}
                            value={isFundBatch.toString()}
                            onChange={(e: any) => {
                                setIsFundBatch(e.target.checked || false);
                            }}
                        />
                    </CheckboxContainer>
                </CheckboxWrapper>
                <InputContainer ref={inputRef}>
                    <NumericInput
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                        }}
                        label={
                            isFundBatch
                                ? t('profile.free-bet-modal.enter-amount-per-user')
                                : t('profile.free-bet-modal.enter-amount')
                        }
                        showValidation={inputRefVisible && validationMessage !== ''}
                        validationMessage={validationMessage}
                        inputFontWeight="400"
                        inputFontSize="12px"
                        inputPadding="5px 10px"
                        margin="20px 0px 0px 0px"
                        borderColor={theme.input.borderColor.tertiary}
                        disabled={inProgress}
                        placeholder={t('profile.free-bet-modal.enter-amount')}
                        currencyComponent={
                            <CollateralSelector
                                collateralArray={getFreeBetCollaterals(networkId)}
                                selectedItem={collateralIndex}
                                onChangeCollateral={(index) => {
                                    setAmount('');
                                    setCollateralIndex(index);
                                }}
                                collateralBalances={multipleCollateralBalances}
                                exchangeRates={exchangeRates}
                                isDetailedView
                                dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                            />
                        }
                        balance={formatCurrencyWithKey(selectedCollateral, selectedCollateralBalance)}
                        onMaxButton={() => setAmount(selectedCollateralBalance)}
                        validationTooltipZIndex={2004}
                    />
                </InputContainer>
                {isFundBatch && Number(amount) > 0 && bulkWalletAddresses.length > 0 && (
                    <Notice>
                        {t('profile.free-bet-modal.total-amount-batch', {
                            count: bulkWalletAddresses.length,
                            amount: formatCurrencyWithKey(selectedCollateral, amount),
                        })}
                    </Notice>
                )}
                {isFundBatch ? (
                    <InputContainer ref={walletAddressInputRef}>
                        <TextArea
                            label={
                                isFundBatch
                                    ? t('profile.free-bet-modal.enter-wallet-addresses')
                                    : t('profile.free-bet-modal.enter-wallet-address')
                            }
                            value={fundBatchRaw}
                            inputFontSize="12px"
                            height="150px"
                            validationMessage={validationForTextArea}
                            showValidation={!!validationForTextArea && walletAddressInputRefVisible}
                            onChange={(e) => setFundBatchRaw(e.target.value)}
                            borderColor={theme.input.borderColor.tertiary}
                            margin="10px 0px 10px 0px"
                            placeholder={t('profile.free-bet-modal.enter-wallet-address')}
                        />
                    </InputContainer>
                ) : (
                    <InputContainer ref={walletAddressInputRef}>
                        <NumericInput
                            label={
                                isFundBatch
                                    ? t('profile.free-bet-modal.enter-wallet-addresses')
                                    : t('profile.free-bet-modal.enter-wallet-address')
                            }
                            value={fundWalletAddress}
                            validationMessage={fundWalletValidationMessage}
                            showValidation={!!fundWalletValidationMessage && walletAddressInputRefVisible}
                            inputType="text"
                            onChange={(e) => setFundWalletAddress(e.target.value)}
                            borderColor={theme.input.borderColor.tertiary}
                            inputFontWeight="400"
                            inputFontSize="12px"
                            inputPadding="5px 10px"
                            margin="10px 0px 10px 0px"
                            placeholder={t('profile.free-bet-modal.enter-wallet-address')}
                            validationTooltipZIndex={2004}
                        />
                    </InputContainer>
                )}
                {isFundBatch && bulkWalletAddresses.length > 0 && (
                    <WalletAddressesWrapper>
                        {bulkWalletAddresses.map((item, index) => {
                            return (
                                <Chip
                                    key={index}
                                    label={`${item.slice(0, 7)}...`}
                                    onDelete={() => handleAddressDelete(item)}
                                />
                            );
                        })}
                    </WalletAddressesWrapper>
                )}
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    collateralIndex={collateralIndex}
                    tokenSymbol={selectedCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
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

const InputContainer = styled(FlexDiv)`
    width: 100%;
`;

const CheckboxWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: space-between;
`;

const Label = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 950px) {
        line-height: 24px;
    }
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

const WalletAddressesWrapper = styled(FlexDivRow)`
    flex-wrap: wrap;
    max-height: 200px;
    min-height: 80px;
    overflow-y: auto;
    justify-content: flex-start;
`;

const CheckboxContainer = styled.div`
    margin-left: auto;
    margin-top: 4px;
    label {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 12px;
        line-height: 13px;
        font-weight: 600;
        letter-spacing: 0.035em;
        text-transform: uppercase;
        padding-top: 18px;
        padding-left: 18px;
        input:checked ~ .checkmark {
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        }
    }
    .checkmark {
        height: 15px;
        width: 15px;
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        :after {
            left: 3px;
            width: 3px;
            height: 8px;
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
            border-width: 0 2px 2px 0;
        }
    }
`;

const Notice = styled.span`
    margin-top: 3px;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 11px;
`;

export default FreeBetFundModal;

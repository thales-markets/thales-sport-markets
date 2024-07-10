import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import Modal from 'components/Modal';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { BigNumber, ethers } from 'ethers';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
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

    const [amount, setAmount] = useState<number | string>('');
    const [validationMessage, setValidationMessage] = useState<string>('');
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [collateralIndex, setCollateralIndex] = useState<number>(getDefaultCollateralIndexForNetworkId(networkId));
    const [fundWalletAddress, setFundWalletAddress] = useState<string>('');
    const [fundWalletValidationMessage, setFundWalletValidationMessage] = useState<string>('');
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

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
            !fundWalletAddress ||
            !!validationMessage ||
            !!fundWalletValidationMessage
        );
    }, [amount, fundWalletAddress, fundWalletValidationMessage, inProgress, isAllowing, validationMessage]);

    useEffect(() => {
        const { signer, multipleCollateral } = networkConnector;

        const freeBetHolderContractAddress = freeBetHolder && freeBetHolder?.addresses[networkId];

        if (signer && multipleCollateral && freeBetHolderContractAddress) {
            const collateralContractWithSigner = multipleCollateral[selectedCollateral]?.connect(signer);

            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(Number(amount).toString(), networkId, selectedCollateral);
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
    }, [walletAddress, isWalletConnected, hasAllowance, amount, isAllowing, networkId, selectedCollateral]);

    useEffect(() => {
        if (!fundWalletAddress || !ethers.utils.isAddress(fundWalletAddress)) {
            setFundWalletValidationMessage(t('profile.free-bet-modal.invalid-wallet-address'));
        } else {
            setFundWalletValidationMessage('');
        }
    }, [fundWalletAddress, t]);

    useEffect(() => {
        if (Number(amount) > selectedCollateralBalance)
            return setValidationMessage(t('profile.free-bet-modal.invalid-amount'));
        if (!amount) return setValidationMessage(t('profile.free-bet-modal.invalid-amount'));
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

        if (signer && multipleCollateral && freeBetHolderContract && fundWalletAddress) {
            const collateralAddress = getCollateralAddress(
                networkId,
                getCollateralIndex(networkId, selectedCollateral)
            );
            const freeBetHolderContractWithSigner = freeBetHolderContract?.connect(signer);
            const id = toast.loading(t('profile.free-bet-modal.transaction-pending'));
            setInProgress(true);

            const amountFormatted = coinParser(amount.toString(), networkId, selectedCollateral);

            try {
                const tx = (await freeBetHolderContractWithSigner?.fund(
                    fundWalletAddress,
                    collateralAddress,
                    amountFormatted
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

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

    return (
        <Modal
            title={t('profile.free-bet-modal.title')}
            onClose={() => onClose()}
            shouldCloseOnOverlayClick={false}
            customStyle={{ overlay: { zIndex: 2000 }, content: { height: '500px' } }}
        >
            <Container>
                <InputContainer ref={inputRef}>
                    <NumericInput
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                        }}
                        showValidation={inputRefVisible && !!validationMessage}
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
                    />
                </InputContainer>
                <InputContainer>
                    <NumericInput
                        value={fundWalletAddress}
                        validationMessage={fundWalletValidationMessage}
                        showValidation={!!fundWalletValidationMessage}
                        inputType="text"
                        onChange={(e) => setFundWalletAddress(e.target.value)}
                        borderColor={theme.input.borderColor.tertiary}
                        inputFontWeight="400"
                        inputFontSize="12px"
                        inputPadding="5px 10px"
                        margin="20px 0px 20px 0px"
                        placeholder={t('profile.free-bet-modal.enter-wallet-address')}
                    />
                </InputContainer>

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

export default FreeBetFundModal;

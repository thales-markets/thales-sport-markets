import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { LINKS } from 'constants/links';
import { ContractType } from 'enums/contract';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import { useTheme } from 'styled-components';
import { Coins, formatCurrencyWithKey, truncToDecimals } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getCollateralIndex } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { checkAllowance } from 'utils/network';
import { Client, parseEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import {
    ButtonContainer,
    CloseIcon,
    Container,
    defaultButtonProps,
    defaultCustomStyles,
    Description,
    InputContainer,
    Summary,
    SummaryLabel,
    SummaryValue,
    TipLink,
    Title,
} from './styled-components';

type ThalesToOverMigrationModalProps = {
    onClose: () => void;
};

const ThalesToOverMigrationModal: React.FC<ThalesToOverMigrationModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const { openConnectModal } = useConnectModal();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();
    const walletAddress = address || '';

    const [amount, setAmount] = useState<number | string>('');
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [isMigrating, setIsMigrating] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const multiCollateralBalances =
        multipleCollateralBalancesQuery?.isSuccess && multipleCollateralBalancesQuery?.data
            ? multipleCollateralBalancesQuery.data
            : undefined;

    const thalesBalance = multiCollateralBalances ? multiCollateralBalances[CRYPTO_CURRENCY_MAP.THALES as Coins] : 0;

    const isAmountEntered = Number(amount) > 0;
    const insufficientBalance = Number(amount) > thalesBalance || !thalesBalance;
    const isButtonDisabled = isMigrating || !isAmountEntered || insufficientBalance || !isConnected || !hasAllowance;

    useEffect(() => {
        setIsAmountValid(Number(amount) === 0 || (Number(amount) > 0 && Number(amount) <= thalesBalance));
    }, [amount, thalesBalance]);

    useEffect(() => {
        const [thalesToOverMigrationContract, thalesContract] = [
            getContractInstance(ContractType.THALES_TO_OVER_MIGRATION, { client, networkId }),
            getContractInstance(ContractType.THALES, { client, networkId }),
        ];

        if (thalesToOverMigrationContract && thalesContract) {
            const getAllowance = async () => {
                try {
                    const parsedStakeAmount = parseEther(Number(amount).toString());
                    const allowance = await checkAllowance(
                        parsedStakeAmount,
                        thalesContract,
                        walletAddress,
                        thalesToOverMigrationContract.address
                    );
                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isConnected && amount) {
                getAllowance();
            }
        }
    }, [walletAddress, isConnected, hasAllowance, amount, isAllowing, networkId, client]);

    const handleAllowance = async (approveAmount: bigint) => {
        const [thalesToOverMigrationContract, thalesContract] = [
            getContractInstance(ContractType.THALES_TO_OVER_MIGRATION, { client, networkId }),
            getContractInstance(ContractType.THALES, { client: walletClient.data, networkId }),
        ];

        if (thalesToOverMigrationContract && thalesContract) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));

            try {
                const txHash = await thalesContract.write.approve([
                    thalesToOverMigrationContract.address,
                    approveAmount,
                ]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });

                if (txReceipt.status === 'success') {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                    setOpenApprovalModal(false);
                    setIsAllowing(false);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const handleMigration = async () => {
        const thalesToOverMigrationContract = getContractInstance(ContractType.THALES_TO_OVER_MIGRATION, {
            client: walletClient.data,
            networkId,
        });

        console.log(thalesToOverMigrationContract);

        if (thalesToOverMigrationContract) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsMigrating(true);

                const parsedAmount = parseEther(amount.toString());
                const txHash = await thalesToOverMigrationContract?.write?.migrateThalesToOver([parsedAmount]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });
                if (txReceipt.status === 'success') {
                    toast.update(
                        toastId,
                        getSuccessToastOptions(t('profile.migration-modal.migration-confirmation-message'))
                    );
                    setAmount(0);
                    onClose();
                    setIsMigrating(false);
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsMigrating(false);
            }
        }
    };

    const getSubmitButton = () => {
        if (!isConnected) {
            return (
                <Button onClick={openConnectModal} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (insufficientBalance) {
            return (
                <Button disabled={true} {...defaultButtonProps}>
                    {t(`common.errors.insufficient-balance`)}
                </Button>
            );
        }
        if (!isAmountEntered) {
            return (
                <Button disabled={true} {...defaultButtonProps}>
                    {t(`common.errors.enter-amount`)}
                </Button>
            );
        }
        if (!hasAllowance) {
            return (
                <Button disabled={isAllowing} onClick={() => setOpenApprovalModal(true)} {...defaultButtonProps}>
                    {t('common.wallet.approve')}
                </Button>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleMigration} {...defaultButtonProps}>
                {!isMigrating
                    ? `${t('profile.migration-modal.button.migrate-label')} ${formatCurrencyWithKey(
                          CRYPTO_CURRENCY_MAP.THALES,
                          amount
                      )}    `
                    : `${t('profile.migration-modal.button.migrate-progress-label')} ${formatCurrencyWithKey(
                          CRYPTO_CURRENCY_MAP.THALES,
                          amount
                      )}...`}
            </Button>
        );
    };

    const onMaxClick = () => {
        setAmount(truncToDecimals(thalesBalance, 8));
    };

    return (
        <ReactModal
            isOpen
            onRequestClose={() => onClose()}
            shouldCloseOnOverlayClick={false}
            style={defaultCustomStyles}
        >
            <Container>
                <CloseIcon className="icon icon--close" onClick={() => onClose()} />
                <Title>{t('profile.migration-modal.title')}</Title>
                <Description>
                    <Trans
                        i18nKey={'profile.migration-modal.description'}
                        components={{
                            p: <p />,
                            tipLink: <TipLink href={LINKS.Tip238} target="_blank" rel="noreferrer" />,
                        }}
                    />
                </Description>
                <InputContainer>
                    <NumericInput
                        value={amount}
                        onChange={(_, value) => setAmount(value)}
                        disabled={isAllowing || isMigrating}
                        label={t('profile.migration-modal.amount-label')}
                        placeholder={t(`common.errors.enter-amount`)}
                        currencyLabel={CRYPTO_CURRENCY_MAP.THALES}
                        showValidation={!isAmountValid}
                        validationMessage={t('common.errors.insufficient-balance-wallet', {
                            currencyKey: CRYPTO_CURRENCY_MAP.THALES,
                        })}
                        validationPlacement="bottom"
                        balance={formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.THALES, thalesBalance)}
                        onMaxButton={onMaxClick}
                        inputFontWeight="600"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                    />
                </InputContainer>
                <Summary>
                    <SummaryLabel>{t('profile.migration-modal.over-to-receive')}:</SummaryLabel>
                    <SummaryValue>{Number(amount)}</SummaryValue>
                </Summary>
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={Number(amount)}
                    collateralIndex={getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.THALES as Coins)}
                    tokenSymbol={CRYPTO_CURRENCY_MAP.THALES}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </ReactModal>
    );
};

export default ThalesToOverMigrationModal;

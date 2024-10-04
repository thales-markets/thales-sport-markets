import { Button } from '@material-ui/core';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import NumericInput from 'components/fields/NumericInput';
import { BigNumber, ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { Coins, formatCurrencyWithKey } from 'thales-utils';
import ApprovalModal from '../../../../components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from '../../../../config/toast';
import { CRYPTO_CURRENCY_MAP } from '../../../../constants/currency';
import useMultipleCollateralBalanceQuery from '../../../../queries/wallet/useMultipleCollateralBalanceQuery';
import useUserStakingDataQuery from '../../../../queries/wallet/useUserStakingData';
import { getIsAppReady } from '../../../../redux/modules/app';
import { StakingData } from '../../../../types/markets';
import { getCollateralIndex } from '../../../../utils/collaterals';
import { checkAllowance } from '../../../../utils/network';
import networkConnector from '../../../../utils/networkConnector';
import {
    ButtonContainer,
    CloseIcon,
    CongratulationsTitle,
    Container,
    defaultCustomStyles,
    Title,
} from './styled-components';

type StakingModalProps = {
    defaultAmount: number;
    onClose: () => void;
};

const StakingModal: React.FC<StakingModalProps> = ({ defaultAmount, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { openConnectModal } = useConnectModal();

    const isAppReady = useSelector(getIsAppReady);
    const isWalletConnected = useSelector(getIsWalletConnected);
    const networkId = useSelector(getNetworkId);
    const walletAddress = useSelector(getWalletAddress) || '';
    const isParticle = useSelector(getIsConnectedViaParticle);

    const [amountToStake, setAmountToStake] = useState<number | string>(defaultAmount);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isAllowingStake, setIsAllowingStake] = useState<boolean>(false);
    const [isStaking, setIsStaking] = useState<boolean>(false);
    const [hasStakeAllowance, setStakeAllowance] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [lastValidStakingData, setLastValidStakingData] = useState<StakingData | undefined>(undefined);

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const multiCollateralBalances =
        multipleCollateralBalancesQuery?.isSuccess && multipleCollateralBalancesQuery?.data
            ? multipleCollateralBalancesQuery.data
            : undefined;

    const thalesBalance = multiCollateralBalances ? multiCollateralBalances[CRYPTO_CURRENCY_MAP.THALES as Coins] : 0;

    const userStakingDataQuery = useUserStakingDataQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (userStakingDataQuery.isSuccess && userStakingDataQuery.data) {
            setLastValidStakingData(userStakingDataQuery.data);
        }
    }, [userStakingDataQuery.isSuccess, userStakingDataQuery.data]);

    const stakingData: StakingData | undefined = useMemo(() => {
        if (userStakingDataQuery.isSuccess && userStakingDataQuery.data) {
            return userStakingDataQuery.data;
        }
        return lastValidStakingData;
    }, [userStakingDataQuery.isSuccess, userStakingDataQuery.data, lastValidStakingData]);

    const isUnstaking = stakingData && stakingData.isUnstaking;
    const isStakingPaused = stakingData && stakingData.isPaused;

    const isAmountEntered = Number(amountToStake) > 0;
    const insufficientBalance = Number(amountToStake) > thalesBalance || !thalesBalance;
    const isButtonDisabled =
        isStaking ||
        isUnstaking ||
        !isAmountEntered ||
        insufficientBalance ||
        !isWalletConnected ||
        isStakingPaused ||
        !hasStakeAllowance;

    useEffect(() => {
        setIsAmountValid(
            Number(amountToStake) === 0 || (Number(amountToStake) > 0 && Number(amountToStake) <= thalesBalance)
        );
    }, [amountToStake, thalesBalance]);

    useEffect(() => {
        const { stakingThalesContract, signer, multipleCollateral } = networkConnector;

        if (stakingThalesContract && multipleCollateral && signer) {
            const thalesTokenContractWithSigner = multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins]?.connect(
                signer
            );
            const getAllowance = async () => {
                try {
                    const parsedStakeAmount = ethers.utils.parseEther(Number(amountToStake).toString());
                    const allowance = await checkAllowance(
                        parsedStakeAmount,
                        thalesTokenContractWithSigner,
                        walletAddress,
                        stakingThalesContract.address
                    );
                    setStakeAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && amountToStake) {
                getAllowance();
            }
        }
    }, [walletAddress, isWalletConnected, hasStakeAllowance, amountToStake, isAllowingStake]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { stakingThalesContract, signer, multipleCollateral } = networkConnector;

        if (stakingThalesContract && multipleCollateral && signer) {
            setIsAllowingStake(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));

            try {
                const thalesTokenContractWithSigner = multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins]?.connect(
                    signer
                );

                const tx = (await thalesTokenContractWithSigner?.approve(
                    stakingThalesContract.address,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);

                const txResult = await tx.wait();
                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                    setIsAllowingStake(false);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowingStake(false);
            }
        }
    };

    const handleStakeThales = async () => {
        const { stakingThalesContract, signer } = networkConnector;

        if (stakingThalesContract && signer) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsStaking(true);

                const stakingThalesContractWithSigner = stakingThalesContract.connect((networkConnector as any).signer);
                const amount = ethers.utils.parseEther(amountToStake.toString());
                const tx = await stakingThalesContractWithSigner.stake(amount);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(toastId, getSuccessToastOptions(t('staking.staking.stake-unstake.stake-success')));
                    setAmountToStake('');
                    setIsStaking(false);
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsStaking(false);
            }
        }
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return <Button onClick={openConnectModal}>{t('common.wallet.connect-your-wallet')}</Button>;
        }
        if (insufficientBalance) {
            return <Button disabled={true}>{t(`common.errors.insufficient-balance`)}</Button>;
        }
        if (!isAmountEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-amount`)}</Button>;
        }
        if (!hasStakeAllowance) {
            return (
                <Button
                    disabled={isAllowingStake}
                    onClick={() =>
                        isParticle ? handleAllowance(ethers.constants.MaxUint256) : setOpenApprovalModal(true)
                    }
                >
                    {t('common.wallet.approve')}
                </Button>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleStakeThales}>
                {!isStaking
                    ? `${t('staking.staking.stake-unstake.stake')} ${formatCurrencyWithKey(
                          CRYPTO_CURRENCY_MAP.THALES,
                          amountToStake
                      )}    `
                    : `${t('staking.staking.stake-unstake.staking')} ${formatCurrencyWithKey(
                          CRYPTO_CURRENCY_MAP.THALES,
                          amountToStake
                      )}...`}
            </Button>
        );
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
                <CongratulationsTitle>Congratulations!</CongratulationsTitle>
                <Title>You claimed: 25,134.45 THALES</Title>
                <NumericInput
                    value={amountToStake}
                    onChange={(_, value) => setAmountToStake(value)}
                    disabled={isAllowingStake}
                    label={t('common.enable-wallet-access.custom-amount-label')}
                    currencyLabel={'THALES'}
                    showValidation={!isAmountValid}
                    validationMessage={t('common.errors.invalid-amount-max')}
                />
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(amountToStake)}
                    collateralIndex={getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.THALES as Coins)}
                    tokenSymbol={CRYPTO_CURRENCY_MAP.THALES}
                    isAllowing={isAllowingStake}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </ReactModal>
    );
};

export default StakingModal;

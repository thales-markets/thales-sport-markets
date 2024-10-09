import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { BigNumber, ethers } from 'ethers';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useUserStakingDataQuery from 'queries/wallet/useUserStakingData';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { Coins, formatCurrencyWithKey, truncToDecimals } from 'thales-utils';
import { StakingData } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getCollateralIndex } from 'utils/collaterals';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { STAKING_MODAL_MUTE_PERIOD_IN_MS } from '../../../../constants/ui';
import { setStakingModalMuteEnd } from '../../../../redux/modules/ui';
import { StakingMessage } from '../OpenClaimableTickets/styled-components';
import {
    ButtonContainer,
    CloseIcon,
    CongratulationsTitle,
    Container,
    defaultButtonProps,
    defaultCustomStyles,
    Description,
    InputContainer,
    StakingPageLink,
    Title,
} from './styled-components';

type StakingModalProps = {
    defaultAmount: number;
    onClose: () => void;
};

const StakingModal: React.FC<StakingModalProps> = ({ defaultAmount, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
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
    const [stakedAmount, setStakedAmount] = useState<number>(0);

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

    const noClaim = defaultAmount === 0;
    const isStaked = stakedAmount > 0;

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

                const txResult = await tx.wait();
                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                    setOpenApprovalModal(false);
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
                    toast.update(
                        toastId,
                        getSuccessToastOptions(t('profile.staking-modal.stake-confirmation-message'))
                    );
                    setStakedAmount(Number(amountToStake));
                    setAmountToStake(0);
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
        if (!hasStakeAllowance) {
            return (
                <Button
                    disabled={isAllowingStake}
                    onClick={() =>
                        isParticle ? handleAllowance(ethers.constants.MaxUint256) : setOpenApprovalModal(true)
                    }
                    {...defaultButtonProps}
                >
                    {t('common.wallet.approve')}
                </Button>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleStakeThales} {...defaultButtonProps}>
                {!isStaking
                    ? `${t('profile.staking-modal.button.stake-label')} ${formatCurrencyWithKey(
                          CRYPTO_CURRENCY_MAP.THALES,
                          amountToStake
                      )}    `
                    : `${t('profile.staking-modal.button.stake-progress-label')} ${formatCurrencyWithKey(
                          CRYPTO_CURRENCY_MAP.THALES,
                          amountToStake
                      )}...`}
            </Button>
        );
    };

    const onMaxClick = () => {
        setAmountToStake(truncToDecimals(thalesBalance, 8));
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
                {(!noClaim || isStaked) && (
                    <CongratulationsTitle>{t('profile.staking-modal.congratulations-label')}</CongratulationsTitle>
                )}
                <Title>
                    {isStaked
                        ? t('profile.staking-modal.staked', {
                              amount: `${formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.THALES, stakedAmount)}`,
                          })
                        : noClaim
                        ? t('profile.staking-modal.earn-yield')
                        : t('profile.staking-modal.claimed', {
                              amount: `${formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.THALES, defaultAmount)}`,
                          })}
                </Title>
                {!isStaked && (
                    <Description>{`${noClaim ? '' : t('profile.staking-modal.earn-yield')} ${t(
                        'profile.staking-modal.thales-on-overtime'
                    )}`}</Description>
                )}
                <Description>
                    <Trans
                        i18nKey={'profile.staking-modal.weekly-rewards'}
                        components={{
                            stakingPageLink: (
                                <StakingPageLink
                                    href={'https://www.thales.io/token/staking'}
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            ),
                        }}
                    />
                </Description>
                {isStaked && <Description>{t('profile.staking-modal.stake-more')}</Description>}
                <InputContainer>
                    <NumericInput
                        value={amountToStake}
                        onChange={(_, value) => setAmountToStake(value)}
                        disabled={isAllowingStake || isStaking || isUnstaking || isStakingPaused}
                        label={t('profile.staking-modal.amount-to-stake-label')}
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
                {(isUnstaking || isStakingPaused) && (
                    <StakingMessage>
                        {isUnstaking
                            ? t('profile.staking-modal.validation.unstaking-in-progress')
                            : isStakingPaused
                            ? t('profile.staking-modal.validation.staking-paused')
                            : t('common.errors.insufficient-balance-wallet', {
                                  currencyKey: CRYPTO_CURRENCY_MAP.THALES,
                              })}
                    </StakingMessage>
                )}
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                <Button
                    backgroundColor={theme.button.background.octonary}
                    textColor={theme.button.textColor.senary}
                    borderColor={theme.button.borderColor.senary}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={() => {
                        dispatch(setStakingModalMuteEnd(new Date().getTime() + STAKING_MODAL_MUTE_PERIOD_IN_MS));
                        onClose();
                    }}
                >
                    {t('profile.staking-modal.button.mute-label')}
                </Button>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
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

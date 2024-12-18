import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { STAKING_MODAL_MUTE_PERIOD_IN_MS } from 'constants/ui';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useUserStakingDataQuery from 'queries/wallet/useUserStakingData';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setStakingModalMuteEnd } from 'redux/modules/ui';
import { getIsBiconomy, getIsConnectedViaParticle } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { Coins, formatCurrencyWithKey, formatPercentage, truncToDecimals } from 'thales-utils';
import { StakingData } from 'types/markets';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateralIndex } from 'utils/collaterals';
import { checkAllowance } from 'utils/network';
import { Client, maxUint256, parseEther } from 'viem';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
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

// Contracts
import { ContractType } from 'enums/contract';
import { getContractInstance } from 'utils/contract';
import { waitForTransactionReceipt } from 'viem/actions';

type StakingModalProps = {
    defaultAmount: number;
    onClose: () => void;
};

const StakingModal: React.FC<StakingModalProps> = ({ defaultAmount, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const { openConnectModal } = useConnectModal();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const isParticle = useSelector(getIsConnectedViaParticle);

    const [amountToStake, setAmountToStake] = useState<number | string>(defaultAmount);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isAllowingStake, setIsAllowingStake] = useState<boolean>(false);
    const [isStaking, setIsStaking] = useState<boolean>(false);
    const [hasStakeAllowance, setStakeAllowance] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [lastValidStakingData, setLastValidStakingData] = useState<StakingData | undefined>(undefined);
    const [stakedAmount, setStakedAmount] = useState<number>(0);

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

    const userStakingDataQuery = useUserStakingDataQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

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
    const apy = stakingData ? stakingData.apy : 0;

    const isAmountEntered = Number(amountToStake) > 0;
    const insufficientBalance = Number(amountToStake) > thalesBalance || !thalesBalance;
    const isButtonDisabled =
        isStaking ||
        isUnstaking ||
        !isAmountEntered ||
        insufficientBalance ||
        !isConnected ||
        isStakingPaused ||
        !hasStakeAllowance;

    const noClaim = defaultAmount === 0;
    const isStaked = stakedAmount > 0;

    useEffect(() => {
        if (noClaim) {
            setAmountToStake(thalesBalance);
        }
    }, [noClaim, thalesBalance]);

    useEffect(() => {
        setIsAmountValid(
            Number(amountToStake) === 0 || (Number(amountToStake) > 0 && Number(amountToStake) <= thalesBalance)
        );
    }, [amountToStake, thalesBalance]);

    useEffect(() => {
        const [stakingThalesTokenContract, thalesTokenContract] = [
            getContractInstance(ContractType.STAKING_THALES, { client, networkId }),
            getContractInstance(
                ContractType.MULTICOLLATERAL,
                { client, networkId },
                getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.sTHALES as Coins)
            ),
        ];

        if (stakingThalesTokenContract && thalesTokenContract) {
            const getAllowance = async () => {
                try {
                    const parsedStakeAmount = parseEther(Number(amountToStake).toString());
                    const allowance = await checkAllowance(
                        parsedStakeAmount,
                        thalesTokenContract,
                        walletAddress,
                        stakingThalesTokenContract.address
                    );
                    setStakeAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isConnected && amountToStake) {
                getAllowance();
            }
        }
    }, [walletAddress, isConnected, hasStakeAllowance, amountToStake, isAllowingStake, networkId, client]);

    const handleAllowance = async (approveAmount: bigint) => {
        const [stakingThalesTokenContract, thalesTokenContract] = [
            getContractInstance(ContractType.STAKING_THALES, { client, networkId }),
            getContractInstance(
                ContractType.MULTICOLLATERAL,
                { client: walletClient.data, networkId },
                getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.sTHALES as Coins)
            ),
        ];

        if (stakingThalesTokenContract && thalesTokenContract) {
            setIsAllowingStake(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));

            try {
                const txHash = await thalesTokenContract.write.approve([
                    stakingThalesTokenContract.address,
                    approveAmount,
                ]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });

                if (txReceipt.status === 'success') {
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
        const stakingThalesContract = getContractInstance(ContractType.STAKING_THALES, {
            client: walletClient.data,
            networkId,
        });

        if (stakingThalesContract) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsStaking(true);

                const amount = parseEther(amountToStake.toString());
                const txHash = await stakingThalesContract?.write?.stake([amount]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });
                if (txReceipt.status === 'success') {
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
        if (!hasStakeAllowance) {
            return (
                <Button
                    disabled={isAllowingStake}
                    onClick={() => (isParticle ? handleAllowance(maxUint256) : setOpenApprovalModal(true))}
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
                <Description>{t('profile.staking-modal.rewards-apy', { apy: formatPercentage(apy) })}</Description>
                <Description>
                    <Trans
                        i18nKey={'profile.staking-modal.thales-on-overtime'}
                        components={{
                            stakingPageLink: (
                                <StakingPageLink
                                    href={'https://docs.thales.io/thales-token/staking-guide'}
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            ),
                        }}
                    />
                </Description>
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
                <Description>
                    {isStaked ? t('profile.staking-modal.stake-more') : t('profile.staking-modal.stake-now')}
                </Description>
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

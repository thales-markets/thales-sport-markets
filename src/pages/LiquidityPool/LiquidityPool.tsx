import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import {
    Container,
    Title,
    SubmitButton,
    ButtonContainer,
    ValidationTooltip,
    InputContainer,
    Wrapper,
    ToggleContainer,
    // Description,
    LiquidityPoolFilledGraphicContainer,
    LiquidityPoolFilledGraphicPercentage,
    LiquidityPoolFilledText,
    RoundInfoContainer,
    RoundInfo,
    ContentInfo,
    BoldContent,
    WarningContentInfo,
    CloseRoundButton,
    LoaderContainer,
    RoundEndContainer,
    RoundEndLabel,
    RoundEnd,
    ContentContainer,
    MainContainer,
    ExternalButton,
    LiquidityPoolInfoContainer,
    LiquidityPoolInfoGraphic,
    LiquidityPoolInfoLabel,
    LiquidityPoolInfo,
    LiquidityPoolInfoTitle,
    ContentInfoContainer,
    CopyContainer,
    Description,
    GetStakeThalesIcon,
    TipLink,
} from './styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import SPAAnchor from 'components/SPAAnchor';
import { Info } from 'pages/Markets/Home/Home';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { LiquidityPoolPnlType, LiquidityPoolTab } from 'constants/liquidityPool';
import NumericInput from 'components/fields/NumericInput';
import { getIsAppReady } from 'redux/modules/app';
import { UserLiquidityPoolData, LiquidityPoolData } from 'types/liquidityPool';
import { formatCurrencyWithSign, formatPercentage, formatCurrency } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';
import TimeRemaining from 'components/TimeRemaining';
import networkConnector from 'utils/networkConnector';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ApprovalModal from 'components/ApprovalModal';
import { checkAllowance, NetworkIdByName, getMaxGasLimitForNetwork } from 'utils/network';
import { BigNumber, ethers } from 'ethers';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import SimpleLoader from 'components/SimpleLoader';
import Transactions from './Transactions';
import PnL from './PnL';
import Toggle from 'components/Toggle/Toggle';
import Tooltip from 'components/Tooltip';
import useLiquidityPoolDataQuery from 'queries/liquidityPool/useLiquidityPoolDataQuery';
import useLiquidityPoolUserDataQuery from 'queries/liquidityPool/useLiquidityPoolUserDataQuery';
import { LINKS } from 'constants/links';
import MaxAllowanceTooltip from './components/MaxAllowanceTooltip';
import { getDefaultDecimalsForNetwork, getDefaultColleteralForNetwork } from 'utils/collaterals';
import { refetchLiquidityPoolData } from 'utils/queryConnector';

const LiquidityPool: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [amount, setAmount] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<LiquidityPoolTab>(LiquidityPoolTab.DEPOSIT);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');
    const [lastValidLiquidityPoolData, setLastValidLiquidityPoolData] = useState<LiquidityPoolData | undefined>(
        undefined
    );
    const [lastValidUserLiquidityPoolData, setLastValidUserLiquidityPoolData] = useState<
        UserLiquidityPoolData | undefined
    >(undefined);
    const collateral = getDefaultColleteralForNetwork(networkId);

    const { openConnectModal } = useConnectModal();

    const paymentTokenBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const liquidityPoolDataQuery = useLiquidityPoolDataQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (liquidityPoolDataQuery.isSuccess && liquidityPoolDataQuery.data) {
            setLastValidLiquidityPoolData(liquidityPoolDataQuery.data);
        }
    }, [liquidityPoolDataQuery.isSuccess, liquidityPoolDataQuery.data]);

    const liquidityPoolData: LiquidityPoolData | undefined = useMemo(() => {
        if (liquidityPoolDataQuery.isSuccess && liquidityPoolDataQuery.data) {
            return liquidityPoolDataQuery.data;
        }
        return lastValidLiquidityPoolData;
    }, [liquidityPoolDataQuery.isSuccess, liquidityPoolDataQuery.data, lastValidLiquidityPoolData]);

    const userLiquidityPoolDataQuery = useLiquidityPoolUserDataQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (userLiquidityPoolDataQuery.isSuccess && userLiquidityPoolDataQuery.data) {
            setLastValidUserLiquidityPoolData(userLiquidityPoolDataQuery.data);
        }
    }, [userLiquidityPoolDataQuery.isSuccess, userLiquidityPoolDataQuery.data]);

    const userLiquidityPoolData: UserLiquidityPoolData | undefined = useMemo(() => {
        if (userLiquidityPoolDataQuery.isSuccess && userLiquidityPoolDataQuery.data) {
            return userLiquidityPoolDataQuery.data;
        }
        return lastValidUserLiquidityPoolData;
    }, [userLiquidityPoolDataQuery.isSuccess, userLiquidityPoolDataQuery.data, lastValidUserLiquidityPoolData]);

    const isAmountEntered = Number(amount) > 0;
    const invalidAmount =
        liquidityPoolData && Number(liquidityPoolData.minDepositAmount) > Number(amount) && isAmountEntered;
    const insufficientBalance =
        (Number(paymentTokenBalance) < Number(amount) || Number(paymentTokenBalance) === 0) && isWalletConnected;

    const liquidityPoolPaused = liquidityPoolData && liquidityPoolData.paused;

    const exceededLiquidityPoolCap =
        liquidityPoolData && liquidityPoolData.availableAllocationNextRound < Number(amount);
    const exceededMaxAllowance = userLiquidityPoolData && userLiquidityPoolData.availableToDeposit < Number(amount);
    const isMaximumAmountOfUsersReached =
        liquidityPoolData &&
        liquidityPoolData.usersCurrentlyInLiquidityPool === liquidityPoolData.maxAllowedUsers &&
        userLiquidityPoolData &&
        !userLiquidityPoolData.hasDepositForCurrentRound &&
        !userLiquidityPoolData.hasDepositForNextRound;
    const isLiquidityPoolCapReached = liquidityPoolData && liquidityPoolData.allocationNextRoundPercentage >= 100;

    const isWithdrawalRequested = userLiquidityPoolData && userLiquidityPoolData.isWithdrawalRequested;
    const nothingToWithdraw = userLiquidityPoolData && userLiquidityPoolData.balanceCurrentRound === 0;
    const isMoreStakedThalesNeededToWithdraw =
        userLiquidityPoolData &&
        userLiquidityPoolData.neededStakedThalesToWithdraw > userLiquidityPoolData.stakedThales;
    const stakedThalesNeededToWithdraw = userLiquidityPoolData
        ? userLiquidityPoolData.neededStakedThalesToWithdraw - userLiquidityPoolData.stakedThales
        : 0;

    const isRequestWithdrawalButtonDisabled =
        !isWalletConnected ||
        isSubmitting ||
        nothingToWithdraw ||
        isMoreStakedThalesNeededToWithdraw ||
        (userLiquidityPoolData && userLiquidityPoolData.hasDepositForNextRound) ||
        liquidityPoolPaused;

    const isDepositButtonDisabled =
        !isWalletConnected ||
        !isAmountEntered ||
        insufficientBalance ||
        isSubmitting ||
        isWithdrawalRequested ||
        exceededLiquidityPoolCap ||
        exceededMaxAllowance ||
        isMaximumAmountOfUsersReached ||
        invalidAmount ||
        liquidityPoolPaused ||
        isLiquidityPoolCapReached;

    const isDepositAmountInputDisabled =
        isSubmitting ||
        isWithdrawalRequested ||
        isMaximumAmountOfUsersReached ||
        liquidityPoolPaused ||
        isLiquidityPoolCapReached;

    useEffect(() => {
        const { signer, sUSDContract, liquidityPoolContract } = networkConnector;
        if (signer && sUSDContract && liquidityPoolContract) {
            const sUSDContractWithSigner = sUSDContract.connect(signer);
            const getAllowance = async () => {
                try {
                    const parsedAmount = ethers.utils.parseUnits(
                        Number(amount).toString(),
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    const allowance = await checkAllowance(
                        parsedAmount,
                        sUSDContractWithSigner,
                        walletAddress,
                        liquidityPoolContract.address
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
        const { signer, sUSDContract, liquidityPoolContract } = networkConnector;
        if (signer && sUSDContract && liquidityPoolContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsAllowing(true);

            try {
                const sUSDContractWithSigner = sUSDContract.connect(signer);

                const tx = (await sUSDContractWithSigner.approve(liquidityPoolContract.address, approveAmount, {
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('market.toast-message.approve-success', { token: collateral }))
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

    const handleDeposit = async () => {
        const { signer, liquidityPoolContract } = networkConnector;
        if (signer && liquidityPoolContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const liquidityPoolContractWithSigner = liquidityPoolContract.connect(signer);
                const parsedAmount = ethers.utils.parseUnits(
                    Number(amount).toString(),
                    getDefaultDecimalsForNetwork(networkId)
                );

                const tx = await liquidityPoolContractWithSigner.deposit(parsedAmount, {
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                });
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('liquidity-pool.button.deposit-confirmation-message')));
                    setAmount('');
                    setIsSubmitting(false);
                    refetchLiquidityPoolData(walletAddress, networkId);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const handleWithdrawalRequest = async () => {
        const { signer, liquidityPoolContract } = networkConnector;
        if (signer && liquidityPoolContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const liquidityPoolContractWithSigner = liquidityPoolContract.connect(signer);

                const tx = await liquidityPoolContractWithSigner.withdrawalRequest({
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                });
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('liquidity-pool.button.request-withdrawal-confirmation-message'))
                    );
                    setAmount('');
                    setIsSubmitting(false);
                    refetchLiquidityPoolData(walletAddress, networkId);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const closeRound = async () => {
        const { signer, liquidityPoolContract } = networkConnector;
        if (signer && liquidityPoolContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const liquidityPoolContractWithSigner = liquidityPoolContract.connect(signer);

                const tx = await liquidityPoolContractWithSigner.closeRound({
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                });
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('liquidity-pool.button.close-round-confirmation-message'))
                    );
                    setIsSubmitting(false);
                    refetchLiquidityPoolData(walletAddress, networkId);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const getDepositSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        if (insufficientBalance) {
            return <SubmitButton disabled={true}>{t(`common.errors.insufficient-balance`)}</SubmitButton>;
        }
        if (!isAmountEntered) {
            return <SubmitButton disabled={true}>{t(`common.errors.enter-amount`)}</SubmitButton>;
        }
        if (!hasAllowance) {
            return (
                <SubmitButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: collateral })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: collateral,
                          })}
                </SubmitButton>
            );
        }
        return (
            <SubmitButton disabled={isDepositButtonDisabled} onClick={handleDeposit}>
                {!isSubmitting
                    ? t('liquidity-pool.button.deposit-label')
                    : t('liquidity-pool.button.deposit-progress-label')}
            </SubmitButton>
        );
    };

    const getWithdrawSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        return (
            <SubmitButton disabled={isRequestWithdrawalButtonDisabled} onClick={handleWithdrawalRequest}>
                {t('liquidity-pool.button.request-withdrawal-label')}
            </SubmitButton>
        );
    };

    const infoGraphicPercentages = getInfoGraphicPercentages(
        userLiquidityPoolData ? userLiquidityPoolData.balanceCurrentRound : 0,
        userLiquidityPoolData ? userLiquidityPoolData.balanceTotal : 0,
        userLiquidityPoolData ? userLiquidityPoolData.maxDeposit : 0
    );

    const setMaxAmount = () => {
        setAmount(Math.trunc(userLiquidityPoolData ? userLiquidityPoolData.availableToDeposit * 100 : 0) / 100);
    };

    return (
        <Wrapper>
            {networkId !== NetworkIdByName.ArbitrumOne && (
                <Info>
                    <Trans
                        i18nKey="rewards.op-rewards-banner-message"
                        components={{
                            bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                        }}
                    />
                </Info>
            )}
            <Title>{t('liquidity-pool.title')}</Title>
            {liquidityPoolData && (
                <Container>
                    <ContentContainer>
                        {liquidityPoolPaused ? (
                            <RoundInfoContainer>
                                <RoundInfo>{t('liquidity-pool.liquidity-pool-paused-message')}</RoundInfo>
                            </RoundInfoContainer>
                        ) : liquidityPoolData.liquidityPoolStarted ? (
                            <>
                                <RoundEndContainer>
                                    <RoundEndLabel>{t('liquidity-pool.round-end-label')}:</RoundEndLabel>
                                    <RoundEnd>
                                        {liquidityPoolData.isRoundEnded ? (
                                            t('liquidity-pool.round-ended-label')
                                        ) : (
                                            <TimeRemaining
                                                end={liquidityPoolData.roundEndTime}
                                                fontSize={20}
                                                showFullCounter
                                            />
                                        )}{' '}
                                        {liquidityPoolData.canCloseCurrentRound && (
                                            <CloseRoundButton disabled={isSubmitting} onClick={closeRound}>
                                                {t('liquidity-pool.button.close-round-label')}
                                            </CloseRoundButton>
                                        )}
                                    </RoundEnd>
                                </RoundEndContainer>
                            </>
                        ) : (
                            <RoundInfoContainer>
                                <RoundInfo>{t('liquidity-pool.liquidity-pool-not-started-message')}</RoundInfo>
                            </RoundInfoContainer>
                        )}
                    </ContentContainer>
                    <ContentContainer>
                        <ToggleContainer>
                            <Toggle
                                label={{
                                    firstLabel: t(`liquidity-pool.tabs.${LiquidityPoolTab.DEPOSIT}`),
                                    secondLabel: t(`liquidity-pool.tabs.${LiquidityPoolTab.WITHDRAW}`),
                                    fontSize: '18px',
                                }}
                                active={selectedTab === LiquidityPoolTab.WITHDRAW}
                                dotSize="18px"
                                dotBackground="#303656"
                                dotBorder="3px solid #3FD1FF"
                                handleClick={() => {
                                    setSelectedTab(
                                        selectedTab === LiquidityPoolTab.DEPOSIT
                                            ? LiquidityPoolTab.WITHDRAW
                                            : LiquidityPoolTab.DEPOSIT
                                    );
                                }}
                            />
                        </ToggleContainer>
                        {selectedTab === LiquidityPoolTab.DEPOSIT && (
                            <>
                                {isWithdrawalRequested && (
                                    <WarningContentInfo>
                                        <Trans i18nKey="liquidity-pool.deposit-withdrawal-warning" />
                                    </WarningContentInfo>
                                )}
                                {isLiquidityPoolCapReached && (
                                    <WarningContentInfo>
                                        <Trans i18nKey="liquidity-pool.deposit-liquidity-pool-cap-reached-warning" />
                                    </WarningContentInfo>
                                )}
                                {isMaximumAmountOfUsersReached && (
                                    <WarningContentInfo>
                                        <Trans i18nKey="liquidity-pool.deposit-max-amount-of-users-warning" />
                                    </WarningContentInfo>
                                )}
                                <InputContainer>
                                    <ValidationTooltip
                                        open={
                                            insufficientBalance ||
                                            exceededLiquidityPoolCap ||
                                            exceededMaxAllowance ||
                                            invalidAmount
                                        }
                                        title={
                                            t(
                                                `${
                                                    insufficientBalance
                                                        ? 'common.errors.insufficient-balance'
                                                        : exceededLiquidityPoolCap
                                                        ? 'liquidity-pool.deposit-liquidity-pool-cap-error'
                                                        : exceededMaxAllowance
                                                        ? 'liquidity-pool.deposit-staked-thales-error'
                                                        : 'liquidity-pool.deposit-min-amount-error'
                                                }`,
                                                {
                                                    amount: formatCurrencyWithSign(
                                                        USD_SIGN,
                                                        liquidityPoolData.minDepositAmount
                                                    ),
                                                }
                                            ) as string
                                        }
                                    >
                                        <NumericInput
                                            value={amount}
                                            disabled={isDepositAmountInputDisabled}
                                            onChange={(_, value) => setAmount(value)}
                                            placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                                            currencyLabel={collateral}
                                            onMaxButton={setMaxAmount}
                                        />
                                    </ValidationTooltip>
                                </InputContainer>
                                {getDepositSubmitButton()}
                            </>
                        )}
                        {selectedTab === LiquidityPoolTab.WITHDRAW && (
                            <>
                                {((liquidityPoolData && userLiquidityPoolData && !isWithdrawalRequested) ||
                                    !isWalletConnected) && (
                                    <>
                                        {nothingToWithdraw || !isWalletConnected ? (
                                            <>
                                                <ContentInfo>
                                                    <Trans i18nKey="liquidity-pool.nothing-to-withdraw-label" />
                                                </ContentInfo>
                                                {userLiquidityPoolData && userLiquidityPoolData.hasDepositForNextRound && (
                                                    <ContentInfo>
                                                        <Trans i18nKey="liquidity-pool.first-deposit-withdrawal-message" />
                                                    </ContentInfo>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {userLiquidityPoolData && (
                                                    <>
                                                        {userLiquidityPoolData.hasDepositForNextRound ? (
                                                            <WarningContentInfo>
                                                                <Trans i18nKey="liquidity-pool.withdrawal-deposit-warning" />
                                                            </WarningContentInfo>
                                                        ) : isMoreStakedThalesNeededToWithdraw ? (
                                                            <WarningContentInfo>
                                                                <Trans
                                                                    i18nKey="liquidity-pool.withdrawal-staked-thales-warning"
                                                                    values={{
                                                                        amount: formatCurrency(
                                                                            stakedThalesNeededToWithdraw
                                                                        ),
                                                                    }}
                                                                />
                                                            </WarningContentInfo>
                                                        ) : (
                                                            <>
                                                                <ContentInfo>
                                                                    <Trans
                                                                        i18nKey="liquidity-pool.available-to-withdraw-label"
                                                                        components={{
                                                                            bold: <BoldContent />,
                                                                        }}
                                                                        values={{
                                                                            amount: formatCurrencyWithSign(
                                                                                USD_SIGN,
                                                                                userLiquidityPoolData.balanceCurrentRound
                                                                            ),
                                                                        }}
                                                                    />
                                                                    <Tooltip
                                                                        overlay={t(
                                                                            `liquidity-pool.estimated-amount-tooltip`
                                                                        )}
                                                                        iconFontSize={14}
                                                                        marginLeft={2}
                                                                    />
                                                                </ContentInfo>
                                                                <ContentInfo>
                                                                    <Trans i18nKey="liquidity-pool.withdrawal-message" />
                                                                </ContentInfo>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {getWithdrawSubmitButton()}
                                    </>
                                )}
                                {liquidityPoolData &&
                                    userLiquidityPoolData &&
                                    userLiquidityPoolData.isWithdrawalRequested && (
                                        <>
                                            <ContentInfo>
                                                <Trans
                                                    i18nKey="liquidity-pool.withdrawal-requested-message"
                                                    components={{
                                                        bold: <BoldContent />,
                                                        tooltip: (
                                                            <Tooltip
                                                                overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                                                                iconFontSize={14}
                                                                marginLeft={2}
                                                            />
                                                        ),
                                                    }}
                                                    values={{
                                                        amount: formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            userLiquidityPoolData.balanceCurrentRound
                                                        ),
                                                    }}
                                                />
                                            </ContentInfo>
                                        </>
                                    )}
                            </>
                        )}
                    </ContentContainer>
                    <ContentContainer>
                        <ButtonContainer>
                            <ExternalButton
                                target="_blank"
                                rel="noreferrer"
                                href={
                                    networkId !== NetworkIdByName.ArbitrumOne
                                        ? LINKS.UniswapBuyThalesOp
                                        : LINKS.UniswapBuyThalesArbitrum
                                }
                            >
                                {t('liquidity-pool.button.get-thales-label')}
                                <GetStakeThalesIcon className={`icon icon--get-thales`} />
                            </ExternalButton>
                            <ExternalButton target="_blank" rel="noreferrer" href={LINKS.ThalesStaking}>
                                {t('liquidity-pool.button.stake-thales-label')}
                                <GetStakeThalesIcon className={`icon icon--stake-thales`} />
                            </ExternalButton>
                        </ButtonContainer>
                    </ContentContainer>
                </Container>
            )}
            {liquidityPoolData && (
                <CopyContainer>
                    <Description>
                        <Trans
                            i18nKey={`liquidity-pool.description`}
                            components={{
                                h1: <h1 />,
                                p: <p />,
                                tipLink: <TipLink href={LINKS.ThalesTip99} />,
                            }}
                            values={{
                                thalesStakedAmount: 1 / liquidityPoolData.stakedThalesMultiplier,
                                currency: collateral,
                            }}
                        />
                    </Description>
                    <Description>
                        <Trans
                            i18nKey={`liquidity-pool.variables`}
                            components={{
                                h1: <h1 />,
                                p: <p />,
                                ul: <ul />,
                                li: <li />,
                            }}
                            values={{
                                maxAllowedDeposit: formatCurrencyWithSign(
                                    USD_SIGN,
                                    liquidityPoolData.maxAllowedDeposit,
                                    0
                                ),
                                maxAllowedUsers: liquidityPoolData.maxAllowedUsers,
                                minDepositAmount: formatCurrencyWithSign(
                                    USD_SIGN,
                                    liquidityPoolData.minDepositAmount,
                                    0
                                ),
                                roundLength: liquidityPoolData.roundLength,
                            }}
                        />
                    </Description>
                </CopyContainer>
            )}
            <MainContainer>
                {!liquidityPoolData ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : (
                    <>
                        <ContentContainer>
                            {liquidityPoolData && (
                                <>
                                    <LiquidityPoolInfoTitle>
                                        {t('liquidity-pool.total-info-label')}
                                    </LiquidityPoolInfoTitle>
                                    <span>
                                        <Trans
                                            i18nKey="liquidity-pool.users-in-liquidity-pool-label"
                                            values={{
                                                number: liquidityPoolData.usersCurrentlyInLiquidityPool,
                                                max: liquidityPoolData.maxAllowedUsers,
                                            }}
                                        />
                                    </span>
                                    <LiquidityPoolFilledGraphicContainer>
                                        <LiquidityPoolFilledGraphicPercentage
                                            width={liquidityPoolData.allocationNextRoundPercentage}
                                        ></LiquidityPoolFilledGraphicPercentage>
                                    </LiquidityPoolFilledGraphicContainer>
                                    <LiquidityPoolFilledText>
                                        <span>{`${formatCurrencyWithSign(
                                            USD_SIGN,
                                            liquidityPoolData.allocationNextRound
                                        )} / ${formatCurrencyWithSign(
                                            USD_SIGN,
                                            liquidityPoolData.maxAllowedDeposit
                                        )}`}</span>
                                        <span>
                                            <Trans
                                                i18nKey="liquidity-pool.your-share-label"
                                                values={{
                                                    percentage: formatPercentage(
                                                        (userLiquidityPoolData
                                                            ? userLiquidityPoolData.balanceTotal
                                                            : 0) / liquidityPoolData.allocationNextRound
                                                    ),
                                                }}
                                            />
                                        </span>
                                    </LiquidityPoolFilledText>
                                </>
                            )}
                            <ContentInfoContainer>
                                <LiquidityPoolInfoTitle>{t('liquidity-pool.your-info-label')}</LiquidityPoolInfoTitle>
                                {liquidityPoolData.liquidityPoolStarted && (
                                    <LiquidityPoolInfoContainer>
                                        <LiquidityPoolInfoLabel>
                                            {t('liquidity-pool.current-balance-label')}:
                                        </LiquidityPoolInfoLabel>
                                        <LiquidityPoolInfoGraphic
                                            background={'linear-gradient(90.21deg, #A40A95 0.18%, #FC6679 99.82%)'}
                                            widthPercentage={infoGraphicPercentages.currentBalancePercenatage}
                                        />
                                        <LiquidityPoolInfo>
                                            {formatCurrencyWithSign(
                                                USD_SIGN,
                                                userLiquidityPoolData ? userLiquidityPoolData.balanceCurrentRound : 0
                                            )}
                                        </LiquidityPoolInfo>
                                    </LiquidityPoolInfoContainer>
                                )}
                                <LiquidityPoolInfoContainer>
                                    <LiquidityPoolInfoLabel>
                                        {t('liquidity-pool.next-round-balance-label')}:
                                    </LiquidityPoolInfoLabel>
                                    <LiquidityPoolInfoGraphic
                                        background={'linear-gradient(90deg, #2A3895 0%, #893CE2 100%)'}
                                        widthPercentage={infoGraphicPercentages.nextRoundBalancePercenatage}
                                    />
                                    <LiquidityPoolInfo>
                                        {formatCurrencyWithSign(
                                            USD_SIGN,
                                            userLiquidityPoolData ? userLiquidityPoolData.balanceTotal : 0
                                        )}
                                        {userLiquidityPoolData &&
                                            userLiquidityPoolData.balanceCurrentRound > 0 &&
                                            !isWithdrawalRequested && (
                                                <Tooltip
                                                    overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                                                    iconFontSize={14}
                                                    marginLeft={2}
                                                />
                                            )}
                                    </LiquidityPoolInfo>
                                </LiquidityPoolInfoContainer>
                                <LiquidityPoolInfoContainer>
                                    <LiquidityPoolInfoLabel>
                                        {t('liquidity-pool.max-allowance-label')}:
                                    </LiquidityPoolInfoLabel>
                                    <LiquidityPoolInfoGraphic
                                        background={'linear-gradient(270deg, #3AECD3 0%, #017F9C 100%)'}
                                        widthPercentage={infoGraphicPercentages.maxAllowancePercenatage}
                                    />
                                    <LiquidityPoolInfo>
                                        {formatCurrencyWithSign(
                                            USD_SIGN,
                                            userLiquidityPoolData ? userLiquidityPoolData.maxDeposit : 0
                                        )}
                                        <Tooltip
                                            overlay={
                                                <MaxAllowanceTooltip
                                                    stakedThales={
                                                        userLiquidityPoolData ? userLiquidityPoolData.stakedThales : 0
                                                    }
                                                    stakedThalesMultiplier={liquidityPoolData.stakedThalesMultiplier}
                                                />
                                            }
                                            overlayClassName="lp-max-allowance"
                                            iconFontSize={14}
                                            marginLeft={2}
                                        />
                                    </LiquidityPoolInfo>
                                </LiquidityPoolInfoContainer>
                                {isWithdrawalRequested && (
                                    <WarningContentInfo>
                                        <Trans
                                            i18nKey="liquidity-pool.withdrawal-request-label"
                                            values={{
                                                amount: formatCurrencyWithSign(
                                                    USD_SIGN,
                                                    userLiquidityPoolData.balanceCurrentRound
                                                ),
                                            }}
                                        />
                                        <Tooltip
                                            overlay={t(`vault.estimated-amount-tooltip`)}
                                            iconFontSize={14}
                                            marginLeft={2}
                                        />
                                    </WarningContentInfo>
                                )}
                            </ContentInfoContainer>
                        </ContentContainer>
                        <ContentContainer>
                            {liquidityPoolData && (
                                <PnL
                                    lifetimePnl={liquidityPoolData.lifetimePnl}
                                    type={LiquidityPoolPnlType.PNL_PER_ROUND}
                                />
                            )}
                        </ContentContainer>
                        <ContentContainer>
                            {liquidityPoolData && (
                                <PnL
                                    lifetimePnl={liquidityPoolData.lifetimePnl}
                                    type={LiquidityPoolPnlType.CUMULATIVE_PNL}
                                />
                            )}
                        </ContentContainer>
                    </>
                )}
            </MainContainer>
            {liquidityPoolData && <Transactions currentRound={liquidityPoolData.round} />}
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    tokenSymbol={collateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Wrapper>
    );
};

const getInfoGraphicPercentages = (currentBalance: number, nextRoundBalance: number, maxAllowance: number) => {
    let currentBalancePercenatage = 1;
    let nextRoundBalancePercenatage = 1;
    let maxAllowancePercenatage = 1;

    if (maxAllowance > currentBalance && maxAllowance > nextRoundBalance) {
        currentBalancePercenatage = currentBalance / maxAllowance;
        nextRoundBalancePercenatage = nextRoundBalance / maxAllowance;
    } else if (currentBalance > nextRoundBalance) {
        maxAllowancePercenatage = maxAllowance / currentBalance;
        nextRoundBalancePercenatage = nextRoundBalance / currentBalance;
    } else if (nextRoundBalance === 0) {
        currentBalancePercenatage = 0;
        nextRoundBalancePercenatage = 0;
        maxAllowancePercenatage = 0;
    } else {
        maxAllowancePercenatage = maxAllowance / nextRoundBalance;
        currentBalancePercenatage = currentBalance / nextRoundBalance;
    }

    return {
        currentBalancePercenatage,
        nextRoundBalancePercenatage,
        maxAllowancePercenatage,
    };
};

export default LiquidityPool;

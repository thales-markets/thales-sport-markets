import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import SimpleLoader from 'components/SimpleLoader';
import TimeRemaining from 'components/TimeRemaining';
import Toggle from 'components/Toggle/Toggle';
import Tooltip from 'components/Tooltip';
import NumericInput from 'components/fields/NumericInput';
import RadioButton from 'components/fields/RadioButton';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { LINKS } from 'constants/links';
import { LiquidityPoolCollateral, LiquidityPoolPnlType, LiquidityPoolTab } from 'enums/liquidityPool';
import { BigNumber, Contract, ethers } from 'ethers';
import useLiquidityPoolDataQuery from 'queries/liquidityPool/useLiquidityPoolDataQuery';
import useLiquidityPoolUserDataQuery from 'queries/liquidityPool/useLiquidityPoolUserDataQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { Coins, coinParser, formatCurrencyWithKey, formatPercentage } from 'thales-utils';
import { LiquidityPoolData, UserLiquidityPoolData } from 'types/liquidityPool';
import { ThemeInterface } from 'types/ui';
import liquidityPoolContract from 'utils/contracts/liquidityPoolContractV2';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchLiquidityPoolData } from 'utils/queryConnector';
import { delay } from 'utils/timer';
import SPAAnchor from '../../components/SPAAnchor';
import ROUTES from '../../constants/routes';
import useMultipleCollateralBalanceQuery from '../../queries/wallet/useMultipleCollateralBalanceQuery';
import { getCollateralIndex } from '../../utils/collaterals';
import { getDefaultLpCollateral, getLiquidityPools, getLpAddress, getLpCollateral } from '../../utils/liquidityPool';
import { buildHref } from '../../utils/routes';
import PnL from './PnL';
import Return from './Return';
import Transactions from './Transactions';
import {
    BoldContent,
    Container,
    ContentContainer,
    ContentInfo,
    ContentInfoContainer,
    CopyContainer,
    Description,
    InputButtonContainer,
    LiquidityPoolFilledGraphicContainer,
    LiquidityPoolFilledGraphicPercentage,
    LiquidityPoolFilledText,
    LiquidityPoolInfo,
    LiquidityPoolInfoContainer,
    LiquidityPoolInfoGraphic,
    LiquidityPoolInfoLabel,
    LiquidityPoolInfoTitle,
    LoaderContainer,
    MainContainer,
    MainContentContainer,
    NavigationContainer,
    NavigationItem,
    RadioButtonContainer,
    RoundEnd,
    RoundEndContainer,
    RoundEndLabel,
    RoundInfo,
    RoundInfoContainer,
    SliderContainer,
    SliderRange,
    StyledSlider,
    TipLink,
    Title,
    ToggleContainer,
    WarningContentInfo,
    Wrapper,
    defaultButtonProps,
} from './styled-components';

const WETH_COLLATERALS = [CRYPTO_CURRENCY_MAP.WETH as Coins, CRYPTO_CURRENCY_MAP.ETH as Coins];

const LiquidityPool: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const location = useLocation();
    const theme: ThemeInterface = useTheme();

    const networkId = useSelector(getNetworkId);
    const isAppReady = useSelector(getIsAppReady);
    const isWalletConnected = useSelector(getIsWalletConnected);
    const walletAddress = useSelector(getWalletAddress) || '';

    const [selectedCollateralIndex, setSelectedCollateralIndex] = useState<number>(0);
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
    const [withdrawAll, setWithdrawAll] = useState<boolean>(true);
    const [withdrawalPercentage, setWithdrawalPercentage] = useState<number | string>(10);
    const [isWithdrawalPercentageValid, setIsWithdrawalPercentageValid] = useState<boolean>(true);
    const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);

    const paramCollateral: LiquidityPoolCollateral =
        queryString.parse(location.search).collateral || getDefaultLpCollateral(networkId);

    const collateral = getLpCollateral(networkId, paramCollateral);
    const collateralIndex = getCollateralIndex(networkId, collateral);

    const liquidityPoolAddress = getLpAddress(networkId, paramCollateral);
    const liquidityPools = getLiquidityPools(networkId);

    const { openConnectModal } = useConnectModal();

    const multipleCollateralBalanceQuery = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const liquidityPoolDataQuery = useLiquidityPoolDataQuery(liquidityPoolAddress, collateral, networkId, {
        enabled: isAppReady && liquidityPoolAddress !== undefined,
    });

    const userLiquidityPoolDataQuery = useLiquidityPoolUserDataQuery(
        liquidityPoolAddress,
        collateral,
        walletAddress,
        networkId,
        {
            enabled: isAppReady && isWalletConnected && liquidityPoolAddress !== undefined,
        }
    );

    const ethSelected = useMemo(() => collateral === CRYPTO_CURRENCY_MAP.WETH && selectedCollateralIndex === 1, [
        collateral,
        selectedCollateralIndex,
    ]);

    useEffect(() => {
        if (multipleCollateralBalanceQuery.isSuccess && multipleCollateralBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(
                Number(multipleCollateralBalanceQuery.data[ethSelected ? CRYPTO_CURRENCY_MAP.ETH : collateral])
            );
        }
    }, [multipleCollateralBalanceQuery.isSuccess, multipleCollateralBalanceQuery.data, collateral, ethSelected]);

    useEffect(() => {
        if (liquidityPoolDataQuery.isSuccess && liquidityPoolDataQuery.data) {
            setLastValidLiquidityPoolData(liquidityPoolDataQuery.data);
        }
    }, [liquidityPoolDataQuery.isSuccess, liquidityPoolDataQuery.data]);

    useEffect(() => {
        if (userLiquidityPoolDataQuery.isSuccess && userLiquidityPoolDataQuery.data) {
            setLastValidUserLiquidityPoolData(userLiquidityPoolDataQuery.data);
        }
    }, [userLiquidityPoolDataQuery.isSuccess, userLiquidityPoolDataQuery.data]);

    useEffect(() => {
        const { signer, multipleCollateral } = networkConnector;

        if (signer && multipleCollateral) {
            const collateralContractWithSigner = multipleCollateral[collateral]?.connect(signer);

            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(Number(amount).toString(), networkId, collateral);
                    const allowance = await checkAllowance(
                        parsedAmount,
                        collateralContractWithSigner,
                        walletAddress,
                        liquidityPoolAddress
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
        liquidityPoolAddress,
        collateral,
    ]);

    const liquidityPoolData: LiquidityPoolData | undefined = useMemo(() => {
        if (liquidityPoolDataQuery.isSuccess && liquidityPoolDataQuery.data) {
            return liquidityPoolDataQuery.data;
        }
        return lastValidLiquidityPoolData;
    }, [liquidityPoolDataQuery.isSuccess, liquidityPoolDataQuery.data, lastValidLiquidityPoolData]);

    const userLiquidityPoolData: UserLiquidityPoolData | undefined = useMemo(() => {
        if (userLiquidityPoolDataQuery.isSuccess && userLiquidityPoolDataQuery.data) {
            return userLiquidityPoolDataQuery.data;
        }
        return lastValidUserLiquidityPoolData;
    }, [userLiquidityPoolDataQuery.isSuccess, userLiquidityPoolDataQuery.data, lastValidUserLiquidityPoolData]);

    useEffect(
        () =>
            setIsWithdrawalPercentageValid(
                (Number(withdrawalPercentage) <= 90 && Number(withdrawalPercentage) >= 10) || withdrawAll
            ),
        [withdrawalPercentage, withdrawAll]
    );

    useEffect(() => {
        if (userLiquidityPoolData) {
            setWithdrawalAmount(
                withdrawAll
                    ? userLiquidityPoolData.balanceCurrentRound
                    : (userLiquidityPoolData.balanceCurrentRound * Number(withdrawalPercentage)) / 100
            );
        }
    }, [withdrawalPercentage, withdrawAll, userLiquidityPoolData]);

    const isAmountEntered = Number(amount) > 0;
    const invalidAmount =
        liquidityPoolData &&
        Number(liquidityPoolData.minDepositAmount) > Number(amount) &&
        userLiquidityPoolData &&
        !userLiquidityPoolData.hasDepositForCurrentRound &&
        !userLiquidityPoolData.hasDepositForNextRound &&
        isAmountEntered;
    const insufficientBalance =
        (Number(paymentTokenBalance) < Number(amount) || Number(paymentTokenBalance) === 0) && isWalletConnected;

    const liquidityPoolPaused = liquidityPoolData && liquidityPoolData.paused;

    const exceededLiquidityPoolCap =
        liquidityPoolData && liquidityPoolData.availableAllocationNextRound < Number(amount);
    const isMaximumAmountOfUsersReached =
        liquidityPoolData &&
        liquidityPoolData.usersCurrentlyInLiquidityPool === liquidityPoolData.maxAllowedUsers &&
        userLiquidityPoolData &&
        !userLiquidityPoolData.hasDepositForCurrentRound &&
        !userLiquidityPoolData.hasDepositForNextRound;
    const isLiquidityPoolCapReached = liquidityPoolData && liquidityPoolData.allocationNextRoundPercentage >= 100;

    const isWithdrawalRequested = userLiquidityPoolData && userLiquidityPoolData.isWithdrawalRequested;
    const nothingToWithdraw = userLiquidityPoolData && userLiquidityPoolData.balanceCurrentRound === 0;

    const isRequestWithdrawalButtonDisabled =
        !isWalletConnected ||
        isSubmitting ||
        nothingToWithdraw ||
        (userLiquidityPoolData && userLiquidityPoolData.hasDepositForNextRound) ||
        liquidityPoolPaused;

    const isPartialWithdrawalDisabled = isRequestWithdrawalButtonDisabled || withdrawAll;

    const isDepositButtonDisabled =
        !isWalletConnected ||
        !isAmountEntered ||
        insufficientBalance ||
        isSubmitting ||
        isWithdrawalRequested ||
        exceededLiquidityPoolCap ||
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

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer, multipleCollateral } = networkConnector;

        if (signer && multipleCollateral) {
            const collateralContractWithSigner = multipleCollateral[collateral]?.connect(signer);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsAllowing(true);

            try {
                console.log(approveAmount.toString(), collateral);
                const tx = (await collateralContractWithSigner?.approve(
                    liquidityPoolAddress,
                    approveAmount
                )) as ethers.ContractTransaction;
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
        const { signer, multipleCollateral } = networkConnector;

        if (signer) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const liquidityPoolContractWithSigner = new Contract(
                    liquidityPoolAddress,
                    liquidityPoolContract,
                    signer
                );
                const parsedAmount = coinParser(Number(amount).toString(), networkId, collateral);

                if (
                    paramCollateral === LiquidityPoolCollateral.WETH &&
                    multipleCollateral?.WETH &&
                    selectedCollateralIndex === 1
                ) {
                    const WETHContractWithSigner = multipleCollateral.WETH.connect(signer);
                    const wrapTx = await WETHContractWithSigner.deposit({ value: parsedAmount });
                    const wrapTxResult = await wrapTx.wait();

                    if (wrapTxResult && wrapTxResult.transactionHash) {
                        const tx = await liquidityPoolContractWithSigner.deposit(parsedAmount);
                        const txResult = await tx.wait();

                        if (txResult && txResult.events) {
                            PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.depositLp);
                            toast.update(
                                id,
                                getSuccessToastOptions(t('liquidity-pool.button.deposit-confirmation-message'))
                            );
                            setAmount('');
                            setIsSubmitting(false);
                            refetchLiquidityPoolData(walletAddress, networkId, liquidityPoolAddress);
                        }
                    }
                } else {
                    const tx = await liquidityPoolContractWithSigner.deposit(parsedAmount);
                    const txResult = await tx.wait();

                    if (txResult && txResult.events) {
                        PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.depositLp);
                        toast.update(
                            id,
                            getSuccessToastOptions(t('liquidity-pool.button.deposit-confirmation-message'))
                        );
                        setAmount('');
                        setIsSubmitting(false);
                        refetchLiquidityPoolData(walletAddress, networkId, liquidityPoolAddress);
                    }
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const handleWithdrawalRequest = async () => {
        const { signer } = networkConnector;

        if (signer) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const liquidityPoolContractWithSigner = new Contract(
                    liquidityPoolAddress,
                    liquidityPoolContract,
                    signer
                );
                const parsedPercentage = ethers.utils.parseEther((Number(withdrawalPercentage) / 100).toString());

                const tx = withdrawAll
                    ? await liquidityPoolContractWithSigner.withdrawalRequest()
                    : await liquidityPoolContractWithSigner.partialWithdrawalRequest(parsedPercentage);
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('liquidity-pool.button.request-withdrawal-confirmation-message'))
                    );
                    setAmount('');
                    setIsSubmitting(false);
                    refetchLiquidityPoolData(walletAddress, networkId, liquidityPoolAddress);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const closeRound = async () => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        setIsSubmitting(true);
        try {
            const { signer } = networkConnector;

            if (signer) {
                const liquidityPoolContractWithSigner = new Contract(
                    liquidityPoolAddress,
                    liquidityPoolContract,
                    signer
                );

                const canCloseCurrentRound = await liquidityPoolContractWithSigner.canCloseCurrentRound();
                const roundClosingPrepared = await liquidityPoolContractWithSigner.roundClosingPrepared();

                let getUsersCountInCurrentRound = await liquidityPoolContractWithSigner.getUsersCountInCurrentRound();
                let usersProcessedInRound = await liquidityPoolContractWithSigner.usersProcessedInRound();
                if (canCloseCurrentRound) {
                    try {
                        if (!roundClosingPrepared) {
                            const tx = await liquidityPoolContractWithSigner.prepareRoundClosing({
                                type: 2,
                            });
                            await tx.wait().then(() => {
                                console.log('prepareRoundClosing closed');
                            });
                            await delay(1000 * 2);
                        }

                        while (usersProcessedInRound.toString() < getUsersCountInCurrentRound.toString()) {
                            const tx = await liquidityPoolContractWithSigner.processRoundClosingBatch(100, {
                                type: 2,
                            });
                            await tx.wait().then(() => {
                                console.log('Round closed');
                            });
                            await delay(1000 * 2);
                            getUsersCountInCurrentRound = await liquidityPoolContractWithSigner.getUsersCountInCurrentRound();
                            usersProcessedInRound = await liquidityPoolContractWithSigner.usersProcessedInRound();
                        }

                        const tx = await liquidityPoolContractWithSigner.closeRound({
                            type: 2,
                        });
                        await tx.wait().then(() => {
                            console.log('Round closed');
                        });

                        toast.update(
                            id,
                            getSuccessToastOptions(t('liquidity-pool.button.close-round-confirmation-message'))
                        );
                        setIsSubmitting(false);
                        refetchLiquidityPoolData(walletAddress, networkId, 'parlay');
                        refetchLiquidityPoolData(walletAddress, networkId, 'single');
                    } catch (e) {
                        toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                        setIsSubmitting(false);
                        console.log(e);
                    }
                }
            }
        } catch (e) {
            console.log('E ', e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            setIsSubmitting(false);
        }
    };

    const getDepositSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <Button {...defaultButtonProps} onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (insufficientBalance) {
            return (
                <Button {...defaultButtonProps} disabled={true}>
                    {t(`common.errors.insufficient-balance`)}
                </Button>
            );
        }
        if (!isAmountEntered) {
            return (
                <Button {...defaultButtonProps} disabled={true}>
                    {t(`common.errors.enter-amount`)}
                </Button>
            );
        }
        if (!hasAllowance) {
            if (ethSelected) {
                return (
                    <Tooltip
                        overlay={t('common.wrap-eth-tooltip')}
                        component={
                            <Button
                                {...defaultButtonProps}
                                disabled={isAllowing}
                                onClick={() => setOpenApprovalModal(true)}
                            >
                                {!isAllowing
                                    ? t('common.enable-wallet-access.approve-label', { currencyKey: collateral })
                                    : t('common.enable-wallet-access.approve-progress-label', {
                                          currencyKey: collateral,
                                      })}
                            </Button>
                        }
                    ></Tooltip>
                );
            } else {
                return (
                    <Button {...defaultButtonProps} disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                        {!isAllowing
                            ? t('common.enable-wallet-access.approve-label', { currencyKey: collateral })
                            : t('common.enable-wallet-access.approve-progress-label', {
                                  currencyKey: collateral,
                              })}
                    </Button>
                );
            }
        }
        return !ethSelected ? (
            <Button {...defaultButtonProps} disabled={isDepositButtonDisabled} onClick={handleDeposit}>
                {!isSubmitting
                    ? t('liquidity-pool.button.deposit-label')
                    : t('liquidity-pool.button.deposit-progress-label')}
            </Button>
        ) : (
            <Tooltip
                overlay={t('common.wrap-eth-tooltip')}
                component={
                    <Button {...defaultButtonProps} disabled={isDepositButtonDisabled} onClick={handleDeposit}>
                        {!isSubmitting
                            ? t('liquidity-pool.button.deposit-label')
                            : t('liquidity-pool.button.deposit-progress-label')}
                    </Button>
                }
            ></Tooltip>
        );
    };

    const getWithdrawButton = () => {
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
        return (
            <Button
                disabled={isRequestWithdrawalButtonDisabled || !isWithdrawalPercentageValid}
                onClick={handleWithdrawalRequest}
            >
                {t('liquidity-pool.button.request-withdrawal-label')}
            </Button>
        );
    };

    const infoGraphicPercentages = getInfoGraphicPercentages(
        userLiquidityPoolData ? userLiquidityPoolData.balanceCurrentRound : 0,
        userLiquidityPoolData ? userLiquidityPoolData.balanceTotal : 0
    );

    return (
        <Wrapper>
            <Title>{t('liquidity-pool.title')}</Title>
            <NavigationContainer>
                {liquidityPools.map((item: any) => {
                    const lpCollateral = item.collateral.toLowerCase() as LiquidityPoolCollateral;
                    return (
                        <SPAAnchor
                            key={item.name}
                            href={`${buildHref(ROUTES.LiquidityPool)}?collateral=${lpCollateral}`}
                        >
                            <NavigationItem className={`${lpCollateral === paramCollateral ? 'selected' : ''}`}>
                                {item.name}
                            </NavigationItem>
                        </SPAAnchor>
                    );
                })}
            </NavigationContainer>
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
                                            <Button
                                                disabled={isSubmitting}
                                                onClick={closeRound}
                                                fontSize="12px"
                                                margin="5px 0 0 0"
                                                height="24px"
                                                backgroundColor={theme.button.background.quaternary}
                                                borderColor={theme.button.borderColor.secondary}
                                            >
                                                {t('liquidity-pool.button.close-round-label')}
                                            </Button>
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
                                    fontSize: '14px',
                                }}
                                active={selectedTab === LiquidityPoolTab.WITHDRAW}
                                dotSize="14px"
                                dotBackground={theme.background.secondary}
                                dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                                handleClick={() => {
                                    setSelectedTab(
                                        selectedTab === LiquidityPoolTab.DEPOSIT
                                            ? LiquidityPoolTab.WITHDRAW
                                            : LiquidityPoolTab.DEPOSIT
                                    );
                                }}
                            />
                        </ToggleContainer>
                        <InputButtonContainer>
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
                                    <NumericInput
                                        value={amount}
                                        label="Deposit"
                                        disabled={isDepositAmountInputDisabled}
                                        onChange={(_, value) => setAmount(value)}
                                        placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                                        currencyLabel={
                                            paramCollateral === LiquidityPoolCollateral.WETH ? undefined : collateral
                                        }
                                        showValidation={
                                            insufficientBalance || exceededLiquidityPoolCap || invalidAmount
                                        }
                                        validationMessage={t(
                                            `${
                                                insufficientBalance
                                                    ? 'common.errors.insufficient-balance'
                                                    : exceededLiquidityPoolCap
                                                    ? 'liquidity-pool.deposit-liquidity-pool-cap-error'
                                                    : 'liquidity-pool.deposit-min-amount-error'
                                            }`,
                                            {
                                                amount: formatCurrencyWithKey(
                                                    collateral,
                                                    liquidityPoolData.minDepositAmount
                                                ),
                                            }
                                        )}
                                        currencyComponent={
                                            paramCollateral === LiquidityPoolCollateral.WETH ? (
                                                <CollateralSelector
                                                    collateralArray={WETH_COLLATERALS}
                                                    selectedItem={selectedCollateralIndex}
                                                    onChangeCollateral={(index: number) => {
                                                        setSelectedCollateralIndex(index);
                                                    }}
                                                    isDetailedView
                                                    preventPaymentCollateralChange
                                                    collateralBalances={multipleCollateralBalanceQuery.data}
                                                    exchangeRates={exchangeRates}
                                                />
                                            ) : undefined
                                        }
                                        validationPlacement="bottom"
                                        balance={formatCurrencyWithKey(
                                            ethSelected ? CRYPTO_CURRENCY_MAP.ETH : collateral,
                                            paymentTokenBalance
                                        )}
                                    />
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
                                                    {userLiquidityPoolData &&
                                                        userLiquidityPoolData.hasDepositForNextRound && (
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
                                                            ) : (
                                                                <>
                                                                    <ContentInfo>
                                                                        <Trans
                                                                            i18nKey="liquidity-pool.available-to-withdraw-label"
                                                                            components={{
                                                                                bold: <BoldContent />,
                                                                            }}
                                                                            values={{
                                                                                amount: formatCurrencyWithKey(
                                                                                    collateral,
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
                                                                    <RadioButtonContainer>
                                                                        <RadioButton
                                                                            checked={withdrawAll}
                                                                            value={'true'}
                                                                            onChange={() => setWithdrawAll(true)}
                                                                            label={t(
                                                                                `liquidity-pool.full-withdrawal-label`
                                                                            )}
                                                                        />
                                                                        <RadioButton
                                                                            checked={!withdrawAll}
                                                                            value={'false'}
                                                                            onChange={() => setWithdrawAll(false)}
                                                                            label={t(
                                                                                `liquidity-pool.partial-withdrawal-label`
                                                                            )}
                                                                        />
                                                                    </RadioButtonContainer>
                                                                    <NumericInput
                                                                        value={withdrawalPercentage}
                                                                        disabled={isPartialWithdrawalDisabled}
                                                                        onChange={(_, value) =>
                                                                            setWithdrawalPercentage(value)
                                                                        }
                                                                        placeholder={t(
                                                                            'liquidity-pool.percentage-placeholder'
                                                                        )}
                                                                        currencyLabel="%"
                                                                        step="1"
                                                                        showValidation={!isWithdrawalPercentageValid}
                                                                        validationMessage={
                                                                            t(
                                                                                Number(withdrawalPercentage) == 0
                                                                                    ? 'common.errors.enter-percentage'
                                                                                    : 'common.errors.invalid-percentage-range',
                                                                                { min: 10, max: 90 }
                                                                            ) as string
                                                                        }
                                                                        validationPlacement="bottom"
                                                                    />
                                                                    <SliderContainer>
                                                                        <StyledSlider
                                                                            value={Number(withdrawalPercentage)}
                                                                            step={1}
                                                                            max={90}
                                                                            min={10}
                                                                            onChange={(_: any, value: any) =>
                                                                                setWithdrawalPercentage(Number(value))
                                                                            }
                                                                            disabled={isPartialWithdrawalDisabled}
                                                                        />
                                                                        <FlexDivRow>
                                                                            <SliderRange
                                                                                className={
                                                                                    isPartialWithdrawalDisabled
                                                                                        ? 'disabled'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                10%
                                                                            </SliderRange>
                                                                            <SliderRange
                                                                                className={
                                                                                    isPartialWithdrawalDisabled
                                                                                        ? 'disabled'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                90%
                                                                            </SliderRange>
                                                                        </FlexDivRow>
                                                                    </SliderContainer>
                                                                    <ContentInfo>
                                                                        <Trans
                                                                            i18nKey="liquidity-pool.withdrawal-amount-label"
                                                                            components={{
                                                                                bold: <BoldContent />,
                                                                            }}
                                                                            values={{
                                                                                amount: formatCurrencyWithKey(
                                                                                    collateral,
                                                                                    withdrawalAmount
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
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            {getWithdrawButton()}
                                        </>
                                    )}
                                    {liquidityPoolData &&
                                        userLiquidityPoolData &&
                                        userLiquidityPoolData.isWithdrawalRequested && (
                                            <>
                                                <ContentInfo>
                                                    <Trans
                                                        i18nKey={`liquidity-pool.${
                                                            userLiquidityPoolData.isPartialWithdrawalRequested
                                                                ? 'partial'
                                                                : 'full'
                                                        }-withdrawal-requested-message`}
                                                        components={{
                                                            bold: <BoldContent />,
                                                            tooltip: (
                                                                <Tooltip
                                                                    overlay={t(
                                                                        `liquidity-pool.estimated-amount-tooltip`
                                                                    )}
                                                                    iconFontSize={14}
                                                                    marginLeft={2}
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            amount: formatCurrencyWithKey(
                                                                collateral,
                                                                userLiquidityPoolData.withdrawalAmount
                                                            ),
                                                            percentage: formatPercentage(
                                                                userLiquidityPoolData.withdrawalShare
                                                            ),
                                                        }}
                                                    />
                                                </ContentInfo>
                                                <ContentInfo>
                                                    <Trans i18nKey="liquidity-pool.withdrawal-requested-message" />
                                                </ContentInfo>
                                            </>
                                        )}
                                </>
                            )}
                        </InputButtonContainer>
                    </ContentContainer>
                </Container>
            )}
            {liquidityPoolData && (
                <CopyContainer>
                    <Description>
                        <Trans
                            i18nKey={'liquidity-pool.description-parlay'}
                            components={{
                                h1: <h1 />,
                                p: <p />,
                                tipLink: <TipLink href={LINKS.ThalesTip142} />,
                            }}
                            values={{
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
                                maxAllowedDeposit: formatCurrencyWithKey(
                                    collateral,
                                    liquidityPoolData.maxAllowedDeposit,
                                    0
                                ),
                                maxAllowedUsers: liquidityPoolData.maxAllowedUsers,
                                minDepositAmount: formatCurrencyWithKey(
                                    collateral,
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
                        <MainContentContainer>
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
                                        <span>{`${formatCurrencyWithKey(
                                            collateral,
                                            liquidityPoolData.allocationNextRound
                                        )} / ${formatCurrencyWithKey(
                                            collateral,
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
                                            {formatCurrencyWithKey(
                                                collateral,
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
                                        {formatCurrencyWithKey(
                                            collateral,
                                            userLiquidityPoolData ? userLiquidityPoolData.balanceTotal : 0
                                        )}
                                        {userLiquidityPoolData &&
                                            userLiquidityPoolData.balanceCurrentRound > 0 &&
                                            userLiquidityPoolData.balanceTotal > 0 && (
                                                <Tooltip
                                                    overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                                                    iconFontSize={14}
                                                    marginLeft={2}
                                                />
                                            )}
                                    </LiquidityPoolInfo>
                                </LiquidityPoolInfoContainer>
                                {isWithdrawalRequested && (
                                    <WarningContentInfo>
                                        <Trans
                                            i18nKey={`liquidity-pool.${
                                                userLiquidityPoolData.isPartialWithdrawalRequested ? 'partial' : 'full'
                                            }-withdrawal-request-label`}
                                            components={{
                                                tooltip: (
                                                    <Tooltip
                                                        overlay={t(`liquidity-pool.estimated-amount-tooltip`)}
                                                        iconFontSize={14}
                                                        marginLeft={2}
                                                    />
                                                ),
                                            }}
                                            values={{
                                                amount: formatCurrencyWithKey(
                                                    collateral,
                                                    userLiquidityPoolData ? userLiquidityPoolData.withdrawalAmount : 0
                                                ),
                                                percentage: formatPercentage(
                                                    userLiquidityPoolData ? userLiquidityPoolData.withdrawalShare : 0
                                                ),
                                            }}
                                        />
                                    </WarningContentInfo>
                                )}
                            </ContentInfoContainer>
                            {paramCollateral !== LiquidityPoolCollateral.THALES && (
                                <Return liquidityPoolAddress={liquidityPoolAddress} />
                            )}
                        </MainContentContainer>
                        <MainContentContainer>
                            {liquidityPoolData && (
                                <PnL
                                    lifetimePnl={liquidityPoolData.lifetimePnl}
                                    type={LiquidityPoolPnlType.PNL_PER_ROUND}
                                    liquidityPoolAddress={liquidityPoolAddress}
                                />
                            )}
                        </MainContentContainer>
                        <MainContentContainer>
                            {liquidityPoolData && (
                                <PnL
                                    lifetimePnl={liquidityPoolData.lifetimePnl}
                                    type={LiquidityPoolPnlType.CUMULATIVE_PNL}
                                    liquidityPoolAddress={liquidityPoolAddress}
                                />
                            )}
                        </MainContentContainer>
                    </>
                )}
            </MainContainer>
            {liquidityPoolData && (
                <Transactions
                    currentRound={liquidityPoolData.round}
                    liquidityPoolAddress={liquidityPoolAddress}
                    collateral={collateral}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    collateralIndex={collateralIndex}
                    tokenSymbol={collateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Wrapper>
    );
};

const getInfoGraphicPercentages = (currentBalance: number, nextRoundBalance: number) => {
    let currentBalancePercenatage = 1;
    let nextRoundBalancePercenatage = 1;

    if (currentBalance > nextRoundBalance) {
        nextRoundBalancePercenatage = nextRoundBalance / currentBalance;
    } else if (nextRoundBalance === 0) {
        currentBalancePercenatage = 0;
        nextRoundBalancePercenatage = 0;
    } else {
        currentBalancePercenatage = currentBalance / nextRoundBalance;
    }

    return {
        currentBalancePercenatage,
        nextRoundBalancePercenatage,
    };
};

export default LiquidityPool;

import { getPublicClient } from '@wagmi/core';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { USER_REJECTED_ERRORS } from 'constants/errors';
import { APPROVAL_BUFFER } from 'constants/markets';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import { DEFAULT_MAX_CREATOR_DELAY_TIME_SEC, POSITIONS_TO_SIDE_MAP, SPEED_MARKETS_QUOTE } from 'constants/speedMarkets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { SpeedPositions } from 'enums/speedMarkets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useAmmSpeedMarketsCreatorQuery from 'queries/speedMarkets/useAmmSpeedMarketsCreatorQuery';
import React, { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getTicketPayment } from 'redux/modules/ticket';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import {
    bigNumberFormatter,
    ceilNumberToDecimals,
    coinParser,
    Coins,
    COLLATERAL_DECIMALS,
    countDecimals,
    DEFAULT_CURRENCY_DECIMALS,
    formatCurrencyWithSign,
    localStore,
    LONG_CURRENCY_DECIMALS,
    NetworkId,
    roundNumberToDecimals,
    truncToDecimals,
} from 'thales-utils';
import { Rates } from 'types/collateral';
import { SupportedNetwork } from 'types/network';
import { AmmSpeedMarketsLimits, SelectedPosition } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import {
    convertCollateralToStable,
    convertFromStableToCollateral,
    getCollateral,
    getCollateralIndex,
    getDefaultCollateral,
    isStableCurrency,
} from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getContractAbi } from 'utils/contracts/abi';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarkets/speedMarketsAMMContract';
import { isErrorExcluded } from 'utils/discord';
import { checkAllowance } from 'utils/network';
import { getPriceConnection, getPriceId, priceParser } from 'utils/pyth';
import {
    refetchActiveSpeedMarkets,
    refetchBalances,
    refetchSpeedMarketsLimits,
    refetchUserSpeedMarkets,
} from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { executeBiconomyTransaction, getPaymasterData } from 'utils/smartAccount/biconomy/biconomy';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { getFeeByTimeThreshold, getTransactionForSpeedAMM } from 'utils/speedMarkets';
import { delay } from 'utils/timer';
import { Client, parseUnits, stringToHex } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type AmmSpeedTradingProps = {
    selectedAsset: string;
    selectedPosition: SelectedPosition;
    deltaTimeSec: number;
    enteredBuyinAmount: number;
    priceSlippage: number;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    setProfitAndSkewPerPosition: Dispatch<{
        profit: { [SpeedPositions.UP]: number; [SpeedPositions.DOWN]: number };
        skew: { [SpeedPositions.UP]: number; [SpeedPositions.DOWN]: number };
    }>;
    setBuyinGasFee: Dispatch<number>;
    resetData: Dispatch<void>;
    hasError: boolean;
};

const AmmSpeedTrading: React.FC<AmmSpeedTradingProps> = ({
    selectedAsset,
    selectedPosition,
    deltaTimeSec,
    enteredBuyinAmount,
    priceSlippage,
    ammSpeedMarketsLimits,
    setProfitAndSkewPerPosition,
    setBuyinGasFee,
    resetData,
    hasError,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector(getIsMobile);
    const isBiconomy = useSelector(getIsBiconomy);
    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [buyinAmount, setBuyinAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(enteredBuyinAmount);
    const [submittedStrikePrice, setSubmittedStrikePrice] = useState(0);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [outOfLiquidity, setOutOfLiquidity] = useState(false);
    const [outOfLiquidityPerDirection, setOutOfLiquidityPerDirection] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [gasFee, setGasFee] = useState(0);

    const isPositionSelected = selectedPosition !== undefined;

    const isPaidAmountEntered = paidAmount > 0;

    const isButtonDisabled =
        !isPositionSelected ||
        !deltaTimeSec ||
        !isPaidAmountEntered ||
        isSubmitting ||
        !hasAllowance ||
        outOfLiquidity ||
        hasError;

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const collateralAddress = isEth
        ? multipleCollateral.WETH.addresses[networkId]
        : multipleCollateral[selectedCollateral].addresses[networkId];

    const referral =
        isConnected && walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
            ? getReferralId()
            : null;

    const exchangeRatesMarketDataQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | null =
        exchangeRatesMarketDataQuery.isSuccess && exchangeRatesMarketDataQuery.data
            ? exchangeRatesMarketDataQuery.data
            : null;

    const convertToStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertCollateralToStable(selectedCollateral, value, rate);
        },
        [selectedCollateral, exchangeRates]
    );
    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertFromStableToCollateral(selectedCollateral, value, rate, networkId);
        },
        [selectedCollateral, exchangeRates, networkId]
    );

    const ammSpeedMarketsCreatorQuery = useAmmSpeedMarketsCreatorQuery({ networkId, client });

    const ammSpeedMarketsCreatorData = useMemo(() => {
        return ammSpeedMarketsCreatorQuery.isSuccess ? ammSpeedMarketsCreatorQuery.data : null;
    }, [ammSpeedMarketsCreatorQuery]);

    const skewImpact = useMemo(() => {
        const skewPerPosition = { [SpeedPositions.UP]: 0, [SpeedPositions.DOWN]: 0 };

        const riskPerUp = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
            (data) => data.currency === selectedAsset && data.position === SpeedPositions.UP
        )[0];
        const riskPerDown = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
            (data) => data.currency === selectedAsset && data.position === SpeedPositions.DOWN
        )[0];

        if (riskPerUp && riskPerDown) {
            skewPerPosition[SpeedPositions.UP] = ceilNumberToDecimals(
                (riskPerUp.current / riskPerUp.max) * ammSpeedMarketsLimits?.maxSkewImpact,
                4
            );
            skewPerPosition[SpeedPositions.DOWN] = ceilNumberToDecimals(
                (riskPerDown.current / riskPerDown.max) * ammSpeedMarketsLimits?.maxSkewImpact,
                4
            );
        }

        return skewPerPosition;
    }, [ammSpeedMarketsLimits?.maxSkewImpact, ammSpeedMarketsLimits?.risksPerAssetAndDirection, selectedAsset]);

    const getTotalFee = useCallback(
        (position: SpeedPositions | undefined) => {
            if (ammSpeedMarketsLimits) {
                if (deltaTimeSec) {
                    const lpFee = getFeeByTimeThreshold(
                        deltaTimeSec,
                        ammSpeedMarketsLimits?.timeThresholdsForFees,
                        ammSpeedMarketsLimits?.lpFees,
                        ammSpeedMarketsLimits?.defaultLPFee
                    );
                    const skew = position ? skewImpact[position] : 0;
                    const oppositePosition = position
                        ? position === SpeedPositions.UP
                            ? SpeedPositions.DOWN
                            : SpeedPositions.UP
                        : undefined;
                    const discount = oppositePosition ? skewImpact[oppositePosition] / 2 : 0;

                    return ceilNumberToDecimals(
                        lpFee + skew - discount + Number(ammSpeedMarketsLimits?.safeBoxImpact),
                        4
                    );
                }
            }
            return 0;
        },
        [ammSpeedMarketsLimits, deltaTimeSec, skewImpact]
    );

    const totalFee = useMemo(() => getTotalFee(selectedPosition), [selectedPosition, getTotalFee]);

    const profitPerPosition = useMemo(() => {
        const totalFeeUp = getTotalFee(SpeedPositions.UP);
        const totalFeeDown = getTotalFee(SpeedPositions.DOWN);

        return {
            [SpeedPositions.UP]: totalFeeUp ? SPEED_MARKETS_QUOTE / (1 + totalFeeUp) : 0,
            [SpeedPositions.DOWN]: totalFeeDown ? SPEED_MARKETS_QUOTE / (1 + totalFeeDown) : 0,
        };
    }, [getTotalFee]);

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isDefaultCollateral) {
            setBuyinAmount(paidAmount / (1 + totalFee));
        } else {
            setBuyinAmount(paidAmount);
        }
    }, [paidAmount, totalFee, isDefaultCollateral]);

    useEffect(() => {
        if (enteredBuyinAmount > 0) {
            setPaidAmount(enteredBuyinAmount);
        } else {
            setPaidAmount(0);
        }
    }, [enteredBuyinAmount, convertFromStable, selectedCollateral]);

    // Update profits and skew per each position
    useDebouncedEffect(() => {
        setProfitAndSkewPerPosition({ profit: profitPerPosition, skew: skewImpact });
    }, [profitPerPosition, skewImpact, setProfitAndSkewPerPosition]);

    // Save price slippage to local storage
    useEffect(() => {
        localStore.set(LOCAL_STORAGE_KEYS.SPEED_PRICE_SLIPPAGE, priceSlippage);
    }, [priceSlippage]);

    // Submit validations
    useEffect(() => {
        const convertedStablePaidAmount = convertToStable(paidAmount);
        if (convertedStablePaidAmount > 0) {
            const riskPerAssetAndDirectionData = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
                (data) => data.currency === selectedAsset && data.position === selectedPosition
            )[0];
            if (riskPerAssetAndDirectionData) {
                setOutOfLiquidityPerDirection(
                    riskPerAssetAndDirectionData?.current + convertedStablePaidAmount >
                        riskPerAssetAndDirectionData?.max
                );
            }

            const riskPerAssetData = ammSpeedMarketsLimits?.risksPerAsset.filter(
                (data) => data.currency === selectedAsset
            )[0];
            if (riskPerAssetData) {
                setOutOfLiquidity(riskPerAssetData?.current + convertedStablePaidAmount > riskPerAssetData?.max);
            }
        } else {
            setOutOfLiquidity(false);
        }
    }, [ammSpeedMarketsLimits, selectedAsset, convertToStable, paidAmount, selectedPosition]);

    // Check allowance
    useDebouncedEffect(() => {
        if (!collateralAddress) {
            return;
        }

        const collateralIndex = getCollateralIndex(
            networkId,
            isDefaultCollateral
                ? getDefaultCollateral(networkId)
                : isEth
                ? (CRYPTO_CURRENCY_MAP.WETH as Coins)
                : selectedCollateral
        );

        const collateralContract = getContractInstance(
            ContractType.MULTICOLLATERAL,
            { client, networkId },
            collateralIndex
        );

        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const getAllowance = async () => {
            if (isBiconomy) {
                setAllowance(true);
            } else {
                try {
                    const parsedAmount: bigint = coinParser(
                        roundNumberToDecimals(
                            paidAmount * (1 + APPROVAL_BUFFER),
                            isStableCurrency(selectedCollateral) ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS
                        ).toString(),
                        networkId,
                        selectedCollateral
                    );

                    const allowance: boolean = await checkAllowance(
                        parsedAmount,
                        collateralContract,
                        walletAddress,
                        addressToApprove
                    );

                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            }
        };

        if (isConnected) {
            getAllowance();
        }
    }, [
        collateralAddress,
        networkId,
        paidAmount,
        walletAddress,
        isConnected,
        hasAllowance,
        isAllowing,
        selectedCollateral,
    ]);

    const handleAllowance = async (approveAmount: bigint) => {
        if (!collateralAddress) {
            return;
        }

        const collateralIndex = getCollateralIndex(
            networkId,
            isDefaultCollateral
                ? getDefaultCollateral(networkId)
                : isEth
                ? (CRYPTO_CURRENCY_MAP.WETH as Coins)
                : selectedCollateral
        );

        const collateralContractWithSigner = getContractInstance(
            ContractType.MULTICOLLATERAL,
            { client: walletClient.data, networkId },
            collateralIndex
        );

        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const id = toast.loading(t('speed-markets.progress'));
        try {
            setIsAllowing(true);
            let hash;
            if (isBiconomy) {
                hash = await executeBiconomyTransaction({
                    collateralAddress,
                    networkId,
                    contract: collateralContractWithSigner,
                    methodName: 'approve',
                    data: [addressToApprove, approveAmount],
                });
            } else {
                hash = await collateralContractWithSigner?.write.approve([addressToApprove, approveAmount]);
            }
            setOpenApprovalModal(false);
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });
            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`market.toast-message.approve-success`)));
                setIsAllowing(false);
            } else {
                toast.update(id, getErrorToastOptions(t('common.errors.tx-reverted')));
                setIsAllowing(false);
                setOpenApprovalModal(false);
            }
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            setIsAllowing(false);
            setOpenApprovalModal(false);
        }
    };

    const onMarketCreated = useCallback(
        (toastIdParam: string | number) => {
            toast.update(toastIdParam, getSuccessToastOptions(t('speed-markets.buy.confirmation-message')));
            resetData();
            setPaidAmount(0);
            setSubmittedStrikePrice(0);
            setIsSubmitting(false);

            refetchUserSpeedMarkets(networkId, walletAddress);
            refetchActiveSpeedMarkets(networkId);
            refetchSpeedMarketsLimits(networkId);
            refetchBalances(walletAddress, networkId);
        },
        [networkId, resetData, t, walletAddress]
    );

    const handleSubmit = async () => {
        if (!isBiconomy && isButtonDisabled) return;

        setIsSubmitting(true);
        const id = toast.loading(t('speed-markets.progress'));

        const speedMarketsCreatorContractWithSigner = getContractInstance(ContractType.SPEED_MARKETS_AMM_CREATOR, {
            networkId,
            client: walletClient.data,
        }) as ViemContract;

        const speedMarketsAMMContractWithClient = getContractInstance(ContractType.SPEED_MARKETS_AMM, {
            networkId,
            client,
        }) as ViemContract;

        const numOfActiveUserMarketsBefore = Number(
            (await speedMarketsAMMContractWithClient.read.getLengths([walletAddress]))[2]
        );

        const publicClient = getPublicClient(wagmiConfig, { chainId: networkId });
        let isMarketCreated = false;

        const unwatch = publicClient.watchContractEvent({
            address: speedMarketsAMMContract.addresses[networkId],
            abi: getContractAbi(speedMarketsAMMContract, networkId),
            eventName: 'MarketCreatedWithFees',
            args: { ['_user']: walletAddress },
            onLogs: () => {
                isMarketCreated = true;
                onMarketCreated(id);
            },
        });

        try {
            const priceConnection = getPriceConnection(networkId);
            const priceId = getPriceId(networkId, selectedAsset);

            const priceFeeds = await priceConnection.getLatestPriceUpdates([priceId]);

            const pythPrice = priceFeeds.parsed
                ? bigNumberFormatter(BigInt(priceFeeds.parsed[0].price.price), PYTH_CURRENCY_DECIMALS)
                : 0;

            setSubmittedStrikePrice(pythPrice);

            const strikePrice = priceParser(pythPrice);
            const strikePriceSlippage = parseUnits(priceSlippage.toString(), 18);

            const asset = stringToHex(selectedAsset, { size: 32 });

            // guaranteed by isButtonDisabled that there are no undefined SpeedPositions
            const sides = selectedPosition !== undefined ? [POSITIONS_TO_SIDE_MAP[selectedPosition]] : [];

            const collateralAddressParam = !isDefaultCollateral ? collateralAddress : '';

            const buyInAmountParam = coinParser(
                truncToDecimals(buyinAmount, COLLATERAL_DECIMALS[selectedCollateral]),
                networkId,
                selectedCollateral
            );

            const skewImpactParam = selectedPosition
                ? parseUnits(skewImpact[selectedPosition].toString(), 18)
                : undefined;

            // contract doesn't support ETH so convert it to WETH when ETH is selected
            if (isEth && !isBiconomy) {
                const wethContractWithSigner = getContractInstance(
                    ContractType.MULTICOLLATERAL,
                    { client: walletClient.data, networkId },
                    getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
                );

                const hash = await wethContractWithSigner?.write.deposit([], { value: buyInAmountParam });
                const txReceipt = await waitForTransactionReceipt(client as Client, { hash });
                if (txReceipt.status !== 'success') {
                    console.log('Failed WETH deposit', txReceipt);
                    throw txReceipt;
                }
            }

            const hash = await getTransactionForSpeedAMM(
                speedMarketsCreatorContractWithSigner,
                asset,
                deltaTimeSec,
                sides,
                buyInAmountParam,
                strikePrice,
                strikePriceSlippage,
                collateralAddressParam,
                referral as string,
                skewImpactParam as any,
                isBiconomy,
                isEth
            );

            const txReceipt = await waitForTransactionReceipt(client as Client, { hash });

            if (txReceipt.status === 'success') {
                // if creator didn't created market for max time then check for total number of markets
                const maxCreationTime = secondsToMilliseconds(
                    ammSpeedMarketsCreatorData?.maxCreationDelay || DEFAULT_MAX_CREATOR_DELAY_TIME_SEC
                );
                let checkDelay = 2000; // check on every 2s is market created
                while (!isMarketCreated && checkDelay < maxCreationTime) {
                    await delay(checkDelay);

                    const numOfActiveUserMarketsAfter = Number(
                        (await speedMarketsAMMContractWithClient.read.getLengths([walletAddress]))[2]
                    );

                    if (!isMarketCreated && numOfActiveUserMarketsAfter - numOfActiveUserMarketsBefore > 0) {
                        unwatch();
                        isMarketCreated = true;
                        onMarketCreated(id);
                    }

                    checkDelay += checkDelay;
                }
                if (!isMarketCreated) {
                    toast.update(id, getErrorToastOptions(t('speed-markets.errors.buy-failed')));
                    setSubmittedStrikePrice(0);
                    setIsSubmitting(false);
                }

                PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.speedMarketsBuy, {
                    props: {
                        value: paidAmount,
                        collateral: getCollateral(networkId, selectedCollateralIndex),
                        networkId,
                    },
                });
            } else {
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.tx-reverted')));
                setSubmittedStrikePrice(0);
                setIsSubmitting(false);
            }
        } catch (e) {
            await delay(800);
            const isUserRejected = USER_REJECTED_ERRORS.some((rejectedError) =>
                ((e as Error).message + ((e as Error).stack || '')).includes(rejectedError)
            );
            toast.update(
                id,
                getErrorToastOptions(
                    isUserRejected ? t('common.errors.tx-canceled') : t('common.errors.unknown-error-try-again')
                )
            );
            setSubmittedStrikePrice(0);
            setIsSubmitting(false);
            if (!isErrorExcluded(e as Error)) {
                console.log(e);
            }
        }
        unwatch();
    };

    const getSubmitButton = () => {
        if (!isConnected) {
            return (
                <Button
                    onClick={() => dispatch(setWalletConnectModalVisibility({ visibility: true }))}
                    {...getDefaultButtonProps(theme)}
                >
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (!deltaTimeSec) {
            return (
                <Button disabled {...getDefaultButtonProps(theme)}>
                    {t('speed-markets.amm-trading.choose-time')}
                </Button>
            );
        }
        if (!isPaidAmountEntered) {
            return (
                <Button disabled {...getDefaultButtonProps(theme)}>
                    {t('common.enter-amount')}
                </Button>
            );
        }
        if (!isPositionSelected) {
            return (
                <Button disabled {...getDefaultButtonProps(theme)}>
                    {t('speed-markets.amm-trading.choose-direction')}
                </Button>
            );
        }
        if (outOfLiquidityPerDirection) {
            return (
                <Button disabled {...getDefaultButtonProps(theme)}>
                    {t('speed-markets.errors.out-of-liquidity-direction')}
                </Button>
            );
        }
        if (outOfLiquidity) {
            return (
                <Button disabled {...getDefaultButtonProps(theme)}>
                    {t('speed-markets.errors.out-of-liquidity')}
                </Button>
            );
        }
        if (!hasAllowance) {
            return (
                <>
                    {isEth && isMobile && <InfoText>{t('speed-markets.tooltips.eth-to-weth')}</InfoText>}
                    <Button
                        disabled={isAllowing}
                        onClick={() => setOpenApprovalModal(true)}
                        {...getDefaultButtonProps(theme)}
                    >
                        {isAllowing ? (
                            <Trans
                                i18nKey="common.enable-wallet-access.approve-progress-label"
                                values={{ currencyKey: isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral }}
                                components={{ currency: <CollateralText /> }}
                            />
                        ) : (
                            <Trans
                                i18nKey="common.enable-wallet-access.approve-label"
                                values={{ currencyKey: isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral }}
                                components={{ currency: <CollateralText /> }}
                            />
                        )}
                        {isEth && !isMobile && (
                            <Tooltip
                                overlay={t('speed-markets.tooltips.eth-to-weth')}
                                customIconStyling={{ color: theme.speedMarkets.button.textColor.active }}
                                marginLeft={4}
                                zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                            />
                        )}
                    </Button>
                </>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleSubmit} {...getDefaultButtonProps(theme)}>
                {isSubmitting
                    ? isEth && !isBiconomy
                        ? t('speed-markets.buy.wrap-eth-progress')
                        : t('speed-markets.buy.progress-label')
                    : isEth && !isBiconomy
                    ? t('speed-markets.buy.wrap-eth')
                    : t('speed-markets.buy.label')}
            </Button>
        );
    };

    useMemo(async () => {
        if (isBiconomy && !isButtonDisabled) {
            const speedMarketsCreatorContract = getContractInstance(ContractType.SPEED_MARKETS_AMM_CREATOR, {
                networkId,
                client: walletClient.data,
            }) as ViemContract;
            const asset = stringToHex(selectedAsset, { size: 32 });
            const sides = selectedPosition !== undefined ? [POSITIONS_TO_SIDE_MAP[selectedPosition]] : [];
            const strikePriceSlippage = parseUnits(priceSlippage.toString(), 18);
            const collateralAddressParam = !isDefaultCollateral ? collateralAddress : '';
            const buyInAmountParam = coinParser(
                truncToDecimals(buyinAmount, COLLATERAL_DECIMALS[selectedCollateral]),
                networkId,
                selectedCollateral
            );

            const skewImpactParam = selectedPosition
                ? parseUnits(skewImpact[selectedPosition].toString(), 18)
                : undefined;

            const paymasterData = await getPaymasterData(
                networkId,
                speedMarketsCreatorContract,
                'addPendingSpeedMarket',
                [
                    [
                        asset,
                        0,
                        deltaTimeSec,
                        sides,
                        strikePriceSlippage,
                        sides[0],
                        collateralAddressParam || ZERO_ADDRESS,
                        buyInAmountParam,
                        referral || ZERO_ADDRESS,
                        skewImpactParam,
                    ],
                ]
            );
            if (paymasterData && paymasterData.maxGasFeeUSD) {
                setGasFee(paymasterData.maxGasFeeUSD);
                setBuyinGasFee(paymasterData.maxGasFeeUSD);
            }
        }
    }, [
        isBiconomy,
        collateralAddress,
        selectedAsset,
        priceSlippage,
        buyinAmount,
        isDefaultCollateral,
        deltaTimeSec,
        networkId,
        selectedPosition,
        referral,
        selectedCollateral,
        skewImpact,
        walletClient.data,
        isButtonDisabled,
        setBuyinGasFee,
    ]);

    return (
        <Container>
            <TradingDetails>
                <span>
                    {`TODO: some trading details: submitted strike price: ${submittedStrikePrice}, price slippage: ${roundNumberToDecimals(
                        priceSlippage * 100,
                        countDecimals(priceSlippage) - 2
                    )}%`}
                    <Tooltip
                        overlay={t('speed-markets.tooltips.slippage')}
                        marginLeft={2}
                        iconFontSize={14}
                        zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                    />
                </span>
            </TradingDetails>
            <ButtonWrapper>
                {getSubmitButton()}
                {gasFee > 0 && !isButtonDisabled && (
                    <Tooltip
                        overlay={t('speed-markets.amm-trading.estimate-gas')}
                        zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                    >
                        <GasText $isStrikeThrough={networkId === NetworkId.Base}>
                            <GasIcon className={`speedmarkets-logo-icon speedmarkets-logo-icon--gas`} />
                            {formatCurrencyWithSign(USD_SIGN, gasFee, 2)}
                        </GasText>
                    </Tooltip>
                )}
            </ButtonWrapper>

            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={roundNumberToDecimals(
                        paidAmount * (1 + APPROVAL_BUFFER),
                        isStableCurrency(selectedCollateral) ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS
                    )}
                    collateralIndex={selectedCollateralIndex}
                    tokenSymbol={isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    position: relative;
`;

const TradingDetails = styled(FlexDivCentered)`
    height: 100%;
    font-size: 13px;
`;

const CollateralText = styled.span`
    text-transform: none;
    margin-left: 5px;
`;

const ButtonWrapper = styled(FlexDivColumn)`
    justify-content: end;
`;

const GasIcon = styled.i`
    font-size: 18px;
    line-height: 100%;
    color: ${(props) => props.theme.speedMarkets.button.textColor.active};
    margin-right: 2px;
`;

const InfoText = styled.span`
    font-weight: 400;
    font-size: 13px;
    letter-spacing: 0.13px;
    color: ${(props) => props.theme.speedMarkets.textColor.primary};
    padding: 5px 10px;
`;

const GasText = styled.span<{ $isStrikeThrough?: boolean }>`
    display: flex;
    position: absolute;
    right: 16px;
    bottom: 6px;
    font-size: 15px;
    line-height: 18px;
    color: ${(props) => props.theme.speedMarkets.button.textColor.active};
    text-decoration: ${(props) => (props.$isStrikeThrough ? 'line-through' : '')};
`;

const getDefaultButtonProps = (theme: ThemeInterface) => ({
    width: '100%',
    padding: '5px 30px',
    backgroundColor: theme.speedMarkets.button.background.secondary,
    borderColor: ' ',
});

export default AmmSpeedTrading;

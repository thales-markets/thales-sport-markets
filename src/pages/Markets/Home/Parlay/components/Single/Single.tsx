import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP, LONG_CURRENCY_DECIMALS, USD_SIGN } from 'constants/currency';
import {
    ALTCOIN_CONVERSION_BUFFER_PERCENTAGE,
    APPROVAL_BUFFER,
    MAX_COLLATERAL_SLIPPAGE,
    MIN_AMOUNT_MULTIPLIER,
} from 'constants/markets';
import { BigNumber, ethers } from 'ethers';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useAvailablePerPositionQuery from 'queries/markets/useAvailablePerPositionQuery';
import usePositionPriceDetailsQuery from 'queries/markets/usePositionPriceDetailsQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getParlayPayment,
    removeAll,
    setPaymentAmountToBuy,
    setPaymentIsVoucherAvailable,
    setPaymentIsVoucherSelected,
    setPaymentSelectedStableIndex,
} from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { AMMPosition, AvailablePerPosition, ParlaysMarket } from 'types/markets';
import { getAMMSportsTransaction, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import {
    ceilNumberToDecimals,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatPercentage,
    getPrecision,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getBonus, getPositionOdds } from 'utils/markets';
import { checkAllowance, getDefaultDecimalsForNetwork, getIsMultiCollateralSupported } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import ShareTicketModal from '../ShareTicketModal';
import { ShareTicketModalProps } from '../ShareTicketModal/ShareTicketModal';
import {
    AmountToBuyContainer,
    CheckboxContainer,
    InfoContainer,
    InfoLabel,
    InfoValue,
    InfoWrapper,
    InputContainer,
    RowContainer,
    RowSummary,
    ShareWrapper,
    SummaryLabel,
    SummaryValue,
    TwitterIcon,
    defaultButtonProps,
} from '../styled-components';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import { OddsType, Position } from 'enums/markets';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import { getCollateral, getCollateralDecimals, getCollaterals, isStableCurrency } from 'utils/collaterals';
import { coinParser } from 'utils/formatters/ethers';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import CollateralSelector from 'components/CollateralSelector';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import Checkbox from 'components/fields/Checkbox';

type SingleProps = {
    market: ParlaysMarket;
    onBuySuccess?: () => void;
};

const Single: React.FC<SingleProps> = ({ market, onBuySuccess }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);
    const parlayPayment = useSelector(getParlayPayment);
    const selectedCollateralIndex = parlayPayment.selectedStableIndex;
    const isVoucherSelected = parlayPayment.isVoucherSelected;
    const isVoucherAvailable = parlayPayment.isVoucherAvailable;
    const collateralAmountValue = parlayPayment.amountToBuy;

    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isAMMPaused, setIsAMMPaused] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [bonusPercentageDec, setBonusPercentageDec] = useState(0);
    const [bonusCurrency, setBonusCurrency] = useState(0);
    const [maxCollateralAmount, setMaxCollateralAmount] = useState(0);
    const [availableCollateralAmount, setAvailableCollateralAmount] = useState(0);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [tooltipTextCollateralAmount, setTooltipTextCollateralAmount] = useState('');
    const [availablePerPosition, setAvailablePerPosition] = useState<AvailablePerPosition>({
        [Position.HOME]: {
            available: 0,
        },
        [Position.AWAY]: {
            available: 0,
        },
        [Position.DRAW]: {
            available: 0,
        },
    });
    const [ammPosition, setAmmPosition] = useState<AMMPosition>({
        available: 0,
        quote: 0,
        priceImpact: 0,
    });
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: false,
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const selectedCollateralDecimals = useMemo(() => getCollateralDecimals(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isStableCollateral = isStableCurrency(selectedCollateral);

    // Used for cancelling the subscription and asynchronous tasks in a useEffect
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const ammContractsPaused = useAMMContractsPausedQuery(networkId, {
        enabled: isAppReady,
    });

    const ammContractsStatusData = useMemo(() => {
        if (ammContractsPaused.data && ammContractsPaused.isSuccess) {
            return ammContractsPaused.data;
        }
    }, [ammContractsPaused.data, ammContractsPaused.isSuccess]);

    useEffect(() => {
        if (ammContractsStatusData?.singleAMM) {
            setIsAMMPaused(true);
        }
    }, [ammContractsStatusData]);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            dispatch(setPaymentIsVoucherAvailable(true));
            dispatch(setPaymentIsVoucherSelected(true));

            return overtimeVoucherQuery.data;
        }
        dispatch(setPaymentIsVoucherAvailable(false));
        dispatch(setPaymentIsVoucherSelected(false));
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data, dispatch]);

    const paymentTokenBalance: number = useMemo(() => {
        if (overtimeVoucher && isVoucherSelected) {
            return overtimeVoucher.remainingAmount;
        }
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[selectedCollateral];
        }
        return 0;
    }, [
        multipleCollateralBalances.data,
        multipleCollateralBalances.isSuccess,
        selectedCollateral,
        overtimeVoucher,
        isVoucherSelected,
    ]);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const convertToStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return isStableCollateral ? value : value * rate * (1 - ALTCOIN_CONVERSION_BUFFER_PERCENTAGE);
        },
        [selectedCollateral, exchangeRates, isStableCollateral]
    );

    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral];
            if (isStableCollateral) {
                return value;
            } else {
                return rate
                    ? Math.ceil(
                          (value / (rate * 1 - ALTCOIN_CONVERSION_BUFFER_PERCENTAGE)) * 10 ** selectedCollateralDecimals
                      ) /
                          10 ** selectedCollateralDecimals
                    : 0;
            }
        },
        [selectedCollateral, exchangeRates, selectedCollateralDecimals, isStableCollateral]
    );

    // Clear Parlay when network is changed
    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            dispatch(removeAll());
        } else {
            isMounted.current = true;
        }
    }, [dispatch, networkId]);

    const fetchAmmQuote = useCallback(
        async (amountForQuote: number) => {
            const { sportsAMMContract } = networkConnector;
            if (sportsAMMContract && amountForQuote) {
                const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(amountForQuote).toString());
                const ammQuote = await getSportsAMMQuoteMethod(
                    selectedCollateralIndex,
                    networkId,
                    sportsAMMContract,
                    market.address,
                    market.position,
                    parsedAmount
                );

                return isMultiCollateralSupported && selectedCollateralIndex !== 0 ? ammQuote[0] : ammQuote;
            }
        },
        [isMultiCollateralSupported, market.address, market.position, networkId, selectedCollateralIndex]
    );

    useEffect(() => {
        const getMaxCollateralAmount = async () => {
            const { sportsAMMContract } = networkConnector;
            if (sportsAMMContract) {
                const roundedMaxAmount = floorNumberToDecimals(availablePerPosition[market.position].available || 0);
                const divider = isVoucherSelected
                    ? Number(`1e${getDefaultDecimalsForNetwork(networkId)}`)
                    : Number(`1e${selectedCollateralDecimals}`);
                const collateralToSpendForMaxAmount = await fetchAmmQuote(roundedMaxAmount);

                const decimalCollateralToSpendForMaxAmount = collateralToSpendForMaxAmount / divider;

                if (!mountedRef.current) return null;
                setAvailableCollateralAmount(
                    floorNumberToDecimals(
                        decimalCollateralToSpendForMaxAmount,
                        isStableCollateral ? undefined : LONG_CURRENCY_DECIMALS
                    )
                );

                if (paymentTokenBalance > decimalCollateralToSpendForMaxAmount) {
                    if (paymentTokenBalance * MAX_COLLATERAL_SLIPPAGE >= decimalCollateralToSpendForMaxAmount) {
                        setMaxCollateralAmount(
                            floorNumberToDecimals(
                                decimalCollateralToSpendForMaxAmount,
                                isStableCollateral ? undefined : LONG_CURRENCY_DECIMALS
                            )
                        );
                    } else {
                        const calculatedMaxAmount = paymentTokenBalance * MAX_COLLATERAL_SLIPPAGE;
                        setMaxCollateralAmount(
                            floorNumberToDecimals(
                                calculatedMaxAmount,
                                isStableCollateral ? undefined : LONG_CURRENCY_DECIMALS
                            )
                        );
                    }
                    return;
                }
                setMaxCollateralAmount(
                    floorNumberToDecimals(
                        paymentTokenBalance * MAX_COLLATERAL_SLIPPAGE,
                        isStableCollateral ? undefined : LONG_CURRENCY_DECIMALS
                    )
                );
            }
        };
        getMaxCollateralAmount();
    }, [
        collateralAmountValue,
        paymentTokenBalance,
        selectedCollateralIndex,
        market.address,
        market.position,
        availablePerPosition,
        fetchAmmQuote,
        isVoucherSelected,
        networkId,
        selectedCollateralDecimals,
        isStableCollateral,
    ]);

    const calculatedBonusPercentageDec = useMemo(() => getBonus(market) / 100, [market]);

    useDebouncedEffect(() => {
        const fetchData = async () => {
            const divider = isVoucherSelected
                ? Number(`1e${getDefaultDecimalsForNetwork(networkId)}`)
                : Number(`1e${selectedCollateralDecimals}`);

            const { sportsAMMContract, signer } = networkConnector;
            if (signer && sportsAMMContract) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                contract.connect(signer);
                const roundedMaxAmount = floorNumberToDecimals(availablePerPosition[market.position].available || 0);
                if (roundedMaxAmount) {
                    const [
                        collateralToSpendForMaxAmount,
                        collateralToSpendForMinAmount,
                        ammBalances,
                    ] = await Promise.all([
                        fetchAmmQuote(roundedMaxAmount),
                        fetchAmmQuote(MIN_TOKEN_AMOUNT),
                        contract.balancesOf(sportsAMMContract?.address),
                    ]);
                    if (!mountedRef.current) return null;

                    const ammBalanceForSelectedPosition = ammBalances[market.position];
                    const amountOfTokens =
                        fetchAmountOfTokensForXsUSDAmount(
                            Number(collateralAmountValue),
                            collateralToSpendForMinAmount / divider,
                            collateralToSpendForMaxAmount / divider,
                            availablePerPosition[market.position].available || 0,
                            ammBalanceForSelectedPosition / divider
                        ) || 0;

                    if (amountOfTokens > (availablePerPosition[market.position].available || 0)) {
                        setTokenAmount(0);
                        return;
                    }
                    const flooredAmountOfTokens = floorNumberToDecimals(amountOfTokens);

                    const quote = await fetchAmmQuote(flooredAmountOfTokens);
                    if (!mountedRef.current) return null;

                    const parsedQuote = quote / divider;

                    const recalculatedTokenAmount = roundNumberToDecimals(
                        (amountOfTokens * Number(collateralAmountValue)) / parsedQuote
                    );
                    const maxAvailableTokenAmount =
                        recalculatedTokenAmount > flooredAmountOfTokens
                            ? flooredAmountOfTokens
                            : recalculatedTokenAmount;
                    setTokenAmount(maxAvailableTokenAmount);

                    if (Number(collateralAmountValue) > 0) {
                        const newQuote = maxAvailableTokenAmount / Number(collateralAmountValue);
                        const calculatedReducedBonus =
                            (calculatedBonusPercentageDec * newQuote) /
                            Number(formatMarketOdds(OddsType.Decimal, getPositionOdds(market)));
                        setBonusPercentageDec(calculatedReducedBonus);

                        const calculatedBonusCurrency = maxAvailableTokenAmount * calculatedReducedBonus;
                        setBonusCurrency(calculatedBonusCurrency);
                    } else {
                        setBonusPercentageDec(calculatedBonusPercentageDec);
                        setBonusCurrency(0);
                    }
                }
            }
        };

        fetchData().catch((e) => console.log(e));
    }, [collateralAmountValue, selectedCollateralIndex, fetchAmmQuote, availablePerPosition, market]);

    const positionPriceDetailsQuery = usePositionPriceDetailsQuery(
        market.address,
        market.position,
        tokenAmount || 1,
        selectedCollateralIndex,
        networkId,
        {
            enabled: isAppReady,
        }
    );

    useEffect(() => {
        if (positionPriceDetailsQuery.isSuccess && positionPriceDetailsQuery.data) {
            setAmmPosition(positionPriceDetailsQuery.data);
        }
    }, [positionPriceDetailsQuery.isSuccess, positionPriceDetailsQuery.data]);

    const availablePerPositionQuery = useAvailablePerPositionQuery(market.address, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (availablePerPositionQuery.isSuccess && availablePerPositionQuery.data) {
            setAvailablePerPosition(availablePerPositionQuery.data);
        }
    }, [availablePerPositionQuery.isSuccess, availablePerPositionQuery.data]);

    useEffect(() => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            let collateralContractWithSigner: ethers.Contract | undefined;
            if (selectedCollateralIndex !== 0 && multipleCollateral && isMultiCollateralSupported) {
                collateralContractWithSigner = multipleCollateral[selectedCollateral]?.connect(signer);
            } else {
                collateralContractWithSigner = sUSDContract?.connect(signer);
            }

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = coinParser(
                        Number(collateralAmountValue).toString(),
                        networkId,
                        selectedCollateral
                    );
                    const allowance = await checkAllowance(
                        parsedTicketPrice,
                        collateralContractWithSigner,
                        walletAddress,
                        sportsAMMContract.address
                    );
                    if (!mountedRef.current) return null;
                    setHasAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && collateralAmountValue) {
                isVoucherSelected || selectedCollateral === CRYPTO_CURRENCY_MAP.ETH
                    ? setHasAllowance(true)
                    : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        collateralAmountValue,
        selectedCollateralIndex,
        isVoucherSelected,
        isMultiCollateralSupported,
        networkId,
        selectedCollateral,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;
                if (
                    selectedCollateralIndex !== 0 &&
                    multipleCollateral &&
                    multipleCollateral[selectedCollateral] &&
                    isMultiCollateralSupported
                ) {
                    collateralContractWithSigner = multipleCollateral[selectedCollateral]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = sportsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(
                    addressToApprove,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const handleSubmit = async () => {
        const { sportsAMMContract, overtimeVoucherContract, signer } = networkConnector;
        if (sportsAMMContract && overtimeVoucherContract && signer) {
            setIsBuying(true);
            const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
            const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);
            const ammQuote = await fetchAmmQuote(tokenAmount || 1);
            const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(tokenAmount).toString());
            const id = toast.loading(t('market.toast-message.transaction-pending'));

            try {
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;
                const tx = await getAMMSportsTransaction(
                    isVoucherSelected,
                    overtimeVoucher ? overtimeVoucher.id : 0,
                    selectedCollateralIndex,
                    networkId,
                    sportsAMMContractWithSigner,
                    overtimeVoucherContractWithSigner,
                    market.address,
                    market.position,
                    parsedAmount,
                    ammQuote,
                    referralId,
                    ethers.utils.parseEther('0.02')
                );

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchBalances(walletAddress, networkId);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')));
                    setIsBuying(false);
                    setCollateralAmount('');
                    setTokenAmount(0);
                    dispatch(removeAll());
                    onBuySuccess && onBuySuccess();

                    PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.singleBuy, {
                        props: {
                            value: Number(ammPosition.quote),
                            collateral: selectedCollateral,
                            networkId,
                        },
                    });
                    trackEvent({
                        category: 'parlay-single',
                        action: `buy-with-${selectedCollateral}`,
                        value: Number(formatCurrency(ammPosition.quote, 3, true)),
                    });
                }
            } catch (e) {
                setIsBuying(false);
                refetchBalances(walletAddress, networkId);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log('Error ', e);
            }
        }
    };

    const MIN_TOKEN_AMOUNT = 1;
    useEffect(() => {
        // If AMM is paused
        if (isAMMPaused) {
            setSubmitDisabled(true);
            return;
        }

        // Minimum of token amount
        if (
            !Number(collateralAmountValue) ||
            !tokenAmount ||
            (isStableCollateral && tokenAmount < MIN_TOKEN_AMOUNT) ||
            isBuying ||
            isAllowing ||
            positionPriceDetailsQuery.isLoading
        ) {
            setSubmitDisabled(true);
            return;
        }
        // Enable Approve if it hasn't allowance
        if (!hasAllowance) {
            setSubmitDisabled(false);
            return;
        }

        setSubmitDisabled(!paymentTokenBalance || Number(collateralAmountValue) > Number(paymentTokenBalance));
    }, [
        collateralAmountValue,
        isBuying,
        isAllowing,
        hasAllowance,
        paymentTokenBalance,
        tokenAmount,
        positionPriceDetailsQuery.isLoading,
        isAMMPaused,
        isStableCollateral,
    ]);

    const getSubmitButton = () => {
        if (isAMMPaused) {
            return (
                <Button disabled={submitDisabled} {...defaultButtonProps}>
                    {t('common.errors.single-amm-paused')}
                </Button>
            );
        }

        if (!isWalletConnected) {
            return (
                <Button onClick={() => openConnectModal?.()} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        // Show Approve only on valid input buy amount
        if (!hasAllowance && collateralAmountValue && (tokenAmount >= MIN_TOKEN_AMOUNT || !isStableCollateral)) {
            return (
                <Button disabled={submitDisabled} onClick={() => setOpenApprovalModal(true)} {...defaultButtonProps}>
                    {t('common.wallet.approve')}
                </Button>
            );
        }

        return (
            <Button disabled={submitDisabled} onClick={async () => handleSubmit()} {...defaultButtonProps}>
                {t(`common.buy-side`)}
            </Button>
        );
    };

    const setTooltipTextMessageCollateralAmount = useCallback(
        (value: string | number) => {
            const positionOdds = roundNumberToDecimals(getPositionOdds(market));
            // Due to conversion adding buffer for min amount in case of non stable collateral
            const minCollateralAmount =
                convertFromStable(positionOdds) * (isStableCollateral ? 1 : MIN_AMOUNT_MULTIPLIER);
            if (value && Number(value) < minCollateralAmount) {
                setTooltipTextCollateralAmount(
                    t('markets.parlay.validation.single-min-amount', {
                        min: isStableCollateral
                            ? formatCurrencyWithSign(USD_SIGN, positionOdds, 2)
                            : `${formatCurrencyWithKey(
                                  selectedCollateral,
                                  ceilNumberToDecimals(minCollateralAmount, getPrecision(minCollateralAmount))
                              )} (${formatCurrencyWithSign(USD_SIGN, positionOdds, 2)})`,
                    })
                );
            } else if (Number(value) > availableCollateralAmount) {
                setTooltipTextCollateralAmount(t('markets.parlay.validation.amount-exceeded'));
            } else if (Number(value) > paymentTokenBalance) {
                setTooltipTextCollateralAmount(t('markets.parlay.validation.no-funds'));
            } else {
                setTooltipTextCollateralAmount('');
            }
        },
        [
            market,
            availableCollateralAmount,
            t,
            paymentTokenBalance,
            convertFromStable,
            isStableCollateral,
            selectedCollateral,
        ]
    );

    useEffect(() => {
        setTooltipTextMessageCollateralAmount(collateralAmountValue);
    }, [isVoucherSelected, setTooltipTextMessageCollateralAmount, collateralAmountValue]);

    const setCollateralAmount = (value: string | number) => {
        dispatch(setPaymentAmountToBuy(value));
        setTooltipTextMessageCollateralAmount(value);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const hidePayout =
        !tokenAmount ||
        positionPriceDetailsQuery.isLoading ||
        // hide when validation tooltip exists except in case of not enough funds
        (!!tooltipTextCollateralAmount && Number(collateralAmountValue) <= Number(paymentTokenBalance));
    const hideProfit =
        ammPosition.quote <= 0 ||
        !tokenAmount ||
        positionPriceDetailsQuery.isLoading ||
        // hide when validation tooltip exists except in case of not enough funds
        (!!tooltipTextCollateralAmount && Number(collateralAmountValue) <= Number(paymentTokenBalance));

    const profitPercentage =
        (tokenAmount - (isStableCollateral ? ammPosition.quote : convertToStable(ammPosition.quote))) /
        (isStableCollateral ? ammPosition.quote : convertToStable(ammPosition.quote));

    const onModalClose = useCallback(() => {
        setShowShareTicketModal(false);
    }, []);

    const twitterShareDisabled = submitDisabled || !hasAllowance;
    const onTwitterIconClick = () => {
        // create data copy to avoid modal re-render while opened
        const modalData: ShareTicketModalProps = {
            markets: [market],
            multiSingle: false,
            totalQuote: getPositionOdds(market),
            paid: Number(collateralAmountValue),
            payout: tokenAmount,
            onClose: onModalClose,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(!twitterShareDisabled);
    };

    return (
        <>
            <RowSummary columnDirection={true}>
                <RowContainer>
                    <SummaryLabel>{t('markets.parlay.total-quote')}:</SummaryLabel>
                    <SummaryValue>{formatMarketOdds(selectedOddsType, getPositionOdds(market))}</SummaryValue>
                </RowContainer>
                <RowContainer>
                    <SummaryLabel>{t('markets.parlay.total-bonus')}:</SummaryLabel>
                    <SummaryValue>{formatPercentage(bonusPercentageDec)}</SummaryValue>
                    <SummaryValue isCurrency={true} isHidden={bonusCurrency === 0 || hidePayout}>
                        ({formatCurrencyWithSign('+ ' + USD_SIGN, bonusCurrency)})
                    </SummaryValue>
                </RowContainer>
            </RowSummary>
            {isVoucherAvailable && (
                <RowSummary>
                    <RowContainer>
                        <SummaryLabel>{t('markets.parlay.pay-with-voucher')}:</SummaryLabel>
                        <CheckboxContainer>
                            <Checkbox
                                // disabled={isAllowing}
                                checked={isVoucherSelected}
                                value={isVoucherSelected.toString()}
                                onChange={(e: any) => {
                                    dispatch(setPaymentIsVoucherSelected(e.target.checked || false));
                                    dispatch(setPaymentSelectedStableIndex(0));
                                }}
                            />
                        </CheckboxContainer>
                    </RowContainer>
                </RowSummary>
            )}
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.buy-in')}:</SummaryLabel>
            </RowSummary>
            <InputContainer ref={inputRef}>
                <AmountToBuyContainer>
                    <NumericInput
                        value={collateralAmountValue}
                        onChange={(e) => {
                            setCollateralAmount(e.target.value);
                        }}
                        onMaxButton={() => setCollateralAmount(maxCollateralAmount)}
                        showValidation={inputRefVisible && !!tooltipTextCollateralAmount && !openApprovalModal}
                        validationMessage={tooltipTextCollateralAmount}
                        inputFontSize="18px"
                        inputFontWeight="700"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                        currencyComponent={
                            <CollateralSelector
                                collateralArray={getCollaterals(networkId)}
                                selectedItem={selectedCollateralIndex}
                                onChangeCollateral={() => {}}
                                disabled={isVoucherSelected}
                                isDetailedView
                                collateralBalances={multipleCollateralBalances.data}
                                exchangeRates={exchangeRates}
                                dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                            />
                        }
                    />
                </AmountToBuyContainer>
            </InputContainer>
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.available')}:</InfoLabel>
                    <InfoValue>
                        {isStableCollateral
                            ? formatCurrencyWithSign(USD_SIGN, availableCollateralAmount)
                            : `${formatCurrencyWithKey(
                                  selectedCollateral,
                                  availableCollateralAmount
                              )} (${formatCurrencyWithSign(USD_SIGN, convertToStable(availableCollateralAmount))})`}
                    </InfoValue>
                </InfoWrapper>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.skew')}:</InfoLabel>
                    <InfoValue>
                        {positionPriceDetailsQuery.isLoading ? '-' : formatPercentage(ammPosition.priceImpact)}
                    </InfoValue>
                </InfoWrapper>
            </InfoContainer>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.total-to-pay')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : isStableCollateral
                        ? formatCurrencyWithSign(USD_SIGN, collateralAmountValue)
                        : `${formatCurrencyWithKey(
                              selectedCollateral,
                              collateralAmountValue
                          )} (${formatCurrencyWithSign(USD_SIGN, convertToStable(Number(collateralAmountValue)))})`}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout ? '-' : formatCurrencyWithSign(USD_SIGN, tokenAmount, 2)}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.potential-profit')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hideProfit
                        ? '-'
                        : `${formatCurrencyWithSign(
                              USD_SIGN,
                              tokenAmount -
                                  (isStableCollateral ? ammPosition.quote : convertToStable(ammPosition.quote)),
                              2
                          )} (${formatPercentage(profitPercentage)})`}
                </SummaryValue>
            </RowSummary>
            <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>
            <ShareWrapper>
                <TwitterIcon disabled={twitterShareDisabled} onClick={onTwitterIconClick} />
            </ShareWrapper>
            {showShareTicketModal && (
                <ShareTicketModal
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    totalQuote={shareTicketModalData.totalQuote}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={onModalClose}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(collateralAmountValue) + Number(collateralAmountValue) * APPROVAL_BUFFER}
                    collateralIndex={selectedCollateralIndex}
                    tokenSymbol={selectedCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

export default Single;

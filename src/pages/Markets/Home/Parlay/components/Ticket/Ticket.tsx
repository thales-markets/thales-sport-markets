import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER } from 'constants/markets';
import { BigNumber, ethers } from 'ethers';
import useParlayAmmDataQuery from 'queries/markets/useParlayAmmDataQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getParlayPayment, removeAll, setPaymentAmountToBuy } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { bigNumberFormatter, coinFormatter, coinParser } from 'utils/formatters/ethers';
import {
    ceilNumberToDecimals,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatPercentage,
    getPrecision,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getBonus } from 'utils/markets';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { getParlayAMMTransaction, getParlayMarketsAMMQuoteMethod } from 'utils/parlayAmm';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import ShareTicketModal from '../ShareTicketModal';
import { ShareTicketModalProps } from '../ShareTicketModal/ShareTicketModal';
import {
    AmountToBuyContainer,
    InfoContainer,
    InfoLabel,
    InfoTooltip,
    InfoValue,
    InfoWrapper,
    InputContainer,
    RowContainer,
    RowSummary,
    ShareWrapper,
    SummaryLabel,
    SummaryValue,
    TwitterIcon,
    XButton,
    defaultButtonProps,
} from '../styled-components';
import { isSGPInParlayMarkets } from 'utils/combinedMarkets';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import { OddsType } from 'enums/markets';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import {
    getCollateral,
    getCollateralAddress,
    getCollateralIndex,
    getCollaterals,
    getDefaultCollateral,
} from 'utils/collaterals';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import CollateralSelector from 'components/CollateralSelector';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import { Coins } from 'types/tokens';
import Voucher from '../Voucher';

type TicketProps = {
    markets: ParlaysMarket[];
    setMarketsOutOfLiquidity: (indexes: number[]) => void;
    onBuySuccess?: () => void;
};

const TicketErrorMessage = {
    RISK_PER_COMB: 'RiskPerComb exceeded',
    SAME_TEAM_IN_PARLAY: 'SameTeamOnParlay',
};

const Ticket: React.FC<TicketProps> = ({ markets, setMarketsOutOfLiquidity, onBuySuccess }) => {
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
    const selectedCollateralIndex = parlayPayment.selectedCollateralIndex;
    const isVoucherSelected = parlayPayment.isVoucherSelected;
    const collateralAmountValue = parlayPayment.amountToBuy;

    const [totalBuyAmount, setTotalBuyAmount] = useState(0);
    const [usdAmountValue, setUsdAmountValue] = useState<number>(0);
    const [minUsdAmountValue, setMinUsdAmountValue] = useState<number>(0);
    const [minCollateralAmountValue, setMinCollateralAmountValue] = useState<number>(0);
    const [totalQuote, setTotalQuote] = useState(0);
    const [finalQuotes, setFinalQuotes] = useState<number[]>([]);
    const [skew, setSkew] = useState(0);
    const [totalBonusPercentageDec, setTotalBonusPercentageDec] = useState(0);
    const [totalBonusCurrency, setTotalBonusCurrency] = useState(0);

    const [isAMMPaused, setIsAMMPaused] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [tooltipTextCollateralAmount, setTooltipTextCollateralAmount] = useState<string>('');

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: false,
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const collateralAddress = useMemo(
        () =>
            getCollateralAddress(
                networkId,
                isEth ? getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins) : selectedCollateralIndex
            ),
        [networkId, selectedCollateralIndex, isEth]
    );
    const isDefaultCollateral = selectedCollateral === defaultCollateral;

    // Due to conversion from non default stable to collateral user needs 2% more funds in wallet
    const COLLATERAL_CONVERSION_MULTIPLIER = isDefaultCollateral ? 1 : 1.02;

    const hasParlayCombinedMarkets = isSGPInParlayMarkets(markets);

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
        if (ammContractsStatusData?.parlayAMM || ammContractsStatusData?.singleAMM) {
            setIsAMMPaused(true);
        }
    }, [ammContractsStatusData]);

    const parlayAmmDataQuery = useParlayAmmDataQuery(networkId, {
        enabled: isAppReady,
    });
    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const parlayAmmData = useMemo(() => {
        if (parlayAmmDataQuery.isSuccess && parlayAmmDataQuery.data) {
            return parlayAmmDataQuery.data;
        }
        return undefined;
    }, [parlayAmmDataQuery.isSuccess, parlayAmmDataQuery.data]);

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

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

    useEffect(() => {
        setMinUsdAmountValue(parlayAmmData?.minUsdAmount || 0);
    }, [parlayAmmData?.minUsdAmount]);

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

    const fetchParlayAmmQuote = useCallback(
        async (collateralAmountForQuote: number) => {
            if (Number(collateralAmountForQuote) <= 0) return;

            const { parlayMarketsAMMContract, multiCollateralOnOffRampContract } = networkConnector;
            if (parlayMarketsAMMContract && multiCollateralOnOffRampContract && minUsdAmountValue) {
                const marketsAddresses = markets.map((market) => market.address);
                const selectedPositions = markets.map((market) => market.position);

                try {
                    const [minimumReceivedForCollateralAmount, minimumNeededForMinUsdAmountValue] = await Promise.all([
                        isDefaultCollateral
                            ? 0
                            : multiCollateralOnOffRampContract.getMinimumReceived(
                                  collateralAddress,
                                  coinParser(collateralAmountForQuote.toString(), networkId, selectedCollateral)
                              ),
                        isDefaultCollateral
                            ? 0
                            : multiCollateralOnOffRampContract.getMinimumNeeded(
                                  collateralAddress,
                                  coinParser(minUsdAmountValue.toString(), networkId)
                              ),
                    ]);

                    const usdPaid = isDefaultCollateral
                        ? coinParser(collateralAmountForQuote.toString(), networkId)
                        : minimumReceivedForCollateralAmount;
                    const minUsdPaid = coinParser(minUsdAmountValue.toString(), networkId);

                    setUsdAmountValue(coinFormatter(usdPaid, networkId));
                    setMinCollateralAmountValue(
                        isDefaultCollateral
                            ? minUsdAmountValue
                            : coinFormatter(minimumNeededForMinUsdAmountValue, networkId, selectedCollateral)
                    );

                    const [parlayAmmQuote, minParlayAmmQuote] = await Promise.all([
                        getParlayMarketsAMMQuoteMethod(
                            collateralAddress,
                            isDefaultCollateral,
                            parlayMarketsAMMContract,
                            marketsAddresses,
                            selectedPositions,
                            usdPaid
                        ),
                        getParlayMarketsAMMQuoteMethod(
                            collateralAddress,
                            isDefaultCollateral,
                            parlayMarketsAMMContract,
                            marketsAddresses,
                            selectedPositions,
                            minUsdPaid
                        ),
                    ]);

                    return {
                        ...parlayAmmQuote,
                        usdPaid,
                        minimumCollateralAmountTotalQuote: minParlayAmmQuote['totalQuote'],
                    };
                } catch (e: any) {
                    const errorMessage = e.error?.data?.message;
                    if (errorMessage) {
                        if (errorMessage.includes(TicketErrorMessage.RISK_PER_COMB)) {
                            return { error: TicketErrorMessage.RISK_PER_COMB };
                        } else if (errorMessage.includes(TicketErrorMessage.SAME_TEAM_IN_PARLAY)) {
                            return { error: TicketErrorMessage.SAME_TEAM_IN_PARLAY };
                        }
                    }
                    console.log(e);
                    return { error: errorMessage };
                }
            }
        },
        [networkId, markets, minUsdAmountValue, selectedCollateral, collateralAddress, isDefaultCollateral]
    );

    useEffect(() => {
        const { parlayMarketsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (parlayMarketsAMMContract && multipleCollateral && signer) {
            const collateralContractWithSigner = isDefaultCollateral
                ? sUSDContract?.connect(signer)
                : multipleCollateral[selectedCollateral]?.connect(signer);

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
                        parlayMarketsAMMContract.address
                    );
                    if (!mountedRef.current) return null;
                    setHasAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && collateralAmountValue) {
                isVoucherSelected || isEth ? setHasAllowance(true) : getAllowance();
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
        networkId,
        selectedCollateral,
        isEth,
        isDefaultCollateral,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { parlayMarketsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (parlayMarketsAMMContract && multipleCollateral && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const collateralContractWithSigner = isDefaultCollateral
                    ? sUSDContract?.connect(signer)
                    : multipleCollateral[selectedCollateral]?.connect(signer);

                const addressToApprove = parlayMarketsAMMContract.address;

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
        const { parlayMarketsAMMContract, overtimeVoucherContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && overtimeVoucherContract && signer) {
            setIsBuying(true);
            const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);
            const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);

            const id = toast.loading(t('market.toast-message.transaction-pending'));

            try {
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;
                const marketsAddresses = markets.map((market) => market.address);
                const selectedPositions = markets.map((market) => market.position);
                const collateralPaid = coinParser(collateralAmountValue.toString(), networkId, selectedCollateral);
                const usdPaid = coinParser(usdAmountValue.toString(), networkId);
                const expectedPayout = ethers.utils.parseEther(roundNumberToDecimals(totalBuyAmount).toString());
                const additionalSlippage = ethers.utils.parseEther('0.02');

                const tx = await getParlayAMMTransaction(
                    isVoucherSelected,
                    overtimeVoucher ? overtimeVoucher.id : 0,
                    collateralAddress,
                    isDefaultCollateral,
                    isEth,
                    networkId,
                    parlayMarketsAMMContractWithSigner,
                    overtimeVoucherContractWithSigner,
                    marketsAddresses,
                    selectedPositions,
                    usdPaid,
                    collateralPaid,
                    expectedPayout,
                    referralId,
                    additionalSlippage
                );

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    if (hasParlayCombinedMarkets) {
                        trackEvent({
                            category: 'parlay',
                            action: 'parlay-has-combined-position',
                            value: Number(collateralAmountValue),
                        });
                    }

                    PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.parlayBuy, {
                        props: {
                            value: Number(collateralAmountValue),
                            collateral: selectedCollateral,
                            networkId,
                        },
                    });

                    trackEvent({
                        category: 'parlay',
                        action: `buy-with-${selectedCollateral}`,
                        value: Number(collateralAmountValue),
                    });
                    refetchBalances(walletAddress, networkId);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')));
                    setIsBuying(false);
                    setCollateralAmount('');
                    dispatch(removeAll());
                    onBuySuccess && onBuySuccess();
                }
            } catch (e) {
                setIsBuying(false);
                refetchBalances(walletAddress, networkId);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log('Error ', e);
            }
        }
    };

    useEffect(() => {
        if (isAMMPaused) {
            setSubmitDisabled(true);
            return;
        }

        // Minimum of sUSD
        if (
            !Number(collateralAmountValue) ||
            Number(collateralAmountValue) < minCollateralAmountValue ||
            isBuying ||
            isAllowing
        ) {
            setSubmitDisabled(true);
            return;
        }

        // Enable Approve if it hasn't allowance
        if (!hasAllowance) {
            setSubmitDisabled(false);
            return;
        }

        // Validation message is present
        if (tooltipTextCollateralAmount) {
            setSubmitDisabled(true);
            return;
        }

        // Not enough funds
        setSubmitDisabled(
            !paymentTokenBalance ||
                Number(collateralAmountValue) * COLLATERAL_CONVERSION_MULTIPLIER > paymentTokenBalance
        );
    }, [
        collateralAmountValue,
        isBuying,
        isAllowing,
        hasAllowance,
        paymentTokenBalance,
        totalQuote,
        tooltipTextCollateralAmount,
        minUsdAmountValue,
        COLLATERAL_CONVERSION_MULTIPLIER,
        isAMMPaused,
        minCollateralAmountValue,
    ]);

    const getSubmitButton = () => {
        if (isAMMPaused) {
            return (
                <Button disabled={submitDisabled} {...defaultButtonProps}>
                    {t('markets.parlay.validation.amm-contract-paused')}
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
        if (!hasAllowance && collateralAmountValue && Number(collateralAmountValue) >= minCollateralAmountValue) {
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

    const isValidProfit: boolean = useMemo(() => {
        return (
            parlayAmmData?.maxSupportedAmount !== undefined &&
            totalBuyAmount - Number(usdAmountValue) > parlayAmmData?.maxSupportedAmount
        );
    }, [parlayAmmData?.maxSupportedAmount, totalBuyAmount, usdAmountValue]);

    const setTooltipTextMessageUsdAmount = useCallback(
        (value: string | number, quotes: number[], error?: string) => {
            if (error) {
                switch (error) {
                    case TicketErrorMessage.RISK_PER_COMB:
                        setTooltipTextCollateralAmount(t('markets.parlay.validation.risk-per-comb'));
                        return;
                    case TicketErrorMessage.SAME_TEAM_IN_PARLAY:
                        setTooltipTextCollateralAmount(t('markets.parlay.validation.same-team'));
                        return;
                    default:
                        setTooltipTextCollateralAmount(t('markets.parlay.validation.not-supported', { error }));
                }
            } else if (quotes.some((quote) => quote === 0)) {
                setTooltipTextCollateralAmount(t('markets.parlay.validation.availability'));
            } else if (value && Number(value) < minCollateralAmountValue) {
                const decimals = getPrecision(minCollateralAmountValue);
                setTooltipTextCollateralAmount(
                    t('markets.parlay.validation.min-amount', {
                        min: `${formatCurrencyWithKey(
                            selectedCollateral,
                            ceilNumberToDecimals(minCollateralAmountValue, decimals),
                            decimals
                        )}${
                            isDefaultCollateral
                                ? ''
                                : ` (${formatCurrencyWithSign(USD_SIGN, ceilNumberToDecimals(minUsdAmountValue), 2)})`
                        }`,
                    })
                );
            } else if (isValidProfit) {
                setTooltipTextCollateralAmount(
                    t('markets.parlay.validation.max-profit', {
                        max: formatCurrencyWithSign(USD_SIGN, parlayAmmData?.maxSupportedAmount || 0),
                    })
                );
            } else if (Number(value) * COLLATERAL_CONVERSION_MULTIPLIER > paymentTokenBalance) {
                setTooltipTextCollateralAmount(
                    COLLATERAL_CONVERSION_MULTIPLIER === 1
                        ? t('markets.parlay.validation.no-funds')
                        : t('markets.parlay.validation.no-funds-multi-collateral', {
                              percentage: COLLATERAL_CONVERSION_MULTIPLIER * 100 - 100,
                          })
                );
            } else {
                setTooltipTextCollateralAmount('');
            }
        },
        [
            parlayAmmData?.maxSupportedAmount,
            minUsdAmountValue,
            t,
            paymentTokenBalance,
            isValidProfit,
            COLLATERAL_CONVERSION_MULTIPLIER,
            minCollateralAmountValue,
            selectedCollateral,
            isDefaultCollateral,
        ]
    );

    const calculatedBonusPercentageDec = useMemo(() => {
        let totalBonusDec = 1;
        markets.forEach((market) => {
            const bonusDecimal = getBonus(market) / 100 + 1;
            totalBonusDec *= bonusDecimal;
        });
        return totalBonusDec - 1;
    }, [markets]);

    useEffect(() => {
        let isSubscribed = true; // Use for race condition

        const fetchData = async () => {
            setIsFetching(true);
            const { parlayMarketsAMMContract } = networkConnector;
            if (parlayMarketsAMMContract && Number(collateralAmountValue) >= 0 && minUsdAmountValue) {
                const parlayAmmQuote = await fetchParlayAmmQuote(Number(collateralAmountValue));

                if (!mountedRef.current || !isSubscribed || !parlayAmmQuote) return null;

                if (!parlayAmmQuote.error) {
                    const parlayAmmTotalQuote = bigNumberFormatter(parlayAmmQuote['totalQuote']);
                    const parlayAmmTotalBuyAmount = bigNumberFormatter(parlayAmmQuote['totalBuyAmount']);
                    const usdPaid = coinFormatter(parlayAmmQuote['usdPaid'], networkId);

                    setTotalQuote(parlayAmmTotalQuote);

                    // Skew impact calculation if it's SGP
                    if (hasParlayCombinedMarkets) {
                        const marketsAddresses = markets.map((market) => market.address);
                        const selectedPositions = markets.map((market) => market.position);
                        const usdPaidParsed = coinParser((Number(usdPaid) || minUsdAmountValue).toString(), networkId);

                        const newSkewData = await parlayMarketsAMMContract?.calculateSkewImpact(
                            marketsAddresses,
                            selectedPositions,
                            usdPaidParsed
                        );
                        setSkew(bigNumberFormatter(newSkewData || 0));
                    } else {
                        setSkew(bigNumberFormatter(parlayAmmQuote['skewImpact'] || 0));
                    }
                    setTotalBuyAmount(parlayAmmTotalBuyAmount);

                    const fetchedFinalQuotes: number[] = (parlayAmmQuote['finalQuotes'] || []).map((quote: BigNumber) =>
                        bigNumberFormatter(quote)
                    );
                    // Update markets (using order index) which are out of liquidity
                    const marketsOutOfLiquidity = fetchedFinalQuotes
                        .map((finalQuote, index) => (finalQuote === 0 ? index : -1))
                        .filter((index) => index !== -1);
                    setMarketsOutOfLiquidity(marketsOutOfLiquidity);
                    setFinalQuotes(fetchedFinalQuotes);

                    const baseQuote = bigNumberFormatter(parlayAmmQuote['minimumCollateralAmountTotalQuote']);
                    const calculatedReducedTotalBonus =
                        (calculatedBonusPercentageDec *
                            Number(formatMarketOdds(OddsType.Decimal, parlayAmmTotalQuote))) /
                        Number(formatMarketOdds(OddsType.Decimal, baseQuote));
                    setTotalBonusPercentageDec(calculatedReducedTotalBonus);

                    const calculatedBonusCurrency = parlayAmmTotalBuyAmount * calculatedReducedTotalBonus;
                    setTotalBonusCurrency(calculatedBonusCurrency);

                    setTooltipTextMessageUsdAmount(collateralAmountValue, fetchedFinalQuotes);
                } else {
                    setMarketsOutOfLiquidity([]);
                    setTotalQuote(0);
                    setSkew(0);
                    setTotalBuyAmount(0);
                    setTooltipTextMessageUsdAmount(0, [], parlayAmmQuote.error);
                    setTotalBonusPercentageDec(calculatedBonusPercentageDec);
                    setTotalBonusCurrency(0);
                }
            }
            setIsFetching(false);
        };
        fetchData().catch((e) => console.log(e));

        return () => {
            isSubscribed = false;
        };
    }, [
        collateralAmountValue,
        fetchParlayAmmQuote,
        setTooltipTextMessageUsdAmount,
        minUsdAmountValue,
        setMarketsOutOfLiquidity,
        calculatedBonusPercentageDec,
        hasParlayCombinedMarkets,
        markets,
        networkId,
    ]);

    useEffect(() => {
        setTooltipTextMessageUsdAmount(collateralAmountValue, finalQuotes);
    }, [isVoucherSelected, setTooltipTextMessageUsdAmount, collateralAmountValue, finalQuotes]);

    const setCollateralAmount = (value: string | number) => {
        dispatch(setPaymentAmountToBuy(value));
        setTooltipTextMessageUsdAmount(value, finalQuotes);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const getQuoteTooltipText = () => {
        return selectedOddsType === OddsType.AMM
            ? t('markets.parlay.info.min-quote', {
                  value: formatMarketOdds(selectedOddsType, parlayAmmData?.maxSupportedOdds),
              })
            : t('markets.parlay.info.max-quote', {
                  value: formatMarketOdds(selectedOddsType, parlayAmmData?.maxSupportedOdds),
              });
    };

    const hidePayout =
        Number(collateralAmountValue) <= 0 ||
        Number(collateralAmountValue) < minCollateralAmountValue ||
        totalBuyAmount === 0 ||
        // hide when validation tooltip exists except in case of invalid profit and not enough funds
        (tooltipTextCollateralAmount &&
            !isValidProfit &&
            Number(collateralAmountValue) * COLLATERAL_CONVERSION_MULTIPLIER < paymentTokenBalance) ||
        isFetching;

    const profitPercentage = (totalBuyAmount - Number(usdAmountValue)) / Number(usdAmountValue);

    const onModalClose = useCallback(() => {
        setShowShareTicketModal(false);
    }, []);

    const twitterShareDisabled = submitDisabled || !hasAllowance;
    const onTwitterIconClick = () => {
        // create data copy to avoid modal re-render while opened
        const modalData: ShareTicketModalProps = {
            markets: [...markets],
            multiSingle: false,
            totalQuote,
            paid: Number(usdAmountValue),
            payout: totalBuyAmount,
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
                    <InfoTooltip
                        open={inputRefVisible && totalQuote === parlayAmmData?.maxSupportedOdds}
                        title={getQuoteTooltipText()}
                        placement={'top'}
                        arrow={true}
                    >
                        <SummaryValue>{formatMarketOdds(selectedOddsType, totalQuote)}</SummaryValue>
                    </InfoTooltip>
                    <SummaryLabel alignRight={true}>{t('markets.parlay.clear')}:</SummaryLabel>
                    <XButton
                        margin={'0 0 4px 5px'}
                        onClick={() => dispatch(removeAll())}
                        className={`icon icon--cross-button-arrow`}
                    />
                </RowContainer>
                <RowContainer>
                    <SummaryLabel>{t('markets.parlay.total-bonus')}:</SummaryLabel>
                    <SummaryValue>{formatPercentage(totalBonusPercentageDec)}</SummaryValue>
                    <SummaryValue isCurrency={true} isHidden={totalBonusCurrency === 0 || hidePayout}>
                        ({formatCurrencyWithSign('+ ' + USD_SIGN, totalBonusCurrency)})
                    </SummaryValue>
                </RowContainer>
            </RowSummary>
            <Voucher disabled={isAllowing || isBuying} />
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
                        showValidation={inputRefVisible && !!tooltipTextCollateralAmount && !openApprovalModal}
                        validationMessage={tooltipTextCollateralAmount}
                        inputFontSize="18px"
                        inputFontWeight="700"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                        disabled={isAllowing || isBuying}
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
                        balance={formatCurrencyWithKey(selectedCollateral, paymentTokenBalance)}
                    />
                </AmountToBuyContainer>
            </InputContainer>
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.parlay-fee')}:</InfoLabel>
                    <InfoValue>
                        {parlayAmmData?.parlayAmmFee === undefined || isFetching
                            ? '-'
                            : formatPercentage(parlayAmmData?.parlayAmmFee)}
                    </InfoValue>
                    <InfoLabel marginLeft={7}>{t('markets.parlay.safebox-fee')}:</InfoLabel>
                    <InfoValue>
                        {parlayAmmData?.safeBoxImpact === undefined || isFetching
                            ? '-'
                            : formatPercentage(parlayAmmData?.safeBoxImpact)}
                    </InfoValue>
                </InfoWrapper>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.skew')}:</InfoLabel>
                    <InfoValue>
                        {isFetching || totalQuote === parlayAmmData?.maxSupportedOdds ? '-' : formatPercentage(skew)}
                    </InfoValue>
                </InfoWrapper>
            </InfoContainer>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.total-to-pay')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : isDefaultCollateral
                        ? formatCurrencyWithSign(USD_SIGN, collateralAmountValue)
                        : `${formatCurrencyWithKey(
                              selectedCollateral,
                              collateralAmountValue
                          )} (${formatCurrencyWithSign(USD_SIGN, Number(usdAmountValue))})`}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout ? '-' : formatCurrencyWithSign(USD_SIGN, totalBuyAmount, 2)}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.potential-profit')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : `${formatCurrencyWithSign(
                              USD_SIGN,
                              totalBuyAmount - Number(usdAmountValue),
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
                    defaultAmount={Number(collateralAmountValue) * (1 + APPROVAL_BUFFER)}
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

export default Ticket;

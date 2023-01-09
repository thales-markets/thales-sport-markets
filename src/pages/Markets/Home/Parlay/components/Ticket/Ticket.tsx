import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERALS_INDEX, USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER, COLLATERALS, OddsType } from 'constants/markets';
import { MAX_GAS_LIMIT } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import useParlayAmmDataQuery from 'queries/markets/useParlayAmmDataQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { removeAll, setPayment } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { ParlayPayment, ParlaysMarket } from 'types/markets';
import { getAmountForApproval } from 'utils/amm';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import {
    countDecimals,
    formatCurrencyWithSign,
    formatPercentage,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getBonus } from 'utils/markets';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { getParlayAMMTransaction, getParlayMarketsAMMQuoteMethod } from 'utils/parlayAmm';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import Payment from '../Payment';
import ShareTicketModal from '../ShareTicketModal';
import { ShareTicketModalProps } from '../ShareTicketModal/ShareTicketModal';
import {
    AmountToBuyContainer,
    AmountToBuyInput,
    InfoContainer,
    InfoLabel,
    InfoTooltip,
    InfoValue,
    InfoWrapper,
    InputContainer,
    RowContainer,
    RowSummary,
    ShareWrapper,
    SubmitButton,
    SummaryLabel,
    SummaryValue,
    TwitterIcon,
    ValidationTooltip,
    XButton,
} from '../styled-components';

type TicketProps = {
    markets: ParlaysMarket[];
    parlayPayment: ParlayPayment;
    setMarketsOutOfLiquidity: (indexes: number[]) => void;
};

const TicketErrorMessage = {
    RISK_PER_COMB: 'RiskPerComb exceeded',
    SAME_TEAM_IN_PARLAY: 'SameTeamOnParlay',
};

const Ticket: React.FC<TicketProps> = ({ markets, parlayPayment, setMarketsOutOfLiquidity }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);

    const [selectedStableIndex, setSelectedStableIndex] = useState<COLLATERALS_INDEX>(
        parlayPayment.selectedStableIndex
    );
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean | undefined>(parlayPayment.isVoucherSelected);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>(parlayPayment.amountToBuy);
    const [totalQuote, setTotalQuote] = useState(0);
    const [totalBonusPercentageDec, setTotalBonusPercentageDec] = useState(0);
    const [totalBonusCurrency, setTotalBonusCurrency] = useState(0);
    const [finalQuotes, setFinalQuotes] = useState<number[]>([]);
    const [skew, setSkew] = useState(0);
    const [totalBuyAmount, setTotalBuyAmount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<string>('');
    const [hasAllowance, setHasAllowance] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    // Used for cancelling the subscription and asynchronous tasks in a useEffect
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const parlayAmmDataQuery = useParlayAmmDataQuery(networkId, {
        enabled: isAppReady,
    });
    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
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
            if (parlayPayment.isVoucherSelected === undefined) {
                setIsVoucherSelected(true);
            }
            return overtimeVoucherQuery.data;
        }
        if (parlayPayment.isVoucherSelected !== undefined) {
            setIsVoucherSelected(false);
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data, parlayPayment.isVoucherSelected]);

    const paymentTokenBalance: number = useMemo(() => {
        if (overtimeVoucher && isVoucherSelected) {
            return overtimeVoucher.remainingAmount;
        }
        if (multipleStableBalances.data && multipleStableBalances.isSuccess) {
            return multipleStableBalances.data[COLLATERALS[selectedStableIndex]];
        }
        return 0;
    }, [
        multipleStableBalances.data,
        multipleStableBalances.isSuccess,
        selectedStableIndex,
        overtimeVoucher,
        isVoucherSelected,
    ]);

    useEffect(() => {
        // Used for transition between Ticket and Single to save payment selection and amount
        dispatch(setPayment({ selectedStableIndex, isVoucherSelected, amountToBuy: usdAmountValue }));
    }, [dispatch, selectedStableIndex, isVoucherSelected, usdAmountValue]);

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
        async (susdAmountForQuote: number) => {
            const { parlayMarketsAMMContract } = networkConnector;
            if (parlayMarketsAMMContract && parlayAmmData?.minUsdAmount) {
                const marketsAddresses = markets.map((market) => market.address);
                const selectedPositions = markets.map((market) => market.position);
                const minUsdAmount =
                    parlayAmmData?.minUsdAmount && susdAmountForQuote < parlayAmmData?.minUsdAmount
                        ? parlayAmmData?.minUsdAmount // deafult value for qoute info
                        : susdAmountForQuote;
                const susdPaid = ethers.utils.parseEther(roundNumberToDecimals(minUsdAmount).toString());

                try {
                    const parlayAmmQuote = await getParlayMarketsAMMQuoteMethod(
                        selectedStableIndex,
                        networkId,
                        parlayMarketsAMMContract,
                        marketsAddresses,
                        selectedPositions,
                        susdPaid
                    );

                    return parlayAmmQuote;
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
        [networkId, selectedStableIndex, markets, parlayAmmData?.minUsdAmount]
    );

    useEffect(() => {
        const { parlayMarketsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (parlayMarketsAMMContract && signer) {
            let collateralContractWithSigner: ethers.Contract | undefined;

            if (selectedStableIndex !== COLLATERALS_INDEX.sUSD && multipleCollateral) {
                collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
            } else {
                collateralContractWithSigner = sUSDContract?.connect(signer);
            }

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = getAmountForApproval(
                        selectedStableIndex,
                        Number(usdAmountValue).toString()
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
            if (isWalletConnected && usdAmountValue) {
                isVoucherSelected ? setHasAllowance(true) : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        usdAmountValue,
        selectedStableIndex,
        isVoucherSelected,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { parlayMarketsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (parlayMarketsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;

                if (selectedStableIndex !== 0 && multipleCollateral && multipleCollateral[selectedStableIndex]) {
                    collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = parlayMarketsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
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
                const susdPaid = ethers.utils.parseEther(roundNumberToDecimals(Number(usdAmountValue)).toString());
                const expectedPayout = ethers.utils.parseEther(roundNumberToDecimals(totalBuyAmount).toString());
                const additionalSlippage = ethers.utils.parseEther('0.02');

                const tx = await getParlayAMMTransaction(
                    isVoucherSelected,
                    overtimeVoucher ? overtimeVoucher.id : 0,
                    selectedStableIndex,
                    networkId,
                    parlayMarketsAMMContractWithSigner,
                    overtimeVoucherContractWithSigner,
                    marketsAddresses,
                    selectedPositions,
                    susdPaid,
                    expectedPayout,
                    referralId,
                    additionalSlippage,
                    {
                        gasLimit: MAX_GAS_LIMIT,
                    }
                );

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchBalances(walletAddress, networkId);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')));
                    setIsBuying(false);
                    setUsdAmount('');
                    dispatch(removeAll());

                    trackEvent({
                        category: 'parlay',
                        action: `buy-with-${COLLATERALS[selectedStableIndex]}`,
                        value: Number(usdAmountValue),
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

    useEffect(() => {
        // Minimum of sUSD
        if (
            !Number(usdAmountValue) ||
            Number(usdAmountValue) < (parlayAmmData?.minUsdAmount || 0) ||
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
        if (tooltipTextUsdAmount) {
            setSubmitDisabled(true);
            return;
        }
        // Not enough funds
        setSubmitDisabled(!paymentTokenBalance || usdAmountValue > paymentTokenBalance);
    }, [
        usdAmountValue,
        isBuying,
        isAllowing,
        hasAllowance,
        paymentTokenBalance,
        totalQuote,
        tooltipTextUsdAmount,
        parlayAmmData?.minUsdAmount,
    ]);

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        // Show Approve only on valid input buy amount
        if (!hasAllowance && usdAmountValue && Number(usdAmountValue) >= (parlayAmmData?.minUsdAmount || 0)) {
            return (
                <SubmitButton disabled={submitDisabled} onClick={() => setOpenApprovalModal(true)}>
                    {t('common.wallet.approve')}
                </SubmitButton>
            );
        }

        return (
            <SubmitButton disabled={submitDisabled} onClick={async () => handleSubmit()}>
                {t(`common.buy-side`)}
            </SubmitButton>
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
                        setTooltipTextUsdAmount(t('markets.parlay.validation.risk-per-comb'));
                        return;
                    case TicketErrorMessage.SAME_TEAM_IN_PARLAY:
                        setTooltipTextUsdAmount(t('markets.parlay.validation.same-team'));
                        return;
                    default:
                        setTooltipTextUsdAmount(t('markets.parlay.validation.not-supported', { error }));
                }
            } else if (quotes.some((quote) => quote === 0)) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.availability'));
            } else if (value && Number(value) < (parlayAmmData?.minUsdAmount || 0)) {
                setTooltipTextUsdAmount(
                    t('markets.parlay.validation.min-amount', {
                        min: formatCurrencyWithSign(USD_SIGN, parlayAmmData?.minUsdAmount || 0),
                    })
                );
            } else if (isValidProfit) {
                setTooltipTextUsdAmount(
                    t('markets.parlay.validation.max-profit', {
                        max: formatCurrencyWithSign(USD_SIGN, parlayAmmData?.maxSupportedAmount || 0),
                    })
                );
            } else if (Number(value) > paymentTokenBalance) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.no-funds'));
            } else {
                setTooltipTextUsdAmount('');
            }
        },
        [parlayAmmData?.maxSupportedAmount, parlayAmmData?.minUsdAmount, t, paymentTokenBalance, isValidProfit]
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
            if (parlayMarketsAMMContract && Number(usdAmountValue) >= 0 && parlayAmmData?.minUsdAmount) {
                // Fetching for min usd amount in order to calculate total bonus difference
                const [parlayAmmMinimumUSDAmountQuote, parlayAmmQuote] = await Promise.all([
                    fetchParlayAmmQuote(parlayAmmData.minUsdAmount),
                    fetchParlayAmmQuote(Number(usdAmountValue)),
                ]);

                if (!mountedRef.current || !isSubscribed) return null;

                if (!parlayAmmQuote.error) {
                    const parlayAmmTotalQuote = bigNumberFormatter(parlayAmmQuote['totalQuote']);
                    const parlayAmmTotalBuyAmount = bigNumberFormatter(parlayAmmQuote['totalBuyAmount']);
                    setTotalQuote(parlayAmmTotalQuote);
                    setSkew(bigNumberFormatter(parlayAmmQuote['skewImpact'] || 0));
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

                    if (!parlayAmmMinimumUSDAmountQuote.error) {
                        const baseQuote = bigNumberFormatter(parlayAmmMinimumUSDAmountQuote['totalQuote']);
                        const calculatedReducedTotalBonus =
                            (calculatedBonusPercentageDec *
                                Number(formatMarketOdds(OddsType.Decimal, parlayAmmTotalQuote))) /
                            Number(formatMarketOdds(OddsType.Decimal, baseQuote));
                        setTotalBonusPercentageDec(calculatedReducedTotalBonus);

                        const calculatedBonusCurrency = parlayAmmTotalBuyAmount * calculatedReducedTotalBonus;
                        setTotalBonusCurrency(calculatedBonusCurrency);
                    } else {
                        setTotalBonusPercentageDec(calculatedBonusPercentageDec);
                        setTotalBonusCurrency(0);
                    }

                    setTooltipTextMessageUsdAmount(usdAmountValue, fetchedFinalQuotes);
                } else {
                    setMarketsOutOfLiquidity([]);
                    setTotalQuote(0);
                    setSkew(0);
                    setTotalBuyAmount(0);
                    setTooltipTextMessageUsdAmount(0, [], parlayAmmQuote.error);
                }
            }
            setIsFetching(false);
        };
        fetchData().catch((e) => console.log(e));

        return () => {
            isSubscribed = false;
        };
    }, [
        usdAmountValue,
        fetchParlayAmmQuote,
        setTooltipTextMessageUsdAmount,
        parlayAmmData?.minUsdAmount,
        setMarketsOutOfLiquidity,
        calculatedBonusPercentageDec,
    ]);

    useEffect(() => {
        setTooltipTextMessageUsdAmount(usdAmountValue, finalQuotes);
    }, [isVoucherSelected, setTooltipTextMessageUsdAmount, usdAmountValue, finalQuotes]);

    const setUsdAmount = (value: string | number) => {
        setUsdAmountValue(value);
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
        Number(usdAmountValue) <= 0 ||
        totalBuyAmount === 0 ||
        // hide when validation tooltip exists except in case of invalid profit and not enough funds
        (tooltipTextUsdAmount && !isValidProfit && usdAmountValue <= paymentTokenBalance) ||
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
            <Payment
                defaultSelectedStableIndex={selectedStableIndex}
                defaultIsVoucherSelected={isVoucherSelected}
                onChangeCollateral={(index) => setSelectedStableIndex(index)}
                setIsVoucherSelectedProp={setIsVoucherSelected}
            />
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.buy-in')}:</SummaryLabel>
            </RowSummary>
            <InputContainer ref={inputRef}>
                <ValidationTooltip
                    open={inputRefVisible && !!tooltipTextUsdAmount && !openApprovalModal}
                    title={tooltipTextUsdAmount}
                    placement={'top'}
                    arrow={true}
                >
                    <AmountToBuyContainer>
                        <AmountToBuyInput
                            name="usdAmount"
                            type="number"
                            value={usdAmountValue}
                            onChange={(e) => {
                                if (countDecimals(Number(e.target.value)) > 2) {
                                    return;
                                }
                                setUsdAmount(e.target.value);
                            }}
                        />
                    </AmountToBuyContainer>
                </ValidationTooltip>
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
                    totalQuote={shareTicketModalData.totalQuote}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={onModalClose}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(usdAmountValue) + Number(usdAmountValue) * APPROVAL_BUFFER}
                    collateralIndex={selectedStableIndex}
                    tokenSymbol={COLLATERALS[selectedStableIndex]}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

export default Ticket;

import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER, MAX_USD_SLIPPAGE } from 'constants/markets';
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
import { removeAll, setPayment } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { getIsSocialLogin, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { AMMPosition, AvailablePerPosition, ParlayPayment, ParlaysMarket } from 'types/markets';
import { getAMMSportsEtherspotTransactionInfo, getAMMSportsTransaction, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import {
    countDecimals,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithSign,
    formatPercentage,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getBonus, getPositionOdds } from 'utils/markets';
import {
    checkAllowance,
    getDefaultDecimalsForNetwork,
    getMaxGasLimitForNetwork,
    isMultiCollateralSupportedForNetwork,
} from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import Payment from '../Payment';
import ShareTicketModal from '../ShareTicketModal';
import { ShareTicketModalProps } from '../ShareTicketModal/ShareTicketModal';
import {
    AmountToBuyContainer,
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
import { getCollateral, getStablecoinDecimals } from 'utils/collaterals';
import { stableCoinParser } from 'utils/formatters/ethers';
import { executeEtherspotTransaction, getEtherspotTransactionGasEstimated } from 'utils/etherspot';

type SingleProps = {
    market: ParlaysMarket;
    parlayPayment: ParlayPayment;
    onBuySuccess?: () => void;
};

const Single: React.FC<SingleProps> = ({ market, parlayPayment, onBuySuccess }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isSocialLogin = useSelector((state: RootState) => getIsSocialLogin(state));
    const selectedOddsType = useSelector(getOddsType);

    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isAMMPaused, setIsAMMPaused] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [selectedStableIndex, setSelectedStableIndex] = useState(parlayPayment.selectedStableIndex);
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean | undefined>(parlayPayment.isVoucherSelected);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [bonusPercentageDec, setBonusPercentageDec] = useState(0);
    const [bonusCurrency, setBonusCurrency] = useState(0);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>(parlayPayment.amountToBuy);
    const [maxUsdAmount, setMaxUsdAmount] = useState(0);
    const [availableUsdAmount, setAvailableUsdAmount] = useState(0);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState('');
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
    const [gasFee, setGasFee] = useState<number | null>(null);

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

    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

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
            return multipleStableBalances.data[getCollateral(networkId, selectedStableIndex)];
        }
        return 0;
    }, [
        networkId,
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

    const fetchAmmQuote = useCallback(
        async (amountForQuote: number) => {
            const { sportsAMMContract } = networkConnector;
            if (sportsAMMContract && amountForQuote) {
                const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(amountForQuote).toString());
                const ammQuote = await getSportsAMMQuoteMethod(
                    selectedStableIndex,
                    networkId,
                    sportsAMMContract,
                    market.address,
                    market.position,
                    parsedAmount
                );

                return isMultiCollateralSupported && selectedStableIndex !== 0 ? ammQuote[0] : ammQuote;
            }
        },
        [isMultiCollateralSupported, market.address, market.position, networkId, selectedStableIndex]
    );

    useEffect(() => {
        const getMaxUsdAmount = async () => {
            const { sportsAMMContract } = networkConnector;
            if (sportsAMMContract) {
                const roundedMaxAmount = floorNumberToDecimals(availablePerPosition[market.position].available || 0);
                const divider = isVoucherSelected
                    ? Number(`1e${getDefaultDecimalsForNetwork(networkId)}`)
                    : Number(`1e${getStablecoinDecimals(networkId, selectedStableIndex)}`);
                const susdToSpendForMaxAmount = await fetchAmmQuote(roundedMaxAmount);

                const decimalSusdToSpendForMaxAmount = susdToSpendForMaxAmount / divider;

                if (!mountedRef.current) return null;
                setAvailableUsdAmount(floorNumberToDecimals(decimalSusdToSpendForMaxAmount));

                if (paymentTokenBalance > decimalSusdToSpendForMaxAmount) {
                    if (paymentTokenBalance * MAX_USD_SLIPPAGE >= decimalSusdToSpendForMaxAmount) {
                        setMaxUsdAmount(floorNumberToDecimals(decimalSusdToSpendForMaxAmount));
                    } else {
                        const calculatedMaxAmount = paymentTokenBalance * MAX_USD_SLIPPAGE;
                        setMaxUsdAmount(floorNumberToDecimals(calculatedMaxAmount));
                    }
                    return;
                }
                setMaxUsdAmount(floorNumberToDecimals(paymentTokenBalance * MAX_USD_SLIPPAGE));
            }
        };
        getMaxUsdAmount();
    }, [
        usdAmountValue,
        paymentTokenBalance,
        selectedStableIndex,
        market.address,
        market.position,
        availablePerPosition,
        fetchAmmQuote,
        isVoucherSelected,
        networkId,
    ]);

    const calculatedBonusPercentageDec = useMemo(() => getBonus(market) / 100, [market]);

    useDebouncedEffect(() => {
        const fetchData = async () => {
            const divider = isVoucherSelected
                ? Number(`1e${getDefaultDecimalsForNetwork(networkId)}`)
                : Number(`1e${getStablecoinDecimals(networkId, selectedStableIndex)}`);

            const { sportsAMMContract, provider } = networkConnector;
            if (provider && sportsAMMContract) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, provider);
                const roundedMaxAmount = floorNumberToDecimals(availablePerPosition[market.position].available || 0);
                if (roundedMaxAmount) {
                    const [sUSDToSpendForMaxAmount, ammBalances] = await Promise.all([
                        fetchAmmQuote(roundedMaxAmount),
                        contract.balancesOf(sportsAMMContract?.address),
                    ]);
                    if (!mountedRef.current) return null;

                    const ammBalanceForSelectedPosition = ammBalances[market.position];
                    const amountOfTokens =
                        fetchAmountOfTokensForXsUSDAmount(
                            Number(usdAmountValue),
                            getPositionOdds(market),
                            sUSDToSpendForMaxAmount / divider,
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
                        (amountOfTokens * Number(usdAmountValue)) / parsedQuote
                    );
                    const maxAvailableTokenAmount =
                        recalculatedTokenAmount > flooredAmountOfTokens
                            ? flooredAmountOfTokens
                            : recalculatedTokenAmount;
                    setTokenAmount(maxAvailableTokenAmount);

                    if (Number(usdAmountValue) > 0) {
                        const newQuote = maxAvailableTokenAmount / Number(usdAmountValue);
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
    }, [usdAmountValue, selectedStableIndex, fetchAmmQuote, availablePerPosition, market]);

    const positionPriceDetailsQuery = usePositionPriceDetailsQuery(
        market.address,
        market.position,
        tokenAmount || 1,
        selectedStableIndex,
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
        const { sportsAMMContract, sUSDContract, multipleCollateral } = networkConnector;
        if (sportsAMMContract) {
            const collateral = getCollateral(networkId, selectedStableIndex);
            const collateralContract: ethers.Contract | undefined =
                selectedStableIndex !== 0 && multipleCollateral && isMultiCollateralSupported
                    ? multipleCollateral[collateral]
                    : sUSDContract;

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = stableCoinParser(
                        Number(usdAmountValue).toString(),
                        networkId,
                        getCollateral(networkId, selectedStableIndex)
                    );
                    const allowance = await checkAllowance(
                        parsedTicketPrice,
                        collateralContract,
                        walletAddress,
                        sportsAMMContract.address
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
        isMultiCollateralSupported,
        networkId,
        isSocialLogin,
    ]);

    useEffect(() => {
        const fetchGasEstimated = async () => {
            try {
                const ammQuote = await fetchAmmQuote(tokenAmount || 1);
                const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(tokenAmount).toString());
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;

                const { sportsAMMContract, overtimeVoucherContract } = networkConnector;

                const etherspotTransactionInfo = getAMMSportsEtherspotTransactionInfo(
                    isVoucherSelected,
                    overtimeVoucher ? overtimeVoucher.id : 0,
                    selectedStableIndex,
                    networkId,
                    market.address,
                    market.position,
                    parsedAmount,
                    ammQuote,
                    referralId,
                    ethers.utils.parseEther('0.02')
                );

                const gasEstimated = await getEtherspotTransactionGasEstimated(
                    networkId,
                    isVoucherSelected ? overtimeVoucherContract : sportsAMMContract,
                    etherspotTransactionInfo.methodName,
                    etherspotTransactionInfo.data
                );
                setGasFee(gasEstimated);
            } catch (e) {
                console.log(e);
                setGasFee(null);
            }
        };
        if (submitDisabled || !isSocialLogin) return;
        fetchGasEstimated();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitDisabled, tokenAmount, hasAllowance, networkId, walletAddress, isSocialLogin]);

    console.log(gasFee);

    const handleAllowance = async (approveAmount: BigNumber) => {
        setIsAllowing(true);
        const id = toast.loading(t('market.toast-message.transaction-pending'));

        try {
            const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
            const addressToApprove = sportsAMMContract?.address;

            const collateral = getCollateral(networkId, selectedStableIndex);
            const collateralContract =
                selectedStableIndex !== 0 &&
                multipleCollateral &&
                multipleCollateral[collateral] &&
                isMultiCollateralSupported
                    ? multipleCollateral[collateral]
                    : sUSDContract;

            let txHash;
            if (isSocialLogin) {
                txHash = await executeEtherspotTransaction(networkId, collateralContract, 'approve', [
                    addressToApprove,
                    approveAmount,
                ]);
            } else if (sportsAMMContract && signer) {
                const collateralContractWithSigner: ethers.Contract | undefined = collateralContract?.connect(signer);

                const tx = (await collateralContractWithSigner?.approve(addressToApprove, approveAmount, {
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                })) as ethers.ContractTransaction;
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    setOpenApprovalModal(false);
                    txHash = txResult.transactionHash;
                }
            }

            if (txHash && txHash !== null) {
                toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
            }
        } catch (e) {
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            console.log(e);
        }
        setIsAllowing(false);
    };

    const handleSubmit = async () => {
        setIsBuying(true);
        const id = toast.loading(t('market.toast-message.transaction-pending'));

        try {
            const ammQuote = await fetchAmmQuote(tokenAmount || 1);
            const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(tokenAmount).toString());
            const referralId =
                walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                    ? getReferralId()
                    : null;

            const { sportsAMMContract, overtimeVoucherContract, signer } = networkConnector;

            let txHash;
            if (isSocialLogin) {
                const etherspotTransactionInfo = getAMMSportsEtherspotTransactionInfo(
                    isVoucherSelected,
                    overtimeVoucher ? overtimeVoucher.id : 0,
                    selectedStableIndex,
                    networkId,
                    market.address,
                    market.position,
                    parsedAmount,
                    ammQuote,
                    referralId,
                    ethers.utils.parseEther('0.02')
                );
                txHash = await executeEtherspotTransaction(
                    networkId,
                    isVoucherSelected ? overtimeVoucherContract : sportsAMMContract,
                    etherspotTransactionInfo.methodName,
                    etherspotTransactionInfo.data
                );
            } else if (sportsAMMContract && overtimeVoucherContract && signer) {
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);

                const tx = await getAMMSportsTransaction(
                    isVoucherSelected,
                    overtimeVoucher ? overtimeVoucher.id : 0,
                    selectedStableIndex,
                    networkId,
                    sportsAMMContractWithSigner,
                    overtimeVoucherContractWithSigner,
                    market.address,
                    market.position,
                    parsedAmount,
                    ammQuote,
                    referralId,
                    ethers.utils.parseEther('0.02'),
                    { gasLimit: getMaxGasLimitForNetwork(networkId) }
                );
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    txHash = txResult.transactionHash;
                }
            }
            if (txHash && txHash !== null) {
                refetchBalances(walletAddress, networkId);
                toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')));
                setUsdAmount('');
                setTokenAmount(0);
                dispatch(removeAll());
                onBuySuccess && onBuySuccess();

                trackEvent({
                    category: 'parlay-single',
                    action: `buy-with-${getCollateral(networkId, selectedStableIndex)}`,
                    value: Number(formatCurrency(ammPosition.quote, 3, true)),
                });
            }
        } catch (e) {
            refetchBalances(walletAddress, networkId);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            console.log('Error ', e);
        }
        setIsBuying(false);
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
            !Number(usdAmountValue) ||
            !tokenAmount ||
            tokenAmount < MIN_TOKEN_AMOUNT ||
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

        setSubmitDisabled(!paymentTokenBalance || Number(usdAmountValue) > Number(paymentTokenBalance));
    }, [
        usdAmountValue,
        isBuying,
        isAllowing,
        hasAllowance,
        paymentTokenBalance,
        tokenAmount,
        positionPriceDetailsQuery.isLoading,
        isAMMPaused,
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
        if (!hasAllowance && usdAmountValue && tokenAmount >= MIN_TOKEN_AMOUNT) {
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

    const setTooltipTextMessageUsdAmount = useCallback(
        (value: string | number) => {
            const positionOdds = roundNumberToDecimals(getPositionOdds(market));
            if (value && Number(value) < positionOdds) {
                setTooltipTextUsdAmount(
                    t('markets.parlay.validation.single-min-amount', {
                        min: formatCurrencyWithSign(USD_SIGN, positionOdds, 2),
                    })
                );
            } else if (Number(value) > availableUsdAmount) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.amount-exceeded'));
            } else if (Number(value) > paymentTokenBalance) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.no-funds'));
            } else {
                setTooltipTextUsdAmount('');
            }
        },
        [market, availableUsdAmount, t, paymentTokenBalance]
    );

    useEffect(() => {
        setTooltipTextMessageUsdAmount(usdAmountValue);
    }, [isVoucherSelected, setTooltipTextMessageUsdAmount, usdAmountValue]);

    const setUsdAmount = (value: string | number) => {
        setUsdAmountValue(value);
        setTooltipTextMessageUsdAmount(value);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const hidePayout =
        !tokenAmount ||
        positionPriceDetailsQuery.isLoading ||
        // hide when validation tooltip exists except in case of not enough funds
        (!!tooltipTextUsdAmount && Number(usdAmountValue) <= Number(paymentTokenBalance));
    const hideProfit =
        ammPosition.quote <= 0 ||
        !tokenAmount ||
        positionPriceDetailsQuery.isLoading ||
        // hide when validation tooltip exists except in case of not enough funds
        (!!tooltipTextUsdAmount && Number(usdAmountValue) <= Number(paymentTokenBalance));

    const profitPercentage = (tokenAmount - ammPosition.quote) / ammPosition.quote;

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
            paid: Number(usdAmountValue),
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
                <AmountToBuyContainer>
                    <NumericInput
                        value={usdAmountValue}
                        onChange={(e) => {
                            if (Number(countDecimals(Number(e.target.value))) > 2) {
                                return;
                            }
                            setUsdAmount(e.target.value);
                        }}
                        onMaxButton={() => setUsdAmount(maxUsdAmount)}
                        showValidation={inputRefVisible && !!tooltipTextUsdAmount && !openApprovalModal}
                        validationMessage={tooltipTextUsdAmount}
                        inputFontSize="18px"
                        inputFontWeight="700"
                        inputTextAlign="center"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                    />
                </AmountToBuyContainer>
            </InputContainer>
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.available')}:</InfoLabel>
                    <InfoValue>{formatCurrencyWithSign(USD_SIGN, availableUsdAmount)}</InfoValue>
                </InfoWrapper>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.skew')}:</InfoLabel>
                    <InfoValue>
                        {positionPriceDetailsQuery.isLoading ? '-' : formatPercentage(ammPosition.priceImpact)}
                    </InfoValue>
                </InfoWrapper>
            </InfoContainer>
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
                        : `${formatCurrencyWithSign(USD_SIGN, tokenAmount - ammPosition.quote, 2)} (${formatPercentage(
                              profitPercentage
                          )})`}
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
                    defaultAmount={Number(usdAmountValue) + Number(usdAmountValue) * APPROVAL_BUFFER}
                    collateralIndex={selectedStableIndex}
                    tokenSymbol={getCollateral(networkId, selectedStableIndex)}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

export default Single;

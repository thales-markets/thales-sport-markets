import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER } from 'constants/markets';
import { OddsType } from 'enums/markets';
import { BigNumber, ethers } from 'ethers';
import { ListContainer } from 'pages/Profile/components/Positions/styled-components';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import useAvailablePerPositionMultiQuery from 'queries/markets/useAvailablePerPositionMultiQuery';
import usePositionPriceDetailsMultiQuery from 'queries/markets/usePositionPriceDetailsMultiQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getMultiSingle,
    getParlayPayment,
    removeAll,
    removeFromParlay,
    setMultiSingle,
    setPaymentAmountToBuy,
} from 'redux/modules/parlay';
import {
    getIsAA,
    getIsConnectedViaParticle,
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import {
    ceilNumberToDecimals,
    coinFormatter,
    coinParser,
    floorNumberToDecimals,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatPercentage,
    getPrecision,
    roundNumberToDecimals,
} from 'thales-utils';
import { AMMPosition, AvailablePerPosition, MultiSingleTokenQuoteAndBonus, ParlaysMarket } from 'types/markets';
import { Coins } from 'types/tokens';
import { ThemeInterface } from 'types/ui';
import { getAMMSportsTransaction, getSportsAMMQuoteMethod } from 'utils/amm';
import {
    getCollateral,
    getCollateralAddress,
    getCollateralIndex,
    getCollaterals,
    getDefaultCollateral,
    isStableCurrency,
} from 'utils/collaterals';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { formatMarketOdds, getBonus, getPositionOdds } from 'utils/markets';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import MatchInfo from '../MatchInfo';
import ShareTicketModal from '../ShareTicketModal';
import { ShareTicketModalProps } from '../ShareTicketModal/ShareTicketModal';
import Voucher from '../Voucher';
import {
    AmountToBuyMultiContainer,
    AmountToBuyMultiInfoLabel,
    AmountToBuyMultiPayoutLabel,
    AmountToBuyMultiPayoutValue,
    CollateralContainer,
    InfoContainer,
    InfoLabel,
    InfoValue,
    InfoWrapper,
    RowContainer,
    RowSummary,
    ShareWrapper,
    SummaryLabel,
    SummaryValue,
    TwitterIcon,
    XButton,
    defaultButtonProps,
} from '../styled-components';

type MultiSingleProps = {
    markets: ParlaysMarket[];
};

const MultiSingle: React.FC<MultiSingleProps> = ({ markets }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const isParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const multiSingleAmounts = useSelector(getMultiSingle);
    const parlayPayment = useSelector(getParlayPayment);
    const selectedCollateralIndex = parlayPayment.selectedCollateralIndex;
    const isVoucherSelected = parlayPayment.isVoucherSelected;
    const collateralAmountValue = parlayPayment.amountToBuy;

    const [calculatedTotalTokenAmount, setCalculatedTotalTokenAmount] = useState(0);
    const [quoteForMinAmount, setQuoteForMinAmount] = useState(0);
    const [tokenAndBonus, setTokenAndBonus] = useState<MultiSingleTokenQuoteAndBonus[]>(
        Array(markets.length).fill({
            sportMarketAddress: '',
            tokenAmount: 0,
            bonusPercentageDec: 0,
            totalBonusCurrency: 0,
            ammQuote: 0,
        })
    );
    const [totalBonusPercentageDec, setTotalBonusPercentageDec] = useState(0);
    const [bonusCurrency, setBonusCurrency] = useState(0);

    const [isAMMPaused, setIsAMMPaused] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isFetching, setIsFetching] = useState<Record<string, boolean>>({});
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [hasValidationError, setHasValidationError] = useState(false);
    const [tooltipTextCollateralAmount, setTooltipTextCollateralAmount] = useState<Record<string, string>>({});

    const [availablePerPosition, setAvailablePerPosition] = useState<Record<string, AvailablePerPosition>>({});
    const [ammPosition, setAmmPosition] = useState<Record<string, AMMPosition>>({});

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: true,
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
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
    const isStableCollateral = isStableCurrency(selectedCollateral);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;

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
        async (amountForQuote: number, market: ParlaysMarket, getExtendedQuote?: boolean) => {
            const { sportsAMMContract } = networkConnector;
            if (sportsAMMContract && amountForQuote) {
                const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(amountForQuote).toString());
                const ammQuote = await getSportsAMMQuoteMethod(
                    collateralAddress,
                    isDefaultCollateral,
                    sportsAMMContract,
                    market.address,
                    market.position,
                    parsedAmount
                );

                // Extended quote for non default collateral returns quote in collateral and quote in default collateral (USD)
                // For default collateral it returns the same quote for both
                return isDefaultCollateral
                    ? getExtendedQuote
                        ? [ammQuote, ammQuote]
                        : ammQuote
                    : getExtendedQuote
                    ? ammQuote
                    : ammQuote[0];
            }
        },
        [isDefaultCollateral, collateralAddress]
    );

    const calculatedBonusPercentageDec = useMemo(() => {
        return markets.map((market) => getBonus(market) / 100);
    }, [markets]);

    const calculatedTotalBuyIn = useMemo(() => {
        return multiSingleAmounts.reduce((a, b) => a + Number(b.amountToBuy), 0);
    }, [multiSingleAmounts]);

    const calculatedTotalCollateralBuyIn = useMemo(() => {
        let total = 0;
        for (const key in ammPosition) {
            total += ammPosition[key].quote;
        }
        return total;
    }, [ammPosition]);

    const calculatedTotalUsdBuyIn = useMemo(() => {
        let total = 0;
        for (const key in ammPosition) {
            total += ammPosition[key].usdQuote;
        }
        return total;
    }, [ammPosition]);

    const calculatedSkewAverage = useMemo(() => {
        let skewTotal = 0;
        for (const key in ammPosition) {
            skewTotal += ammPosition[key].priceImpact;
        }
        return markets.length > 0 ? skewTotal / markets.length : 0;
    }, [ammPosition, markets]);

    useEffect(() => {
        let isSubscribed = true; // Use for race condition

        const fetchData = async () => {
            setIsRecalculating(true);

            const coin = isVoucherSelected ? undefined : selectedCollateral;
            const { sportsAMMContract, signer } = networkConnector;
            const tokenAndBonusArr = [] as MultiSingleTokenQuoteAndBonus[];
            const isFetchingRecords = isFetching;
            let totalTokenAmount = 0;
            let totalBonusPercentage = 0;
            let totalBonusCurrency = 0;

            for (let i = 0; i < markets.length; i++) {
                const address = markets[i].address;
                let tokenAmount = 0;
                let bonusPercent = 0;

                if (signer && sportsAMMContract) {
                    const contract = new ethers.Contract(markets[i].address, sportsMarketContract.abi, signer);
                    contract.connect(signer);

                    const amountToBuy = multiSingleAmounts[i].amountToBuy;
                    const availableAmount = availablePerPosition[markets[i].address]
                        ? availablePerPosition[markets[i].address][markets[i].position]?.available || 0
                        : 0;
                    const roundedMaxAmount = floorNumberToDecimals(availableAmount);

                    if (roundedMaxAmount && Number(amountToBuy) > 0) {
                        const [
                            collateralToSpendForMaxAmount,
                            collateralToSpendForMinAmount,
                            ammBalances,
                        ] = await Promise.all([
                            fetchAmmQuote(roundedMaxAmount, markets[i]),
                            fetchAmmQuote(MIN_TOKEN_AMOUNT, markets[i]),
                            contract.balancesOf(sportsAMMContract?.address),
                        ]);
                        setQuoteForMinAmount(coinFormatter(collateralToSpendForMinAmount, networkId, coin));

                        if (!mountedRef.current || !isSubscribed) return null;

                        const ammBalanceForSelectedPosition = ammBalances[markets[i].position];

                        const amountOfTokens =
                            fetchAmountOfTokensForXsUSDAmount(
                                Number(amountToBuy),
                                coinFormatter(collateralToSpendForMinAmount, networkId, coin),
                                coinFormatter(collateralToSpendForMaxAmount, networkId, coin),
                                availableAmount,
                                coinFormatter(ammBalanceForSelectedPosition, networkId, coin)
                            ) || 0;

                        if (amountOfTokens > availableAmount) {
                            tokenAndBonusArr.push({
                                sportMarketAddress: address,
                                tokenAmount: 0.0,
                                bonusPercentageDec: 0.0,
                                totalBonusCurrency: 0.0,
                                ammQuote: 0.0,
                            });
                            return;
                        }

                        const flooredAmountOfTokens = floorNumberToDecimals(amountOfTokens);
                        const quote = await fetchAmmQuote(flooredAmountOfTokens, markets[i]);
                        if (!mountedRef.current || !isSubscribed) return null;

                        const parsedQuote = coinFormatter(quote, networkId, coin);

                        const recalculatedTokenAmount = roundNumberToDecimals(
                            (amountOfTokens * Number(amountToBuy)) / parsedQuote
                        );

                        const maxAvailableTokenAmount =
                            recalculatedTokenAmount > flooredAmountOfTokens
                                ? flooredAmountOfTokens
                                : recalculatedTokenAmount;

                        tokenAmount = maxAvailableTokenAmount;
                        totalTokenAmount += tokenAmount;

                        if (Number(multiSingleAmounts[i].amountToBuy) > 0) {
                            const newQuote = maxAvailableTokenAmount / Number(amountToBuy);
                            const calculatedReducedBonus =
                                (calculatedBonusPercentageDec[i] * newQuote) /
                                Number(formatMarketOdds(OddsType.Decimal, getPositionOdds(markets[i])));

                            bonusPercent = calculatedReducedBonus;
                            totalBonusPercentage += bonusPercent;

                            const calculatedBonusCurrency = maxAvailableTokenAmount * calculatedReducedBonus;
                            totalBonusCurrency += calculatedBonusCurrency;
                        } else {
                            bonusPercent = calculatedBonusPercentageDec[i];
                            totalBonusPercentage += bonusPercent;
                        }

                        tokenAndBonusArr.push({
                            sportMarketAddress: address,
                            tokenAmount: tokenAmount,
                            bonusPercentageDec: bonusPercent,
                            totalBonusCurrency: totalBonusCurrency,
                            ammQuote: quote,
                        });
                    }
                }
                isFetchingRecords[address] = false;
                setIsFetching(isFetchingRecords);
            }

            setBonusCurrency(totalBonusCurrency);
            setTotalBonusPercentageDec(totalBonusPercentage);
            setCalculatedTotalTokenAmount(totalTokenAmount);
            setTokenAndBonus(tokenAndBonusArr);
            setIsRecalculating(false);
        };

        fetchData().catch((e) => console.log(e));

        return () => {
            isSubscribed = false;
        };
    }, [
        calculatedBonusPercentageDec,
        fetchAmmQuote,
        availablePerPosition,
        markets,
        multiSingleAmounts,
        isFetching,
        networkId,
        isVoucherSelected,
        selectedCollateral,
    ]);

    const positionPriceDetailsQuery = usePositionPriceDetailsMultiQuery(
        markets,
        tokenAndBonus,
        selectedCollateral,
        collateralAddress,
        isDefaultCollateral,
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

    const availablePerPositionMultiQuery = useAvailablePerPositionMultiQuery(markets, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (availablePerPositionMultiQuery.isSuccess && availablePerPositionMultiQuery.data) {
            setAvailablePerPosition(availablePerPositionMultiQuery.data);
        }
    }, [availablePerPositionMultiQuery.isSuccess, availablePerPositionMultiQuery.data]);

    useEffect(() => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && multipleCollateral && signer) {
            const collateralContractWithSigner = isDefaultCollateral
                ? sUSDContract?.connect(signer)
                : multipleCollateral[selectedCollateral]?.connect(signer);

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = coinParser(
                        Number(calculatedTotalBuyIn).toString(),
                        networkId,
                        selectedCollateral
                    );
                    await checkAllowance(
                        parsedTicketPrice,
                        collateralContractWithSigner,
                        walletAddress,
                        sportsAMMContract.address
                    ).then((a) => {
                        if (!mountedRef.current) return null;
                        setHasAllowance(a);
                    });
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && calculatedTotalBuyIn) {
                isVoucherSelected || isEth ? setHasAllowance(true) : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        calculatedTotalBuyIn,
        selectedCollateralIndex,
        isVoucherSelected,
        isMultiCollateralSupported,
        networkId,
        selectedCollateral,
        isDefaultCollateral,
        isEth,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && multipleCollateral && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const collateralContractWithSigner = isDefaultCollateral
                    ? sUSDContract?.connect(signer)
                    : multipleCollateral[selectedCollateral]?.connect(signer);

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

            const transactions: any = [];

            markets.forEach(async (market: ParlaysMarket) => {
                const marketAddress = market.address;
                const selectedPosition = market.position;
                const singleTokenBonus = tokenAndBonus.find((t) => t.sportMarketAddress === marketAddress);

                const tokenAmount = singleTokenBonus !== undefined ? singleTokenBonus.tokenAmount : 0.0;
                const ammQuote = (await fetchAmmQuote(tokenAmount, market)) ?? 0;
                const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(tokenAmount).toString());

                transactions.push(
                    new Promise(async (resolve, reject) => {
                        const id = toast.loading(t('market.toast-message.transaction-pending'));

                        try {
                            const referralId =
                                walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                                    ? getReferralId()
                                    : null;
                            const tx = await getAMMSportsTransaction(
                                isVoucherSelected,
                                overtimeVoucher ? overtimeVoucher.id : 0,
                                collateralAddress,
                                isDefaultCollateral,
                                isEth,
                                networkId,
                                sportsAMMContractWithSigner,
                                overtimeVoucherContractWithSigner,
                                marketAddress,
                                selectedPosition,
                                parsedAmount,
                                ammQuote,
                                referralId,
                                ethers.utils.parseEther('0.02'),
                                isAA
                            );

                            const txResult = isAA ? tx : await tx.wait();

                            if (txResult && txResult.transactionHash) {
                                resolve(
                                    toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')))
                                );
                                dispatch(removeFromParlay(marketAddress));
                                refetchBalances(walletAddress, networkId);
                            } else {
                                reject(
                                    toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')))
                                );
                            }
                        } catch (e) {
                            reject(toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'))));
                        }
                    })
                );
            });

            await Promise.all(transactions)
                .then(() => {
                    PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.multiSingleBuy, {
                        props: {
                            value: Number(calculatedTotalCollateralBuyIn),
                            collateral: selectedCollateralIndex,
                            networkId,
                        },
                    });
                    setIsBuying(false);
                    dispatch(setPaymentAmountToBuy(''));
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    };

    const MIN_TOKEN_AMOUNT = 1;
    useEffect(() => {
        // If AMM is paused
        if (isAMMPaused) {
            setSubmitDisabled(true);
            return;
        }

        const anyTokenAmtUnderMin = tokenAndBonus.some(
            (t) => Number.isNaN(t.tokenAmount) || Number(t.tokenAmount) < MIN_TOKEN_AMOUNT
        );
        const anyUsdAmtUnderZero = multiSingleAmounts.some((s) => Number(s.amountToBuy) <= 0);

        if (anyUsdAmtUnderZero || anyTokenAmtUnderMin || isBuying || isAllowing) {
            setSubmitDisabled(true);
            return;
        }

        if (!hasAllowance) {
            setSubmitDisabled(false);
            return;
        }

        setSubmitDisabled(!paymentTokenBalance || calculatedTotalBuyIn > paymentTokenBalance);
    }, [
        isBuying,
        isAllowing,
        hasAllowance,
        paymentTokenBalance,
        multiSingleAmounts,
        tokenAndBonus,
        calculatedTotalBuyIn,
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
                <Button
                    onClick={() =>
                        dispatch(
                            setWalletConnectModalVisibility({
                                visibility: true,
                            })
                        )
                    }
                    {...defaultButtonProps}
                >
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        if (!hasAllowance) {
            return (
                <Button
                    disabled={submitDisabled}
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
            <Button disabled={submitDisabled} onClick={async () => handleSubmit()} {...defaultButtonProps}>
                {t(`common.buy-side`)}
            </Button>
        );
    };

    const setTooltipTextMessageUsdAmount = useCallback(
        (market: ParlaysMarket, value: string | number, isMax: boolean) => {
            const toolTipRecords = tooltipTextCollateralAmount;
            const positionOdds = getPositionOdds(market);
            const ammQuote = tokenAndBonus.find((t) => t.sportMarketAddress === market.address)?.ammQuote ?? 1;

            let totalBuyIn = 0;
            multiSingleAmounts.forEach((m) => {
                if (m.sportMarketAddress === market.address) {
                    totalBuyIn += Number(value);
                } else {
                    totalBuyIn += Number(m.amountToBuy);
                }
            });

            if (value && Number(value) < quoteForMinAmount) {
                const decimals = isStableCollateral ? 2 : getPrecision(quoteForMinAmount);
                toolTipRecords[market.address] = t('markets.parlay.validation.single-min-amount', {
                    min: `${formatCurrencyWithKey(
                        selectedCollateral,
                        ceilNumberToDecimals(quoteForMinAmount, decimals),
                        decimals
                    )}${
                        isDefaultCollateral
                            ? ''
                            : ` (${formatCurrencyWithSign(USD_SIGN, ceilNumberToDecimals(positionOdds), 2)})`
                    }`,
                });
                setHasValidationError(true);
            } else if (ammQuote === 0) {
                toolTipRecords[market.address] = t('markets.parlay.validation.availability');
                setHasValidationError(true);
            } else if (totalBuyIn > paymentTokenBalance && isMax) {
                Object.keys(toolTipRecords).forEach((record) => {
                    if (toolTipRecords[record] === t('markets.parlay.validation.no-funds')) {
                        toolTipRecords[record] = '';
                    }
                });
                toolTipRecords[market.address] = t('markets.parlay.validation.no-funds');
                setHasValidationError(true);
            } else {
                toolTipRecords[market.address] = '';
                setHasValidationError(false);
            }

            setTooltipTextCollateralAmount(toolTipRecords);
        },
        [
            multiSingleAmounts,
            paymentTokenBalance,
            t,
            tooltipTextCollateralAmount,
            tokenAndBonus,
            selectedCollateral,
            isStableCollateral,
            quoteForMinAmount,
            isDefaultCollateral,
        ]
    );

    useEffect(() => {
        setHasValidationError(false);
        setTooltipTextCollateralAmount({});
        // No point in adding a tool tip to all vals. Lets just set the tooltip on the highest value
        if (multiSingleAmounts.length) {
            const maxMsVal = multiSingleAmounts.reduce((max, ms) => (max.amountToBuy > ms.amountToBuy ? max : ms));

            const market = markets.find((m) => m.address === maxMsVal.sportMarketAddress);
            if (market !== undefined) {
                setTooltipTextMessageUsdAmount(market, maxMsVal.amountToBuy, true);
            }
        }
    }, [
        isVoucherSelected,
        setTooltipTextMessageUsdAmount,
        collateralAmountValue,
        multiSingleAmounts,
        markets,
        selectedCollateralIndex,
    ]);

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const hidePayout = isRecalculating || hasValidationError;

    const totalProfitPercentage = (calculatedTotalTokenAmount - calculatedTotalUsdBuyIn) / calculatedTotalUsdBuyIn;

    const onModalClose = useCallback(() => {
        setShowShareTicketModal(false);
    }, []);

    const twitterShareDisabled = submitDisabled || !hasAllowance;
    const onTwitterIconClick = () => {
        // create data copy to avoid modal re-render while opened
        const modalData: ShareTicketModalProps = {
            markets: markets,
            multiSingle: true,
            totalQuote: getPositionOdds(markets[0]),
            paid: Number(calculatedTotalUsdBuyIn),
            payout: Number(calculatedTotalTokenAmount),
            onClose: onModalClose,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(!twitterShareDisabled);
    };

    const setMultiSingleUsdCollateral = (market: ParlaysMarket, value: number | string) => {
        const isFetchingRecords = isFetching;
        isFetchingRecords[market.address] = true;
        setIsFetching(isFetchingRecords);

        new Promise((resolve) => {
            dispatch(
                setMultiSingle({
                    sportMarketAddress: market.address,
                    parentMarketAddress: market.parentMarket ? market.parentMarket : market.address,
                    amountToBuy: value,
                })
            );
            resolve(true);
        }).then(() => {
            setTooltipTextMessageUsdAmount(market, value, false);
        });
    };

    const collateralRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <ListContainer>
                {markets.map((market, index) => {
                    const outOfLiquidity = false;
                    return (
                        <div key={`${index}-${market.address}-ms`}>
                            <RowMarket outOfLiquidity={outOfLiquidity}>
                                <MatchInfo market={market} isHighlighted={true} />
                            </RowMarket>
                            <AmountToBuyMultiContainer ref={inputRef}>
                                <AmountToBuyMultiInfoLabel>{t('markets.parlay.buy-in')}:</AmountToBuyMultiInfoLabel>{' '}
                                <NumericInput
                                    key={`${index}-${market.address}-ms-amount`}
                                    value={
                                        multiSingleAmounts.find((m) => market.address === m.sportMarketAddress)
                                            ?.amountToBuy || ''
                                    }
                                    onChange={(e) => {
                                        setMultiSingleUsdCollateral(market, e.target.value);
                                    }}
                                    showValidation={
                                        inputRefVisible &&
                                        !!tooltipTextCollateralAmount[market.address] &&
                                        !openApprovalModal
                                    }
                                    validationMessage={tooltipTextCollateralAmount[market.address] || ''}
                                    inputFontSize="13px"
                                    inputFontWeight="700"
                                    inputTextAlign="center"
                                    inputPadding="2px 0px"
                                    width="80px"
                                    height="21px"
                                    margin="0 0 5px 2px"
                                    containerWidth="auto"
                                    borderColor={theme.input.borderColor.tertiary}
                                />
                                <AmountToBuyMultiPayoutLabel>{t('markets.parlay.payout')}:</AmountToBuyMultiPayoutLabel>{' '}
                                <AmountToBuyMultiPayoutValue isInfo={true}>
                                    {isFetching[market.address] ||
                                    !tokenAndBonus.find((t) => t.sportMarketAddress === market.address)?.tokenAmount
                                        ? '-'
                                        : formatCurrencyWithSign(
                                              USD_SIGN,
                                              tokenAndBonus.find((t) => t.sportMarketAddress === market.address)
                                                  ?.tokenAmount || 0.0,
                                              2
                                          )}
                                </AmountToBuyMultiPayoutValue>
                            </AmountToBuyMultiContainer>
                        </div>
                    );
                })}
            </ListContainer>
            <RowSummary columnDirection={true}>
                <RowContainer>
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
                    <SummaryValue isCurrency={true} isHidden={bonusCurrency === 0 || hidePayout}>
                        ({formatCurrencyWithSign('+ ' + USD_SIGN, bonusCurrency)})
                    </SummaryValue>
                </RowContainer>
            </RowSummary>
            <Voucher disabled={isAllowing || isBuying} />
            <RowSummary ref={collateralRef}>
                <SummaryLabel>{t('markets.parlay.pay-with')}:</SummaryLabel>
                <CollateralContainer>
                    <CollateralSelector
                        collateralArray={getCollaterals(networkId)}
                        selectedItem={selectedCollateralIndex}
                        onChangeCollateral={() => {}}
                        disabled={isVoucherSelected}
                        isDetailedView
                        collateralBalances={multipleCollateralBalances.data}
                        exchangeRates={exchangeRates}
                        dropDownWidth={collateralRef.current?.getBoundingClientRect().width + 'px'}
                    />
                </CollateralContainer>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.in-wallet')}:</SummaryLabel>
                <SummaryValue isCollateralInfo={true}>
                    {formatCurrencyWithKey(selectedCollateral, paymentTokenBalance)}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.buy-in')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : isDefaultCollateral
                        ? formatCurrencyWithSign(USD_SIGN, calculatedTotalCollateralBuyIn)
                        : `${formatCurrencyWithKey(
                              selectedCollateral,
                              calculatedTotalCollateralBuyIn
                          )} (${formatCurrencyWithSign(USD_SIGN, Number(calculatedTotalUsdBuyIn))})`}
                </SummaryValue>
            </RowSummary>
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.skew')}:</InfoLabel>
                    <InfoValue>
                        {isRecalculating
                            ? '-'
                            : calculatedSkewAverage < 0
                            ? '0.00%'
                            : formatPercentage(calculatedSkewAverage)}
                    </InfoValue>
                </InfoWrapper>
            </InfoContainer>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout ? '-' : formatCurrencyWithSign(USD_SIGN, calculatedTotalTokenAmount, 2)}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.potential-profit')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : `${formatCurrencyWithSign(
                              USD_SIGN,

                              calculatedTotalTokenAmount - calculatedTotalUsdBuyIn,
                              2
                          )} (${formatPercentage(totalProfitPercentage)})`}
                </SummaryValue>
            </RowSummary>
            <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>
            <ShareWrapper>
                <TwitterIcon disabled={twitterShareDisabled} onClick={onTwitterIconClick} />
            </ShareWrapper>
            {/* TODO: similar to parlay modal */}

            {showShareTicketModal && (
                <ShareTicketModal
                    markets={shareTicketModalData.markets}
                    multiSingle={true}
                    totalQuote={shareTicketModalData.totalQuote}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={onModalClose}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(calculatedTotalBuyIn) * (1 + APPROVAL_BUFFER)}
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

const RowMarket = styled.div<{ outOfLiquidity: boolean }>`
    display: flex;
    position: relative;
    height: 45px;
    align-items: center;
    text-align: center;
    padding: ${(props) => (props.outOfLiquidity ? '5px' : '5px 0px')};
    ${(props) => (props.outOfLiquidity ? 'background: rgba(26, 28, 43, 0.5);' : '')}
    ${(props) => (props.outOfLiquidity ? `border: 2px solid ${props.theme.status.loss};` : '')}
    ${(props) => (props.outOfLiquidity ? 'border-radius: 2px;' : '')}
`;

export default MultiSingle;

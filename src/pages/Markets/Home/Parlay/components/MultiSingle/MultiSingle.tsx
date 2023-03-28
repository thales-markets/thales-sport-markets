import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERALS_INDEX, USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER, COLLATERALS, OddsType } from 'constants/markets';
import { BigNumber, ethers } from 'ethers';
import useAvailablePerPositionMultiQuery from 'queries/markets/useAvailablePerPositionMultiQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { removeAll, setPayment, setMultiSingle, removeFromParlay } from 'redux/modules/parlay';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import {
    AvailablePerPosition,
    MultiSingleAmounts,
    MultiSingleTokenQuoteAndBonus,
    ParlayPayment,
    ParlaysMarket,
} from 'types/markets';
import { getAMMSportsTransaction, getAmountForApproval, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import {
    countDecimals,
    floorNumberToDecimals,
    formatCurrencyWithSign,
    formatPercentage,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getBonus, getPositionOdds } from 'utils/markets';
import { checkAllowance, getMaxGasLimitForNetwork, isMultiCollateralSupportedForNetwork } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import Payment from '../Payment';
import ShareTicketModal from '../ShareTicketModal';
import { ShareTicketModalProps } from '../ShareTicketModal/ShareTicketModal';
import {
    AmountToBuyMultiContainer,
    AmountToBuyMultiInfoLabel,
    AmountToBuyMultiInput,
    AmountToBuyMultiPayoutLabel,
    AmountToBuyMultiPayoutValue,
    InfoContainer,
    InfoLabel,
    InfoValue,
    InfoWrapper,
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
import { ListContainer } from 'pages/Profile/components/Positions/styled-components';
import MatchInfo from '../MatchInfo';
import styled from 'styled-components';
import { bigNumberFormatter } from 'utils/formatters/ethers';

type MultiSingleProps = {
    markets: ParlaysMarket[];
    parlayPayment: ParlayPayment;
    multiSingleAmounts: MultiSingleAmounts[];
};

const MultiSingle: React.FC<MultiSingleProps> = ({ markets, parlayPayment, multiSingleAmounts }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [selectedStableIndex, setSelectedStableIndex] = useState<COLLATERALS_INDEX>(
        parlayPayment.selectedStableIndex
    );
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean | undefined>(parlayPayment.isVoucherSelected);
    const [totalBonusPercentageDec, setTotalBonusPercentageDec] = useState(0);
    const [bonusCurrency, setBonusCurrency] = useState(0);
    const [calculatedTotalTokenAmount, setCalculatedTotalTokenAmount] = useState(0);
    const [calculatedSkewAverage, setCalculatedSkewAverage] = useState(0);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>(parlayPayment.amountToBuy);
    const [tokenAndBonus, setTokenAndBonus] = useState<MultiSingleTokenQuoteAndBonus[]>(
        Array(markets.length).fill({
            sportMarketAddress: '',
            tokenAmount: 0,
            bonusPercentageDec: 0,
            totalBonusCurrency: 0,
            ammQuote: 0,
        })
    );
    const [isFetching, setIsFetching] = useState<Record<string, boolean>>({});
    const [isAllowing, setIsAllowing] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [hasValidationError, setHasValidationError] = useState(false);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<Record<string, string>>({});
    const [availablePerPosition, setAvailablePerPosition] = useState<Record<string, AvailablePerPosition>>({});
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: true,
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

    const fetchAmmQuote = useCallback(
        async (amountForQuote: number, market: ParlaysMarket) => {
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

                if (isMultiCollateralSupported && selectedStableIndex !== COLLATERALS_INDEX.sUSD) {
                    return ammQuote[0];
                }

                return ammQuote;
            }
        },
        [isMultiCollateralSupported, networkId, selectedStableIndex]
    );

    const fetchSkew = useCallback(async (amountForQuote: number, market: ParlaysMarket) => {
        const { sportsAMMContract } = networkConnector;
        if (sportsAMMContract && amountForQuote) {
            const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(amountForQuote).toString());
            const skewQuote = await sportsAMMContract?.buyPriceImpact(market.address, market.position, parsedAmount);

            return bigNumberFormatter(skewQuote);
        }
    }, []);

    const calculatedBonusPercentageDec = useMemo(() => {
        return markets.map((market) => getBonus(market) / 100);
    }, [markets]);

    const calculatedTotalBuyIn = useMemo(() => {
        return multiSingleAmounts.reduce((a, b) => a + b.amountToBuy, 0);
    }, [multiSingleAmounts]);

    useEffect(() => {
        let isSubscribed = true; // Use for race condition

        const fetchData = async () => {
            setIsRecalculating(true);

            const divider = selectedStableIndex == 0 || selectedStableIndex == 1 ? 1e18 : 1e6;
            const { sportsAMMContract, signer } = networkConnector;
            const tokenAndBonusArr = [] as MultiSingleTokenQuoteAndBonus[];
            const isFetchingRecords = isFetching;
            let totalTokenAmount = 0;
            let totalBonusPercentage = 0;
            let totalBonusCurrency = 0;
            let skewTotal = 0;

            for (let i = 0; i < markets.length; i++) {
                const address = markets[i].address;
                let tokenAmount = 0;
                let bonusPercent = 0;

                if (signer && sportsAMMContract) {
                    const contract = new ethers.Contract(markets[i].address, sportsMarketContract.abi, signer);
                    contract.connect(signer);

                    const amtToBuy = multiSingleAmounts[i].amountToBuy;
                    const availAmount = availablePerPosition[markets[i].address]
                        ? availablePerPosition[markets[i].address][markets[i].position]?.available || 0
                        : 0;
                    const roundedMaxAmount = floorNumberToDecimals(availAmount);

                    if (roundedMaxAmount) {
                        const [sUSDToSpendForMaxAmount, ammBalances, skewImpact] = await Promise.all([
                            await fetchAmmQuote(roundedMaxAmount, markets[i]),
                            contract.balancesOf(sportsAMMContract?.address),
                            await fetchSkew(amtToBuy, markets[i]),
                        ]);

                        skewTotal += skewImpact ?? 0;

                        if (!mountedRef.current || !isSubscribed) return null;

                        const ammBalanceForSelectedPosition = ammBalances[markets[i].position];

                        const amountOfTokens =
                            fetchAmountOfTokensForXsUSDAmount(
                                Number(amtToBuy),
                                getPositionOdds(markets[i]),
                                sUSDToSpendForMaxAmount / divider,
                                availAmount,
                                ammBalanceForSelectedPosition / divider
                            ) || 0;

                        if (amountOfTokens > availAmount) {
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

                        const parsedQuote = quote / divider;

                        const recalculatedTokenAmount = roundNumberToDecimals(
                            (amountOfTokens * Number(amtToBuy)) / parsedQuote
                        );

                        const maxAvailableTokenAmount =
                            recalculatedTokenAmount > flooredAmountOfTokens
                                ? flooredAmountOfTokens
                                : recalculatedTokenAmount;

                        tokenAmount = maxAvailableTokenAmount;
                        totalTokenAmount += tokenAmount;

                        if (Number(multiSingleAmounts[i].amountToBuy) > 0) {
                            const newQuote = maxAvailableTokenAmount / Number(amtToBuy);
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

            setCalculatedSkewAverage(skewTotal / markets.length);
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
        selectedStableIndex,
        fetchAmmQuote,
        availablePerPosition,
        markets,
        multiSingleAmounts,
        fetchSkew,
        isFetching,
        isMultiCollateralSupported,
        networkId,
    ]);

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
        if (sportsAMMContract && signer) {
            let collateralContractWithSigner: ethers.Contract | undefined;

            if (selectedStableIndex !== 0 && multipleCollateral && isMultiCollateralSupported) {
                collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
            } else {
                collateralContractWithSigner = sUSDContract?.connect(signer);
            }

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = getAmountForApproval(
                        selectedStableIndex,
                        Number(calculatedTotalBuyIn).toString(),
                        networkId
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
                isVoucherSelected ? setHasAllowance(true) : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        calculatedTotalBuyIn,
        selectedStableIndex,
        isVoucherSelected,
        isMultiCollateralSupported,
        networkId,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;

                if (
                    selectedStableIndex !== 0 &&
                    multipleCollateral &&
                    multipleCollateral[selectedStableIndex] &&
                    isMultiCollateralSupported
                ) {
                    collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = sportsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(addressToApprove, approveAmount, {
                    gasLimit: getMaxGasLimitForNetwork(networkId),
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
                                selectedStableIndex,
                                networkId,
                                sportsAMMContractWithSigner,
                                overtimeVoucherContractWithSigner,
                                marketAddress,
                                selectedPosition,
                                parsedAmount,
                                ammQuote,
                                referralId,
                                ethers.utils.parseEther('0.02'),
                                { gasLimit: getMaxGasLimitForNetwork(networkId) }
                            );

                            const txResult = await tx.wait();

                            if (txResult && txResult.transactionHash) {
                                resolve(
                                    toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')))
                                );
                                trackEvent({
                                    category: 'parlay-multi-single',
                                    action: `buy-with-${COLLATERALS[selectedStableIndex]}`,
                                    value: Number(calculatedTotalBuyIn),
                                });
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
                    setIsBuying(false);
                    setUsdAmountValue('');
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    };

    const MIN_TOKEN_AMOUNT = 1;
    useEffect(() => {
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
    ]);

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }

        if (!hasAllowance) {
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

    const setTooltipTextMessageUsdAmount = useCallback(
        (market: ParlaysMarket, value: string | number, isMax: boolean) => {
            const toolTipRecords = tooltipTextUsdAmount;

            const positionOdds = roundNumberToDecimals(getPositionOdds(market));
            const ammQuote = tokenAndBonus.find((t) => t.sportMarketAddress === market.address)?.ammQuote ?? 1;

            let totalBuyIn = 0;
            multiSingleAmounts.forEach((m) => {
                if (m.sportMarketAddress === market.address) {
                    totalBuyIn += Number(value);
                } else {
                    totalBuyIn += m.amountToBuy;
                }
            });

            if (value && Number(value) < positionOdds) {
                toolTipRecords[market.address] = t('markets.parlay.validation.single-min-amount', {
                    min: formatCurrencyWithSign(USD_SIGN, positionOdds, 2),
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

            setTooltipTextUsdAmount(toolTipRecords);
        },
        [multiSingleAmounts, paymentTokenBalance, t, tooltipTextUsdAmount, tokenAndBonus]
    );

    useEffect(() => {
        setHasValidationError(false);
        setTooltipTextUsdAmount({});
        // No point in adding a tool tip to all vals. Lets just set the tooltip on the highest value
        const maxMsVal = multiSingleAmounts.reduce((max, ms) => (max.amountToBuy > ms.amountToBuy ? max : ms));

        const market = markets.find((m) => m.address === maxMsVal.sportMarketAddress);
        if (market !== undefined) {
            setTooltipTextMessageUsdAmount(market, maxMsVal.amountToBuy, true);
        }
    }, [
        isVoucherSelected,
        setTooltipTextMessageUsdAmount,
        usdAmountValue,
        multiSingleAmounts,
        markets,
        selectedStableIndex,
    ]);

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const hidePayout = isRecalculating || hasValidationError;

    const totalProfitPercentage = (calculatedTotalTokenAmount - calculatedTotalBuyIn) / calculatedTotalBuyIn;

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
            paid: Number(calculatedTotalBuyIn),
            payout: Number(calculatedTotalTokenAmount),
            onClose: onModalClose,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(!twitterShareDisabled);
    };

    const setMultiSingleUsd = (market: ParlaysMarket, value: number) => {
        const isFetchingRecords = isFetching;
        isFetchingRecords[market.address] = true;
        setIsFetching(isFetchingRecords);

        new Promise((resolve) => {
            dispatch(
                setMultiSingle({
                    sportMarketAddress: market.address,
                    amountToBuy: value,
                })
            );
            resolve(true);
        }).then(() => {
            setTooltipTextMessageUsdAmount(market, value, false);
        });
    };
    return (
        <>
            <ListContainer>
                {markets.map((market, index) => {
                    const outOfLiquidity = false;
                    return (
                        <>
                            <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                <MatchInfo market={market} isHighlighted={true} />
                            </RowMarket>
                            <AmountToBuyMultiContainer ref={inputRef}>
                                <AmountToBuyMultiInfoLabel>{t('markets.parlay.buy-in')}:</AmountToBuyMultiInfoLabel>{' '}
                                <ValidationTooltip
                                    open={
                                        inputRefVisible && !!tooltipTextUsdAmount[market.address] && !openApprovalModal
                                    }
                                    title={tooltipTextUsdAmount[market.address]}
                                    placement={'top'}
                                    arrow={true}
                                >
                                    <AmountToBuyMultiInput
                                        key={index}
                                        name="usdAmount"
                                        type="number"
                                        value={
                                            multiSingleAmounts.find((m) => market.address === m.sportMarketAddress)
                                                ?.amountToBuy || ''
                                        }
                                        onChange={(e) => {
                                            if (countDecimals(Number(e.target.value)) > 2) {
                                                return;
                                            }
                                            setMultiSingleUsd(market, Number(e.target.value));
                                        }}
                                    />
                                </ValidationTooltip>
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
                        </>
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
            <Payment
                defaultSelectedStableIndex={selectedStableIndex}
                defaultIsVoucherSelected={isVoucherSelected}
                onChangeCollateral={(index) => setSelectedStableIndex(index)}
                setIsVoucherSelectedProp={setIsVoucherSelected}
            />
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.buy-in')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout ? '-' : formatCurrencyWithSign(USD_SIGN, calculatedTotalBuyIn, 2)}
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
                              calculatedTotalTokenAmount - calculatedTotalBuyIn,
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
                    defaultAmount={Number(calculatedTotalBuyIn) + Number(calculatedTotalBuyIn) * APPROVAL_BUFFER}
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

const RowMarket = styled.div<{ outOfLiquidity: boolean }>`
    display: flex;
    position: relative;
    height: 45px;
    align-items: center;
    text-align: center;
    padding: ${(props) => (props.outOfLiquidity ? '5px' : '5px 0px')};
    ${(props) => (props.outOfLiquidity ? 'background: rgba(26, 28, 43, 0.5);' : '')}
    ${(props) => (props.outOfLiquidity ? 'border: 2px solid #e26a78;' : '')}
    ${(props) => (props.outOfLiquidity ? 'border-radius: 2px;' : '')}
`;

export default MultiSingle;

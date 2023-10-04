import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER } from 'constants/markets';
import { BigNumber, ethers } from 'ethers';
import useAvailablePerPositionMultiQuery from 'queries/markets/useAvailablePerPositionMultiQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    removeAll,
    setPayment,
    setMultiSingle,
    removeFromParlay,
    getMultiSingle,
    removeCombinedPosition,
} from 'redux/modules/parlay';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import {
    AvailablePerPosition,
    CombinedParlayMarket,
    MultiSingleTokenQuoteAndBonus,
    ParlayPayment,
    ParlaysMarket,
} from 'types/markets';
import { getAMMSportsTransaction, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import {
    countDecimals,
    floorNumberToDecimals,
    formatCurrencyWithSign,
    formatPercentage,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getBonus, getPositionOdds } from 'utils/markets';
import { checkAllowance, getDefaultDecimalsForNetwork, isMultiCollateralSupportedForNetwork } from 'utils/network';
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
    AmountToBuyMultiPayoutLabel,
    AmountToBuyMultiPayoutValue,
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
import { ListContainer } from 'pages/Profile/components/Positions/styled-components';
import MatchInfo from '../MatchInfo';
import styled, { useTheme } from 'styled-components';
import { bigNumberFormatter, stableCoinParser } from 'utils/formatters/ethers';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import { getCollateral, getStablecoinDecimals } from 'utils/collaterals';
import { OddsType } from 'enums/markets';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import { ThemeInterface } from 'types/ui';
import MatchInfoOfCombinedMarket from '../MatchInfoOfCombinedMarket';
import useParlayAmmDataQuery from 'queries/markets/useParlayAmmDataQuery';
import { getParlayAMMTransaction, getParlayMarketsAMMQuoteMethod } from 'utils/parlayAmm';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';

type MultiSingleProps = {
    markets: ParlaysMarket[];
    combinedMarkets?: CombinedParlayMarket[];
    parlayPayment: ParlayPayment;
};

const MultiSingle: React.FC<MultiSingleProps> = ({ markets, combinedMarkets, parlayPayment }) => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const multiSingleAmounts = useSelector(getMultiSingle);

    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState<{ sportsAmm: boolean; parlayAmm: boolean }>({
        sportsAmm: false,
        parlayAmm: false,
    });
    const [isAMMPaused, setIsAMMPaused] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<{ sportsAmm: boolean; parlayAmm: boolean }>({
        sportsAmm: false,
        parlayAmm: false,
    });
    const [selectedStableIndex, setSelectedStableIndex] = useState(parlayPayment.selectedStableIndex);
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean | undefined>(parlayPayment.isVoucherSelected);
    const [totalBonusPercentageDec, setTotalBonusPercentageDec] = useState(0);
    const [bonusCurrency, setBonusCurrency] = useState(0);
    const [calculatedTotalTokenAmount, setCalculatedTotalTokenAmount] = useState(0);
    const [calculatedSkewAverage, setCalculatedSkewAverage] = useState(0);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>(parlayPayment.amountToBuy);
    const [tokenAndBonus, setTokenAndBonus] = useState<MultiSingleTokenQuoteAndBonus[]>(
        Array(markets.length)
            .fill({
                sportMarketAddress: '',
                isCombinedPosition: false,
                tokenAmount: 0,
                bonusPercentageDec: 0,
                totalBonusCurrency: 0,
                ammQuote: 0,
            })
            .concat(
                Array(combinedMarkets ? combinedMarkets.length : 0).fill({
                    sportMarketAddress: '',
                    isCombinedPosition: true,
                    tokenAmount: 0,
                    bonusPercentageDec: 0,
                    totalBonusCurrency: 0,
                    ammQuote: 0,
                })
            )
    );
    const [isFetching, setIsFetching] = useState<Record<string, boolean>>({});
    const [isAllowing, setIsAllowing] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [minUsdAmountValue, setMinUsdAmountValue] = useState<number>(0);
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

    const parlayAmmDataQuery = useParlayAmmDataQuery(networkId, {
        enabled: isAppReady,
    });

    const parlayAmmData = useMemo(() => {
        if (parlayAmmDataQuery.isSuccess && parlayAmmDataQuery.data) {
            return parlayAmmDataQuery.data;
        }
        return undefined;
    }, [parlayAmmDataQuery.isSuccess, parlayAmmDataQuery.data]);

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

    useEffect(() => {
        setMinUsdAmountValue(parlayAmmData?.minUsdAmount || 0);
    }, [parlayAmmData?.minUsdAmount]);

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

                return isMultiCollateralSupported && selectedStableIndex !== 0 ? ammQuote[0] : ammQuote;
            }
        },
        [isMultiCollateralSupported, networkId, selectedStableIndex]
    );

    const fetchParlayAmmQuote = useCallback(
        async (combinedMarket: CombinedParlayMarket, susdAmountForQuote: number) => {
            const { parlayMarketsAMMContract } = networkConnector;
            if (parlayMarketsAMMContract && minUsdAmountValue) {
                const marketsAddresses = combinedMarket.markets.map((market) => market.address);
                const selectedPositions = combinedMarket.markets.map((market) => market.position);
                const minUsdAmount =
                    susdAmountForQuote < minUsdAmountValue
                        ? minUsdAmountValue // deafult value for qoute info
                        : susdAmountForQuote;
                const susdPaid = stableCoinParser(roundNumberToDecimals(minUsdAmount).toString(), networkId);
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
                    console.log('E ', e);
                    return null;
                }
            }
        },
        [networkId, selectedStableIndex, minUsdAmountValue]
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

    const amountsForAllowance = useMemo(() => {
        let amountForSportsAmm = 0;
        let amountForParlayAmm = 0;
        multiSingleAmounts.forEach((item) =>
            item.sportMarketAddress.includes('-')
                ? (amountForParlayAmm += item.amountToBuy)
                : (amountForSportsAmm += item.amountToBuy)
        );

        return {
            sportsAmm: amountForSportsAmm,
            parlayAmm: amountForParlayAmm,
        };
    }, [multiSingleAmounts]);

    const calculatedTotalBuyIn = useMemo(() => {
        return multiSingleAmounts.reduce((a, b) => a + b.amountToBuy, 0);
    }, [multiSingleAmounts]);

    useEffect(() => {
        let isSubscribed = true; // Use for race condition

        const fetchData = async () => {
            setIsRecalculating(true);

            const divider = isVoucherSelected
                ? Number(`1e${getDefaultDecimalsForNetwork(networkId)}`)
                : Number(`1e${getStablecoinDecimals(networkId, selectedStableIndex)}`);
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
                            isCombinedPosition: false,
                            tokenAmount: tokenAmount,
                            bonusPercentageDec: bonusPercent,
                            totalBonusCurrency: totalBonusCurrency,
                            ammQuote: quote,
                        });
                    }
                }
                isFetchingRecords[address] = false;
            }

            if (combinedMarkets?.length) {
                for (let i = 0; i < combinedMarkets?.length; i++) {
                    try {
                        const marketsAddresses = combinedMarkets[i].markets.map((market) => market.address);

                        const { parlayMarketsAMMContract } = networkConnector;
                        const amountForCombinedPosition = multiSingleAmounts.find(
                            (item) => item.sportMarketAddress == marketsAddresses.join('-')
                        )?.amountToBuy;

                        if (
                            parlayMarketsAMMContract &&
                            amountForCombinedPosition &&
                            Number(amountForCombinedPosition) >= 0 &&
                            minUsdAmountValue
                        ) {
                            const parlayAmmQuote = await fetchParlayAmmQuote(
                                combinedMarkets[i],
                                Number(amountForCombinedPosition)
                            );

                            if (parlayAmmQuote) {
                                // const parlayAmmTotalQuote = bigNumberFormatter(parlayAmmQuote['totalQuote']);
                                const parlayAmmTotalBuyAmount = bigNumberFormatter(parlayAmmQuote['totalBuyAmount']);

                                const susdPaid = stableCoinParser(
                                    roundNumberToDecimals(
                                        Number(amountForCombinedPosition)
                                            ? Number(amountForCombinedPosition)
                                            : minUsdAmountValue
                                    ).toString(),
                                    networkId
                                );

                                skewTotal += bigNumberFormatter(parlayAmmQuote['skewImpact'] || 0);
                                totalTokenAmount += parlayAmmTotalBuyAmount;

                                tokenAndBonusArr.push({
                                    sportMarketAddress: marketsAddresses.join('-'),
                                    tokenAmount: parlayAmmTotalBuyAmount,
                                    bonusPercentageDec: 0,
                                    totalBonusCurrency: 0,
                                    ammQuote: susdPaid,
                                });
                            }
                        }
                        isFetchingRecords[marketsAddresses.join('-')] = false;
                    } catch (e) {
                        console.log('E ', e);
                    }
                }
            }
            setIsFetching(isFetchingRecords);

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
        isVoucherSelected,
        combinedMarkets,
        minUsdAmountValue,
        fetchParlayAmmQuote,
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
        const {
            sportsAMMContract,
            parlayMarketsAMMContract,
            sUSDContract,
            signer,
            multipleCollateral,
        } = networkConnector;
        if (sportsAMMContract && parlayMarketsAMMContract && signer) {
            let collateralContractWithSigner: ethers.Contract | undefined;
            const collateral = getCollateral(networkId, selectedStableIndex);
            if (selectedStableIndex !== 0 && multipleCollateral && isMultiCollateralSupported) {
                collateralContractWithSigner = multipleCollateral[collateral]?.connect(signer);
            } else {
                collateralContractWithSigner = sUSDContract?.connect(signer);
            }

            const getAllowance = async () => {
                try {
                    const parsedAmountForSportsAmm = stableCoinParser(
                        Number(amountsForAllowance.sportsAmm).toString(),
                        networkId,
                        getCollateral(networkId, selectedStableIndex)
                    );
                    const parsedAmountForParlayAmm = stableCoinParser(
                        Number(amountsForAllowance.sportsAmm).toString(),
                        networkId,
                        getCollateral(networkId, selectedStableIndex)
                    );

                    const allowanceTx = [];

                    allowanceTx.push(
                        checkAllowance(
                            parsedAmountForSportsAmm,
                            collateralContractWithSigner,
                            walletAddress,
                            sportsAMMContract.address
                        ),
                        checkAllowance(
                            parsedAmountForParlayAmm,
                            collateralContractWithSigner,
                            walletAddress,
                            parlayMarketsAMMContract.address
                        )
                    );

                    Promise.all(allowanceTx).then((allowanceResponses) => {
                        if (!mountedRef.current) return null;
                        setHasAllowance({ sportsAmm: allowanceResponses[0], parlayAmm: allowanceResponses[1] });
                    });
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && calculatedTotalBuyIn) {
                isVoucherSelected ? setHasAllowance({ sportsAmm: true, parlayAmm: true }) : getAllowance();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        walletAddress,
        isWalletConnected,
        isAllowing,
        calculatedTotalBuyIn,
        selectedStableIndex,
        isVoucherSelected,
        isMultiCollateralSupported,
        networkId,
    ]);

    const handleAllowanceSportsAmm = async (approveAmount: BigNumber) => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;
                const collateral = getCollateral(networkId, selectedStableIndex);
                if (
                    selectedStableIndex !== 0 &&
                    multipleCollateral &&
                    multipleCollateral[collateral] &&
                    isMultiCollateralSupported
                ) {
                    collateralContractWithSigner = multipleCollateral[collateral]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = sportsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(
                    addressToApprove,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal({ ...openApprovalModal, sportsAmm: false });
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

    const handleAllowanceParlayAmm = async (approveAmount: BigNumber) => {
        const { parlayMarketsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (parlayMarketsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;
                const collateral = getCollateral(networkId, selectedStableIndex);
                if (
                    selectedStableIndex !== 0 &&
                    multipleCollateral &&
                    multipleCollateral[collateral] &&
                    isMultiCollateralSupported
                ) {
                    collateralContractWithSigner = multipleCollateral[collateral]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = parlayMarketsAMMContract.address;

                setOpenApprovalModal({ ...openApprovalModal, sportsAmm: false });
                const tx = (await collateralContractWithSigner?.approve(
                    addressToApprove,
                    approveAmount
                )) as ethers.ContractTransaction;

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
        const { sportsAMMContract, overtimeVoucherContract, parlayMarketsAMMContract, signer } = networkConnector;
        if (sportsAMMContract && overtimeVoucherContract && parlayMarketsAMMContract && signer) {
            setIsBuying(true);
            const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
            const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);
            const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

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
                                ethers.utils.parseEther('0.02')
                            );

                            const txResult = await tx.wait();

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

            combinedMarkets?.forEach(async (combinedMarket: CombinedParlayMarket) => {
                const marketAddressesArr = combinedMarket.markets.map((market) => market.address);
                const positionsArr = combinedMarket.positions;
                const parentAddress = combinedMarket.markets.find((market) => market.parentMarket)?.parentMarket || '';

                const singleTokenBonus = tokenAndBonus.find(
                    (t) => t.sportMarketAddress === marketAddressesArr.join('-')
                );

                const expectedPayout =
                    singleTokenBonus !== undefined
                        ? stableCoinParser(
                              roundNumberToDecimals(Number(singleTokenBonus.tokenAmount)).toString(),
                              networkId
                          )
                        : 0.0;
                const additionalSlippage = ethers.utils.parseEther('0.02');

                transactions.push(
                    new Promise(async (resolve, reject) => {
                        const id = toast.loading(t('market.toast-message.transaction-pending'));

                        try {
                            const referralId =
                                walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                                    ? getReferralId()
                                    : null;
                            const tx = await getParlayAMMTransaction(
                                isVoucherSelected,
                                overtimeVoucher ? overtimeVoucher.id : 0,
                                selectedStableIndex,
                                networkId,
                                parlayMarketsAMMContractWithSigner,
                                overtimeVoucherContractWithSigner,
                                marketAddressesArr,
                                positionsArr,
                                singleTokenBonus?.ammQuote,
                                expectedPayout,
                                referralId,
                                additionalSlippage
                            );

                            const txResult = await tx.wait();

                            if (txResult && txResult.transactionHash) {
                                resolve(
                                    toast.update(id, getSuccessToastOptions(t('market.toast-message.buy-success')))
                                );
                                dispatch(removeCombinedPosition(parentAddress));
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
                            value: Number(calculatedTotalBuyIn),
                            collateral: getCollateral(networkId, selectedStableIndex),
                            networkId,
                        },
                    });
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
        // If AMM is paused
        if (isAMMPaused) {
            setSubmitDisabled(true);
            return;
        }

        const anyTokenAmtUnderMin = tokenAndBonus.some(
            (t) => Number.isNaN(t.tokenAmount) || Number(t.tokenAmount) < MIN_TOKEN_AMOUNT
        );
        const anyUsdAmtUnderZero = multiSingleAmounts.some((s) => Number(s.amountToBuy) <= 0);

        if (anyUsdAmtUnderZero || anyTokenAmtUnderMin || isBuying || isAllowing || hasValidationError) {
            setSubmitDisabled(true);
            return;
        }

        if (
            (!hasAllowance.sportsAmm && amountsForAllowance.sportsAmm > 0) ||
            (!hasAllowance.parlayAmm && amountsForAllowance.parlayAmm > 0)
        ) {
            setSubmitDisabled(false);
            return;
        }

        setSubmitDisabled(!paymentTokenBalance || calculatedTotalBuyIn > paymentTokenBalance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <Button onClick={() => openConnectModal?.()} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        if (!hasAllowance.sportsAmm && amountsForAllowance.sportsAmm > 0) {
            return (
                <Button
                    disabled={submitDisabled}
                    onClick={() => setOpenApprovalModal({ ...openApprovalModal, sportsAmm: true })}
                    {...defaultButtonProps}
                >
                    {t('common.wallet.approve-sports')}
                </Button>
            );
        }

        if (!hasAllowance.parlayAmm && amountsForAllowance.parlayAmm > 0) {
            return (
                <Button
                    disabled={submitDisabled}
                    onClick={() => setOpenApprovalModal({ ...openApprovalModal, parlayAmm: true })}
                    {...defaultButtonProps}
                >
                    {t('common.wallet.approve-parlay')}
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
        (
            market: ParlaysMarket | undefined,
            combinedMarket: CombinedParlayMarket | undefined,
            value: string | number,
            isMax: boolean
        ) => {
            const toolTipRecords = tooltipTextUsdAmount;

            const fullAddress = market
                ? market.address
                : combinedMarket?.markets.map((market) => market.address).join('-') ?? '';

            const positionOdds = market
                ? roundNumberToDecimals(getPositionOdds(market))
                : combinedMarket?.totalOdd
                ? combinedMarket?.totalOdd
                : 0;
            const ammQuote = tokenAndBonus.find((t) => t.sportMarketAddress === fullAddress)?.ammQuote ?? 1;

            let totalBuyIn = 0;
            multiSingleAmounts.forEach((m) => {
                if (m.sportMarketAddress === fullAddress) {
                    totalBuyIn += Number(value);
                } else {
                    totalBuyIn += m.amountToBuy;
                }
            });

            if (value && Number(value) < positionOdds) {
                toolTipRecords[fullAddress] = t('markets.parlay.validation.single-min-amount', {
                    min: formatCurrencyWithSign(USD_SIGN, positionOdds, 2),
                });
                setHasValidationError(true);
            } else if (combinedMarket && Number(value) < minUsdAmountValue) {
                toolTipRecords[fullAddress] = t('markets.parlay.validation.single-min-amount', {
                    min: formatCurrencyWithSign(USD_SIGN, minUsdAmountValue, 2),
                });
                setHasValidationError(true);
            } else if (ammQuote === 0) {
                toolTipRecords[fullAddress] = t('markets.parlay.validation.availability');
                setHasValidationError(true);
            } else if (totalBuyIn > paymentTokenBalance && isMax) {
                Object.keys(toolTipRecords).forEach((record) => {
                    if (toolTipRecords[record] === t('markets.parlay.validation.no-funds')) {
                        toolTipRecords[record] = '';
                    }
                });
                toolTipRecords[fullAddress] = t('markets.parlay.validation.no-funds');
                setHasValidationError(true);
            } else {
                toolTipRecords[fullAddress] = '';
                setHasValidationError(false);
            }

            setTooltipTextUsdAmount(toolTipRecords);
        },
        [tooltipTextUsdAmount, tokenAndBonus, multiSingleAmounts, minUsdAmountValue, paymentTokenBalance, t]
    );

    useEffect(() => {
        setHasValidationError(false);
        setTooltipTextUsdAmount({});
        // No point in adding a tool tip to all vals. Lets just set the tooltip on the highest value
        if (multiSingleAmounts.length) {
            const maxMsVal = multiSingleAmounts.reduce((max, ms) => (max.amountToBuy > ms.amountToBuy ? max : ms));

            const market = markets.find((m) => m.address === maxMsVal.sportMarketAddress);
            const combinedMarket = combinedMarkets?.find(
                (combinedMarket) =>
                    combinedMarket.markets.map((market) => market.address).join('-') == maxMsVal.sportMarketAddress
            );
            if (market !== undefined || combinedMarket !== undefined) {
                setTooltipTextMessageUsdAmount(market, combinedMarket, maxMsVal.amountToBuy, true);
            }
        }
    }, [
        isVoucherSelected,
        setTooltipTextMessageUsdAmount,
        usdAmountValue,
        multiSingleAmounts,
        markets,
        selectedStableIndex,
        combinedMarkets,
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
        const combinedParlayMarkets = combinedMarkets
            ? combinedMarkets.map((item) => item.markets.map((market) => market))
            : [];
        const finalMarkets = combinedParlayMarkets ? markets.concat(...combinedParlayMarkets) : markets;

        const modalData: ShareTicketModalProps = {
            markets: finalMarkets,
            multiSingle: true,
            totalQuote: getPositionOdds(markets[0]),
            paid: Number(calculatedTotalBuyIn),
            payout: Number(calculatedTotalTokenAmount),
            onClose: onModalClose,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(!twitterShareDisabled);
    };

    const setMultiSingleUsd = (
        market: ParlaysMarket | undefined,
        combinedMarket: CombinedParlayMarket | undefined,
        value: number
    ) => {
        const isFetchingRecords = isFetching;

        const marketAddresses = combinedMarket ? combinedMarket.markets.map((market) => market.address) : [];
        const parentMarketAddresses = combinedMarket ? combinedMarket.markets.map((market) => market.parentMarket) : [];

        isFetchingRecords[market ? market.address : marketAddresses.join('-')] = true;
        setIsFetching(isFetchingRecords);

        new Promise((resolve) => {
            dispatch(
                setMultiSingle({
                    sportMarketAddress: market ? market.address : marketAddresses.join('-'),
                    parentMarketAddress: market
                        ? market.parentMarket
                            ? market.parentMarket
                            : market.address
                        : parentMarketAddresses.join('-'),
                    amountToBuy: value,
                })
            );
            resolve(true);
        }).then(() => {
            setTooltipTextMessageUsdAmount(market, combinedMarket, value, false);
        });
    };

    return (
        <>
            <ListContainer>
                {combinedMarkets &&
                    combinedMarkets.map((combinedPosition, index) => {
                        const outOfLiquidity = false;
                        const marketAddresses = combinedPosition.markets.map((position) => position.address);
                        return (
                            <div key={`${index}-${marketAddresses.join('-')}-ms`}>
                                <RowMarket outOfLiquidity={outOfLiquidity}>
                                    <MatchInfoOfCombinedMarket combinedMarket={combinedPosition} isHighlighted={true} />
                                </RowMarket>
                                <AmountToBuyMultiContainer ref={inputRef}>
                                    <AmountToBuyMultiInfoLabel>{t('markets.parlay.buy-in')}:</AmountToBuyMultiInfoLabel>{' '}
                                    <NumericInput
                                        key={`${index}-${marketAddresses.join('-')}-ms-amount`}
                                        value={
                                            multiSingleAmounts.find(
                                                (m) => marketAddresses.join('-') === m.sportMarketAddress
                                            )?.amountToBuy || ''
                                        }
                                        onChange={(e) => {
                                            if (Number(countDecimals(Number(e.target.value))) > 2) {
                                                return;
                                            }
                                            setMultiSingleUsd(undefined, combinedPosition, Number(e.target.value));
                                        }}
                                        showValidation={
                                            inputRefVisible &&
                                            !!tooltipTextUsdAmount[marketAddresses.join('-')] &&
                                            !openApprovalModal.parlayAmm
                                        }
                                        validationMessage={tooltipTextUsdAmount[marketAddresses.join('-')] || ''}
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
                                    <AmountToBuyMultiPayoutLabel>
                                        {t('markets.parlay.payout')}:
                                    </AmountToBuyMultiPayoutLabel>{' '}
                                    <AmountToBuyMultiPayoutValue isInfo={true}>
                                        {isFetching[marketAddresses.join('-')] ||
                                        !tokenAndBonus.find((t) => t.sportMarketAddress === marketAddresses.join('-'))
                                            ?.tokenAmount
                                            ? '-'
                                            : formatCurrencyWithSign(
                                                  USD_SIGN,
                                                  tokenAndBonus.find(
                                                      (t) => t.sportMarketAddress === marketAddresses.join('-')
                                                  )?.tokenAmount || 0.0,
                                                  2
                                              )}
                                    </AmountToBuyMultiPayoutValue>
                                </AmountToBuyMultiContainer>
                            </div>
                        );
                    })}
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
                                        if (Number(countDecimals(Number(e.target.value))) > 2) {
                                            return;
                                        }
                                        setMultiSingleUsd(market, undefined, Number(e.target.value));
                                    }}
                                    showValidation={
                                        inputRefVisible &&
                                        !!tooltipTextUsdAmount[market.address] &&
                                        !openApprovalModal.sportsAmm
                                    }
                                    validationMessage={tooltipTextUsdAmount[market.address] || ''}
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
            {openApprovalModal.sportsAmm && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={
                        Number(amountsForAllowance.sportsAmm) + Number(amountsForAllowance.sportsAmm) * APPROVAL_BUFFER
                    }
                    collateralIndex={selectedStableIndex}
                    tokenSymbol={getCollateral(networkId, selectedStableIndex)}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowanceSportsAmm}
                    onClose={() => setOpenApprovalModal({ sportsAmm: false, parlayAmm: false })}
                />
            )}
            {openApprovalModal.parlayAmm && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={
                        Number(amountsForAllowance.parlayAmm) + Number(amountsForAllowance.parlayAmm) * APPROVAL_BUFFER
                    }
                    collateralIndex={selectedStableIndex}
                    tokenSymbol={getCollateral(networkId, selectedStableIndex)}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowanceParlayAmm}
                    onClose={() => setOpenApprovalModal({ sportsAmm: false, parlayAmm: false })}
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

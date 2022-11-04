import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERALS_INDEX, USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER, COLLATERALS, MAX_USD_SLIPPAGE } from 'constants/markets';
import { MAX_GAS_LIMIT } from 'constants/network';
import { MAX_L2_GAS_LIMIT, Position, Side } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import useAvailablePerSideQuery from 'queries/markets/useAvailablePerSideQuery';
import useMarketBalancesQuery from 'queries/markets/useMarketBalancesQuery';
import usePositionPriceDetailsQuery from 'queries/markets/usePositionPriceDetailsQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { AMMPosition, AvailablePerSide, Balances, ParlayPayment, ParlaysMarket } from 'types/markets';
import { getAMMSportsTransaction, getAmountForApproval, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import {
    countDecimals,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithSign,
    formatPercentage,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds, getPositionOdds } from 'utils/markets';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import {
    AmountToBuyContainer,
    AmountToBuyInput,
    ValidationTooltip,
    InfoContainer,
    InfoLabel,
    InfoValue,
    InfoWrapper,
    InputContainer,
    MaxButton,
    RowSummary,
    SubmitButton,
    SummaryLabel,
    SummaryValue,
} from '../styled-components';
import Payment from '../Payment';
import { removeAll, setPayment } from 'redux/modules/parlay';

type SingleProps = {
    market: ParlaysMarket;
    parlayPayment: ParlayPayment;
};

const Single: React.FC<SingleProps> = ({ market, parlayPayment }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);

    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [selectedStableIndex, setSelectedStableIndex] = useState<COLLATERALS_INDEX>(
        parlayPayment.selectedStableIndex
    );
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(parlayPayment.isVoucherSelected);
    const [tokenAmount, setTokenAmount] = useState<number>(0);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>(parlayPayment.amountToBuy);
    const [maxUsdAmount, setMaxUsdAmount] = useState<number>(0);
    const [availableUsdAmount, setAvailableUsdAmount] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<string>('');
    const [availablePerSide, setAvailablePerSide] = useState<AvailablePerSide>({
        positions: {
            [Position.HOME]: {
                available: 0,
            },
            [Position.AWAY]: {
                available: 0,
            },
            [Position.DRAW]: {
                available: 0,
            },
        },
    });
    const [balances, setBalances] = useState<Balances | undefined>(undefined);
    const [ammPosition, setAmmPosition] = useState<AMMPosition>({
        sides: {
            [Side.BUY]: {
                quote: 0,
                priceImpact: 0,
            },
            [Side.SELL]: {
                quote: 0,
                priceImpact: 0,
            },
        },
    });

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        setIsVoucherSelected(false);
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

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
        // Used for transition between Single and Ticket
        dispatch(setPayment({ selectedStableIndex, isVoucherSelected, amountToBuy: usdAmountValue }));
    }, [dispatch, selectedStableIndex, isVoucherSelected, usdAmountValue]);

    const isMounted = useRef(false);
    useEffect(() => {
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
                    true,
                    selectedStableIndex,
                    networkId,
                    sportsAMMContract,
                    market.address,
                    market.position,
                    parsedAmount
                );

                if (selectedStableIndex !== COLLATERALS_INDEX.sUSD) {
                    return ammQuote[0];
                }
                return ammQuote;
            }
        },
        [market.address, market.position, networkId, selectedStableIndex]
    );

    useEffect(() => {
        const getMaxUsdAmount = async () => {
            setIsFetching(true);
            const { sportsAMMContract } = networkConnector;
            if (sportsAMMContract) {
                const roundedMaxAmount = floorNumberToDecimals(availablePerSide.positions[market.position].available);
                const divider =
                    selectedStableIndex === COLLATERALS_INDEX.sUSD || selectedStableIndex == COLLATERALS_INDEX.DAI
                        ? 1e18
                        : 1e6;
                const susdToSpendForMaxAmount = await fetchAmmQuote(roundedMaxAmount);
                const decimalSusdToSpendForMaxAmount = susdToSpendForMaxAmount / divider;

                setAvailableUsdAmount(floorNumberToDecimals(decimalSusdToSpendForMaxAmount));

                if (paymentTokenBalance > decimalSusdToSpendForMaxAmount) {
                    if (paymentTokenBalance * MAX_USD_SLIPPAGE >= decimalSusdToSpendForMaxAmount) {
                        setMaxUsdAmount(floorNumberToDecimals(decimalSusdToSpendForMaxAmount));
                    } else {
                        const calculatedMaxAmount = paymentTokenBalance * MAX_USD_SLIPPAGE;
                        setMaxUsdAmount(floorNumberToDecimals(calculatedMaxAmount));
                    }
                    setIsFetching(false);
                    return;
                }
                setMaxUsdAmount(floorNumberToDecimals(paymentTokenBalance * MAX_USD_SLIPPAGE));
            }
            setIsFetching(false);
            return;
        };
        getMaxUsdAmount();
    }, [
        usdAmountValue,
        balances,
        paymentTokenBalance,
        selectedStableIndex,
        market.address,
        market.position,
        availablePerSide.positions,
        fetchAmmQuote,
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const divider = selectedStableIndex == 0 || selectedStableIndex == 1 ? 1e18 : 1e6;
            const { sportsAMMContract, signer } = networkConnector;
            if (signer && sportsAMMContract) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                contract.connect(signer);
                const roundedMaxAmount = floorNumberToDecimals(availablePerSide.positions[market.position].available);
                if (roundedMaxAmount) {
                    const [sUSDToSpendForMaxAmount, ammBalances] = await Promise.all([
                        fetchAmmQuote(roundedMaxAmount),
                        contract.balancesOf(sportsAMMContract?.address),
                    ]);
                    const ammBalanceForSelectedPosition = ammBalances[market.position];

                    const amountOfTokens =
                        fetchAmountOfTokensForXsUSDAmount(
                            Number(usdAmountValue),
                            getPositionOdds(market),
                            sUSDToSpendForMaxAmount / divider,
                            availablePerSide.positions[market.position].available,
                            ammBalanceForSelectedPosition / divider
                        ) || 0;

                    if (amountOfTokens > availablePerSide.positions[market.position].available) {
                        setTokenAmount(0);
                        return;
                    }
                    const flooredAmountOfTokens = floorNumberToDecimals(amountOfTokens);
                    const quote = await fetchAmmQuote(flooredAmountOfTokens);
                    const parsedQuote = quote / divider;

                    const recalculatedTokenAmount = roundNumberToDecimals(
                        (amountOfTokens * Number(usdAmountValue)) / parsedQuote
                    );
                    const maxAvailableTokenAmount =
                        recalculatedTokenAmount > flooredAmountOfTokens
                            ? flooredAmountOfTokens
                            : recalculatedTokenAmount;
                    setTokenAmount(maxAvailableTokenAmount);
                }
            }
        };

        fetchData().catch((e) => console.log(e));
    }, [usdAmountValue, selectedStableIndex, fetchAmmQuote, availablePerSide.positions, market]);

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: !!market.address && isWalletConnected,
    });

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

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

    const availablePerSideQuery = useAvailablePerSideQuery(market.address, Side.BUY, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (availablePerSideQuery.isSuccess && availablePerSideQuery.data) {
            setAvailablePerSide(availablePerSideQuery.data);
        }
    }, [availablePerSideQuery.isSuccess, availablePerSideQuery.data]);

    useEffect(() => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            let collateralContractWithSigner: ethers.Contract | undefined;

            if (selectedStableIndex !== 0 && multipleCollateral) {
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
                        sportsAMMContract.address
                    );
                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected) {
                isVoucherSelected ? setAllowance(true) : getAllowance();
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
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;

                if (selectedStableIndex !== 0 && multipleCollateral && multipleCollateral[selectedStableIndex]) {
                    collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = sportsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.approve-success')));
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
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));

            try {
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;
                const tx = await getAMMSportsTransaction(
                    true,
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
                    { gasLimit: MAX_L2_GAS_LIMIT }
                );

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchBalances(walletAddress, networkId);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.buy-success')));
                    setIsBuying(false);
                    setUsdAmount('');
                    setTokenAmount(0);

                    trackEvent({
                        category: 'AMM',
                        action: `buy-with-${COLLATERALS[selectedStableIndex]}`,
                        value: Number(formatCurrency(ammPosition.sides[Side.BUY].quote, 3, true)),
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
        const MIN_TOKEN_AMOUNT = 1;

        const checkDisabled = async () => {
            if (!hasAllowance) {
                setSubmitDisabled(false);
                return;
            }

            if (!Number(usdAmountValue) || !tokenAmount || tokenAmount < MIN_TOKEN_AMOUNT || isBuying || isAllowing) {
                setSubmitDisabled(true);
                return;
            }

            setSubmitDisabled(!paymentTokenBalance || usdAmountValue > paymentTokenBalance);
            return;
        };
        checkDisabled();
    }, [usdAmountValue, isBuying, isAllowing, hasAllowance, paymentTokenBalance, tokenAmount]);

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
                <SubmitButton disabled={submitDisabled} onClick={async () => setOpenApprovalModal(true)}>
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

    return (
        <>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.total-quote')}:</SummaryLabel>
                <SummaryValue>{formatMarketOdds(selectedOddsType, getPositionOdds(market))}</SummaryValue>
            </RowSummary>
            <Payment
                defaultSelectedStableIndex={selectedStableIndex}
                defaultIsVoucherSelected={isVoucherSelected}
                onChangeCollateral={(index) => setSelectedStableIndex(index)}
                setIsVoucherSelectedProp={setIsVoucherSelected}
            />
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.buy-amount')}:</SummaryLabel>
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
                        <MaxButton disabled={isFetching} onClick={() => setUsdAmount(maxUsdAmount)}>
                            {t('markets.market-details.max')}
                        </MaxButton>
                    </AmountToBuyContainer>
                </ValidationTooltip>
            </InputContainer>
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.available')}:</InfoLabel>
                    <InfoValue>{formatCurrencyWithSign(USD_SIGN, availableUsdAmount)}</InfoValue>
                </InfoWrapper>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.skew')}:</InfoLabel>
                    <InfoValue>
                        {positionPriceDetailsQuery.isLoading
                            ? '-'
                            : formatPercentage(ammPosition.sides[Side.BUY].priceImpact)}
                    </InfoValue>
                </InfoWrapper>
            </InfoContainer>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {!tokenAmount || positionPriceDetailsQuery.isLoading || !!tooltipTextUsdAmount
                        ? '-'
                        : formatCurrencyWithSign(USD_SIGN, tokenAmount, 2)}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.potential-profit')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {ammPosition.sides[Side.BUY].quote <= 0 ||
                    !tokenAmount ||
                    positionPriceDetailsQuery.isLoading ||
                    !!tooltipTextUsdAmount
                        ? '-'
                        : `${formatCurrencyWithSign(
                              USD_SIGN,
                              tokenAmount - ammPosition.sides[Side.BUY].quote,
                              2
                          )} (${formatPercentage(
                              (tokenAmount - ammPosition.sides[Side.BUY].quote) / ammPosition.sides[Side.BUY].quote
                          )})`}
                </SummaryValue>
            </RowSummary>
            <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>
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

export default Single;

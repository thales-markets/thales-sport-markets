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
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { getAmountForApproval } from 'utils/amm';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import {
    countDecimals,
    formatCurrency,
    formatCurrencyWithSign,
    formatPercentage,
    roundNumberToDecimals,
} from 'utils/formatters/number';
import { formatMarketOdds } from 'utils/markets';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { getParlayAMMTransaction, getParlayMarketsAMMQuoteMethod } from 'utils/parlayAmm';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import {
    AmountToBuyContainer,
    AmountToBuyInput,
    CustomTooltip,
    InfoContainer,
    InfoLabel,
    InfoValue,
    InfoWrapper,
    InputContainer,
    RowSummary,
    SubmitButton,
    SummaryLabel,
    SummaryValue,
} from '../styled-components';
import Payment from '../Payment';

type TicketProps = {
    markets: ParlaysMarket[];
};

const Ticket: React.FC<TicketProps> = ({ markets }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);

    const [selectedStableIndex, setSelectedStableIndex] = useState<COLLATERALS_INDEX>(COLLATERALS_INDEX.sUSD);
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(false);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>('');
    const [totalQuote, setTotalQuote] = useState(0);
    const [finalQuotes, setFinalQuotes] = useState<number[]>([]);
    const [skew, setSkew] = useState(0);
    const [totalBuyAmount, setTotalBuyAmount] = useState(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<string>('');
    const [tooltipTextTotalQuote, setTooltipTextTotalQuote] = useState<string>('');
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

    const parlayAmmDataQuery = useParlayAmmDataQuery(networkId, {
        enabled: isAppReady && isWalletConnected,
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
            setIsVoucherSelected(true);
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

    const fetchParlayAmmQuote = useCallback(
        async (susdAmountForQuote: number) => {
            const { parlayMarketsAMMContract, signer } = networkConnector;
            if (parlayMarketsAMMContract && signer) {
                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);
                const marketsAddresses = markets.map((market) => market.address);
                const selectedPositions = markets.map((market) => market.position);
                const susdPaid = ethers.utils.parseEther(roundNumberToDecimals(susdAmountForQuote).toString());
                const parlayAmmQuote = await getParlayMarketsAMMQuoteMethod(
                    true,
                    selectedStableIndex,
                    networkId,
                    parlayMarketsAMMContractWithSigner,
                    marketsAddresses,
                    selectedPositions,
                    susdPaid
                );

                return parlayAmmQuote;
            }
        },
        [networkId, selectedStableIndex, markets]
    );

    const setTooltipTextMessageTotalQuote = useCallback(
        (value: number, quotes: number[]) => {
            if (quotes.some((quote) => quote === 0)) {
                setTooltipTextTotalQuote(t('markets.parlay.validation.availability'));
            } else if (parlayAmmData?.maxSupportedOdds && value < parlayAmmData?.maxSupportedOdds) {
                setTooltipTextTotalQuote(
                    selectedOddsType === OddsType.AMM
                        ? t('markets.parlay.validation.min-quote', {
                              value: formatMarketOdds(selectedOddsType, parlayAmmData?.maxSupportedOdds),
                          })
                        : t('markets.parlay.validation.max-quote', {
                              value: formatMarketOdds(selectedOddsType, parlayAmmData?.maxSupportedOdds),
                          })
                );
            } else {
                setTooltipTextTotalQuote('');
            }
        },
        [parlayAmmData?.maxSupportedOdds, t, selectedOddsType]
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsFetching(true);
            if (
                Number(usdAmountValue) >= 0 ||
                (parlayAmmData?.maxSupportedAmount && Number(usdAmountValue) > parlayAmmData?.maxSupportedAmount)
            ) {
                const parlayAmmQuote = await fetchParlayAmmQuote(Number(usdAmountValue) || 1);
                const fetchedTotalQuote = bigNumberFormatter(parlayAmmQuote['totalQuote']);

                setTotalQuote(fetchedTotalQuote);
                setSkew(bigNumberFormatter(parlayAmmQuote['skewImpact'] || 0));
                setTotalBuyAmount(bigNumberFormatter(parlayAmmQuote['totalBuyAmount']));

                const fetchedFinalQuotes: number[] = (parlayAmmQuote['finalQuotes'] || []).map((quote: BigNumber) =>
                    bigNumberFormatter(quote)
                );
                setFinalQuotes(fetchedFinalQuotes);

                setTooltipTextMessageTotalQuote(fetchedTotalQuote, fetchedFinalQuotes);
            }
            setIsFetching(false);
        };
        fetchData();
    }, [usdAmountValue, fetchParlayAmmQuote, parlayAmmData?.maxSupportedAmount, setTooltipTextMessageTotalQuote]);

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
        const { parlayMarketsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (parlayMarketsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
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
        const { parlayMarketsAMMContract, overtimeVoucherContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && overtimeVoucherContract && signer) {
            setIsBuying(true);
            const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);
            const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);

            const id = toast.loading(t('market.toast-messsage.transaction-pending'));

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
                    true,
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
                    additionalSlippage
                );

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchBalances(walletAddress, networkId);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.buy-success')));
                    setIsBuying(false);
                    setUsdAmount(0);

                    trackEvent({
                        category: 'AMM',
                        action: `buy-with-${COLLATERALS[selectedStableIndex]}`,
                        value: Number(formatCurrency(totalQuote, 3, true)),
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

    const MIN_SUSD_AMOUNT = 1;

    useEffect(() => {
        const checkDisabled = async () => {
            if (!hasAllowance) {
                setSubmitDisabled(false);
                return;
            }
            //
            if (!Number(usdAmountValue) || Number(usdAmountValue) < MIN_SUSD_AMOUNT || isBuying || isAllowing) {
                setSubmitDisabled(true);
                return;
            }
            // Quote is below minimum (currently 0.05)
            if (parlayAmmData?.maxSupportedOdds && totalQuote < parlayAmmData?.maxSupportedOdds) {
                setSubmitDisabled(true);
                return;
            }
            // Not enough funds
            setSubmitDisabled(!paymentTokenBalance || usdAmountValue > paymentTokenBalance);
            return;
        };
        checkDisabled();
    }, [
        usdAmountValue,
        isBuying,
        isAllowing,
        hasAllowance,
        paymentTokenBalance,
        totalQuote,
        parlayAmmData?.maxSupportedOdds,
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
            if (value && Number(value) < MIN_SUSD_AMOUNT) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.min-amount', { min: MIN_SUSD_AMOUNT }));
            } else if (parlayAmmData?.maxSupportedAmount && Number(value) > parlayAmmData?.maxSupportedAmount) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.amount-exceeded'));
            } else if (Number(value) > paymentTokenBalance) {
                setTooltipTextUsdAmount(t('markets.parlay.validation.no-funds'));
            } else {
                setTooltipTextUsdAmount('');
            }
        },
        [parlayAmmData?.maxSupportedAmount, t, paymentTokenBalance]
    );

    useEffect(() => {
        setTooltipTextMessageUsdAmount(usdAmountValue);
    }, [isVoucherSelected, setTooltipTextMessageUsdAmount, usdAmountValue]);

    const setUsdAmount = (value: string | number) => {
        setUsdAmountValue(value);
        setTooltipTextMessageUsdAmount(value);
        setTooltipTextMessageTotalQuote(totalQuote, finalQuotes);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    return (
        <>
            <CustomTooltip
                open={inputRefVisible && !!tooltipTextTotalQuote && !openApprovalModal}
                title={tooltipTextTotalQuote}
            >
                <RowSummary>
                    <SummaryLabel>{t('markets.parlay.total-quote')}:</SummaryLabel>
                    <SummaryValue>{formatMarketOdds(selectedOddsType, totalQuote)}</SummaryValue>
                </RowSummary>
            </CustomTooltip>
            <Payment
                onChangeCollateral={(index) => setSelectedStableIndex(index)}
                setIsVoucherSelectedProp={setIsVoucherSelected}
            />
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.buy-amount')}:</SummaryLabel>
            </RowSummary>
            <InputContainer ref={inputRef}>
                <CustomTooltip
                    open={inputRefVisible && !!tooltipTextUsdAmount && !openApprovalModal}
                    title={tooltipTextUsdAmount}
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
                </CustomTooltip>
            </InputContainer>
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.parlay-fee')}:</InfoLabel>
                    <InfoValue>
                        {!parlayAmmData?.parlayAmmFee || isFetching
                            ? '-'
                            : formatPercentage(parlayAmmData?.parlayAmmFee)}
                    </InfoValue>
                    <InfoLabel marginLeft={10}>{t('markets.parlay.safebox-fee')}:</InfoLabel>
                    <InfoValue>
                        {!parlayAmmData?.safeBoxImpact || isFetching
                            ? '-'
                            : formatPercentage(parlayAmmData?.safeBoxImpact)}
                    </InfoValue>
                </InfoWrapper>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.skew')}:</InfoLabel>
                    <InfoValue>{isFetching ? '-' : formatPercentage(skew)}</InfoValue>
                </InfoWrapper>
            </InfoContainer>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {Number(usdAmountValue) <= 0 || totalBuyAmount === 0 || isFetching
                        ? '-'
                        : formatCurrencyWithSign(USD_SIGN, totalBuyAmount, 2)}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.potential-profit')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {Number(usdAmountValue) <= 0 || totalBuyAmount === 0 || isFetching
                        ? '-'
                        : `${formatCurrencyWithSign(
                              USD_SIGN,
                              totalBuyAmount - Number(usdAmountValue),
                              2
                          )} (${formatPercentage((totalBuyAmount - Number(usdAmountValue)) / Number(usdAmountValue))})`}
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

export default Ticket;

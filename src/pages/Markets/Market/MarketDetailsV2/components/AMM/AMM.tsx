/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { BigNumber, ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import networkConnector from 'utils/networkConnector';
import {
    AMMContainer,
    AMMContent,
    AmountToBuyContainer,
    AmountToBuyInput,
    CustomTooltip,
    DetailContainer,
    InputDetails,
    PrimaryLabel,
    MaxButton,
    SecondaryLabel,
    SecondaryValue,
    SubmitButton,
    PotentialProfitContainer,
    PotentialProfit,
    CollateralInfoContainer,
    CollateralInfo,
    Collateral,
    StableBalance,
    SubmitButtonContainer,
} from './styled-components';
import { toast } from 'react-toastify';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useMarketBalancesQuery from 'queries/markets/useMarketBalancesQuery';
import usePositionPriceDetailsQuery from 'queries/markets/usePositionPriceDetailsQuery';
import { refetchBalances } from 'utils/queryConnector';

import { MAX_L2_GAS_LIMIT, Position, Side } from 'constants/options';
import { AMMPosition, AvailablePerSide, Balances, MarketData } from 'types/markets';
import {
    countDecimals,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithSign,
    formatPercentage,
} from 'utils/formatters/number';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { APPROVAL_BUFFER, COLLATERALS, MAX_TOKEN_SLIPPAGE, MAX_USD_SLIPPAGE } from 'constants/markets';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { getAMMSportsTransaction, getAmountForApproval, getSportsAMMQuoteMethod } from 'utils/amm';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import { MAX_GAS_LIMIT } from 'constants/network';
import { getReferralId } from 'utils/referral';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { checkAllowance } from 'utils/network';
import ApprovalModal from 'components/ApprovalModal';
import CollateralSelector from '../CollateralSelector';
import { USD_SIGN } from 'constants/currency';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';
import { getDecimalsByStableCoinIndex } from 'utils/collaterals';
import { useConnectModal } from '@rainbow-me/rainbowkit';

type AMMProps = {
    market: MarketData;
    selectedSide: Side;
    selectedPosition: Position;
    availablePerSide: AvailablePerSide;
};

const AMM: React.FC<AMMProps> = ({ market, selectedSide, selectedPosition, availablePerSide }) => {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();
    const { openConnectModal } = useConnectModal();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [tokenAmount, setTokenAmountValue] = useState<number | string>('');
    const [fieldChanging, setFieldChanging] = useState<string>('');
    const [maxUsdAmount, setMaxUsdAmount] = useState<number>(0);
    const [usdAmountValue, setUSDAmountValue] = useState<number | string>('');
    const [selectedStableIndex, setStableIndex] = useState<number>(0);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<string>('');
    const [tooltipTextTokenAmount, setTooltipTextTokenAmount] = useState<string>('');
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [maxAmount, setMaxAmount] = useState<number>(0);
    const [isBuying, setIsBuying] = useState<boolean>(false);
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
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(false);

    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: !!market.address && isWalletConnected,
    });

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const stableBalances = useMemo(() => {
        return multipleStableBalances.data;
    }, [multipleStableBalances.data]);

    const positionPriceDetailsQuery = usePositionPriceDetailsQuery(
        market.address,
        selectedPosition,
        Number(tokenAmount) || 1,
        selectedStableIndex,
        networkId
    );

    useEffect(() => {
        if (positionPriceDetailsQuery.isSuccess && positionPriceDetailsQuery.data) {
            setAmmPosition(positionPriceDetailsQuery.data);
        }
    }, [positionPriceDetailsQuery.isSuccess, positionPriceDetailsQuery.data]);

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    const referralId =
        walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase() ? getReferralId() : null;

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            setIsVoucherSelected(true);
            return overtimeVoucherQuery.data;
        }
        setIsVoucherSelected(false);
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    const paymentTokenBalance = useMemo(() => {
        if (overtimeVoucher && isVoucherSelected) {
            return Number(overtimeVoucher.remainingAmount.toFixed(2));
        }
        if (multipleStableBalances.data && multipleStableBalances.isSuccess) {
            return Number(multipleStableBalances.data[COLLATERALS[selectedStableIndex]].toFixed(2));
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
        setMaxAmount(0);
    }, [selectedStableIndex]);

    useEffect(() => {
        setStableIndex(0);
    }, [selectedSide]);

    const setTooltipTextMessageTokenAmount = (value: string | number) => {
        if (Number(value) > availablePerSide.positions[selectedPosition].available) {
            setTooltipTextTokenAmount(t('market.tooltip.amount-exceeded'));
        } else if (value && Number(value) < 1) {
            setTooltipTextTokenAmount(t('market.tooltip.minimal-amount'));
        } else {
            setTooltipTextTokenAmount('');
        }
    };

    const setTokenAmount = (value: string | number) => {
        setTokenAmountValue(value);
        setTooltipTextMessageTokenAmount(value);
    };

    const setTooltipTextMessageUsdAmount = (value: string | number) => {
        if (Number(value) > paymentTokenBalance) {
            setTooltipTextUsdAmount(t('market.tooltip.no-funds'));
        } else {
            setTooltipTextUsdAmount('');
        }
    };

    const fetchAmmQuote = useCallback(
        async (amountForQuote: number) => {
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const parsedAmount = ethers.utils.parseEther(amountForQuote.toString());
                const ammQuote = await getSportsAMMQuoteMethod(
                    selectedSide == Side.BUY,
                    selectedStableIndex,
                    networkId,
                    sportsAMMContractWithSigner,
                    market.address,
                    selectedPosition,
                    parsedAmount
                );

                if (selectedStableIndex !== 0) {
                    return ammQuote[0];
                }
                return ammQuote;
            }
        },
        [market.address, networkId, selectedPosition, selectedSide, selectedStableIndex]
    );

    const setUsdAmount = (value: string | number) => {
        setUSDAmountValue(value);
        setTooltipTextMessageUsdAmount(value);
    };

    const onMaxUsdClick = async () => {
        setFieldChanging('usdAmount');
        setUsdAmount(maxUsdAmount);
    };

    const onMaxClick = async () => {
        setFieldChanging('positionsAmount');
        setTokenAmount(maxAmount);
    };

    useDebouncedEffect(() => {
        const fetchData = async () => {
            if (fieldChanging == 'positionsAmount') {
                return;
            }
            const divider = selectedStableIndex == 0 || selectedStableIndex == 1 ? 1e18 : 1e6;
            const { sportsAMMContract, signer } = networkConnector;
            if (signer && sportsAMMContract) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                contract.connect(signer);
                const roundedMaxAmount = floorNumberToDecimals(
                    availablePerSide ? availablePerSide.positions[selectedPosition].available : 0
                );
                if (roundedMaxAmount) {
                    const [sUSDToSpendForMaxAmount, ammBalances] = await Promise.all([
                        fetchAmmQuote(roundedMaxAmount),
                        contract.balancesOf(sportsAMMContract?.address),
                    ]);
                    const ammBalanceForSelectedPosition = ammBalances[selectedPosition];

                    const X = fetchAmountOfTokensForXsUSDAmount(
                        Number(usdAmountValue),
                        Number((market.positions[selectedPosition] as any).sides[Side.BUY].odd / 1),
                        sUSDToSpendForMaxAmount / divider,
                        availablePerSide.positions[selectedPosition].available,
                        ammBalanceForSelectedPosition / divider
                    );

                    if (X > availablePerSide.positions[selectedPosition].available) {
                        setTokenAmount(0);
                        return;
                    }
                    const roundedAmount = floorNumberToDecimals(X);
                    const quote = await fetchAmmQuote(roundedAmount);

                    const usdAmountValueAsNumber = Number(usdAmountValue);
                    const parsedQuote = quote / divider;

                    const recalculatedTokenAmount = ((X * usdAmountValueAsNumber) / parsedQuote).toFixed(2);
                    setTokenAmount(recalculatedTokenAmount);
                }
            }
        };

        fetchData().catch((e) => console.log(e));
    }, [usdAmountValue, selectedStableIndex]);

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
                selectedSide == Side.SELL || isVoucherSelected ? setAllowance(true) : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        tokenAmount,
        usdAmountValue,
        selectedStableIndex,
        selectedSide,
        isVoucherSelected,
    ]);

    useEffect(() => {
        const checkDisabled = async () => {
            if (!hasAllowance) {
                setSubmitDisabled(false);
                return;
            }

            if (selectedSide === Side.BUY) {
                if (
                    !Number(usdAmountValue) ||
                    !Number(tokenAmount) ||
                    Number(tokenAmount) < 1 ||
                    isBuying ||
                    isAllowing
                ) {
                    setSubmitDisabled(true);
                    return;
                }
            } else {
                if (!Number(tokenAmount) || Number(tokenAmount) < 1 || isBuying || isAllowing) {
                    setSubmitDisabled(true);
                    return;
                }
            }

            if (selectedSide === Side.BUY) {
                setSubmitDisabled(
                    !paymentTokenBalance || tokenAmount > maxAmount || usdAmountValue > paymentTokenBalance
                );
                return;
            } else {
                setSubmitDisabled(tokenAmount > maxAmount);
                return;
            }
        };
        checkDisabled();
    }, [tokenAmount, usdAmountValue, isBuying, isAllowing, hasAllowance, selectedSide, paymentTokenBalance, maxAmount]);

    useEffect(() => {
        const getMaxAmount = async () => {
            setIsFetching(true);
            if (selectedSide === Side.BUY) {
                const { sportsAMMContract, signer } = networkConnector;
                if (sportsAMMContract && signer) {
                    const price = ammPosition.sides[selectedSide].quote / (+Number(tokenAmount).toFixed(2) || 1);
                    if (price > 0 && paymentTokenBalance) {
                        let tmpSuggestedAmount = Number(paymentTokenBalance) / Number(price);
                        if (tmpSuggestedAmount > availablePerSide.positions[selectedPosition].available) {
                            setMaxAmount(floorNumberToDecimals(availablePerSide.positions[selectedPosition].available));
                            setIsFetching(false);
                            return;
                        }

                        const ammQuote = await fetchAmmQuote(tmpSuggestedAmount);

                        const ammPrice =
                            bigNumberFormmaterWithDecimals(
                                ammQuote,
                                getDecimalsByStableCoinIndex(selectedStableIndex)
                            ) / Number(tmpSuggestedAmount);
                        // 2 === slippage
                        tmpSuggestedAmount = (Number(paymentTokenBalance) / Number(ammPrice)) * MAX_TOKEN_SLIPPAGE;
                        setMaxAmount(floorNumberToDecimals(tmpSuggestedAmount));
                    }
                }
                setIsFetching(false);
            } else {
                //@ts-ignore
                setMaxAmount(balances?.[Position[selectedPosition].toLowerCase()] || 0);
            }
            setIsFetching(false);
            return;
        };
        getMaxAmount();
    }, [
        selectedSide,
        tokenAmount,
        balances,
        paymentTokenBalance,
        ammPosition,
        selectedStableIndex,
        availablePerSide.positions,
        selectedPosition,
        fetchAmmQuote,
    ]);

    useEffect(() => {
        const getMaxUsdAmount = async () => {
            setIsFetching(true);
            if (selectedSide === Side.BUY) {
                const { sportsAMMContract, signer } = networkConnector;
                if (sportsAMMContract && signer) {
                    const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                    contract.connect(signer);
                    const roundedMaxAmount = floorNumberToDecimals(
                        availablePerSide ? availablePerSide.positions[selectedPosition].available : 0
                    );
                    const divider = selectedStableIndex == 0 || selectedStableIndex == 1 ? 1e18 : 1e6;
                    const sUSDToSpendForMaxAmount = await fetchAmmQuote(roundedMaxAmount);
                    const formattedsUSDToSpendForMaxAmount = sUSDToSpendForMaxAmount / divider;

                    if (Number(paymentTokenBalance) > formattedsUSDToSpendForMaxAmount) {
                        if (formattedsUSDToSpendForMaxAmount <= Number(paymentTokenBalance) * MAX_USD_SLIPPAGE) {
                            setMaxUsdAmount(floorNumberToDecimals(formattedsUSDToSpendForMaxAmount));
                        } else {
                            const calculatedMaxAmount =
                                formattedsUSDToSpendForMaxAmount -
                                (formattedsUSDToSpendForMaxAmount - Number(paymentTokenBalance) * MAX_USD_SLIPPAGE);
                            setMaxUsdAmount(floorNumberToDecimals(calculatedMaxAmount));
                        }
                        setIsFetching(false);
                        return;
                    }
                    setMaxUsdAmount(floorNumberToDecimals(paymentTokenBalance * MAX_USD_SLIPPAGE));
                }
                setIsFetching(false);
            }
            setIsFetching(false);
            return;
        };
        getMaxUsdAmount();
    }, [
        selectedSide,
        usdAmountValue,
        balances,
        paymentTokenBalance,
        selectedStableIndex,
        market.address,
        selectedPosition,
        fetchAmmQuote,
        availablePerSide,
    ]);

    const handleSubmit = async () => {
        if (!!tokenAmount) {
            const { sportsAMMContract, overtimeVoucherContract, signer } = networkConnector;
            if (sportsAMMContract && overtimeVoucherContract && signer) {
                setIsBuying(true);
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const overtimeVoucherContractWithSigner = overtimeVoucherContract.connect(signer);
                const ammQuote = await fetchAmmQuote(+Number(tokenAmount).toFixed(2) || 1);
                const parsedAmount = ethers.utils.parseEther(Number(tokenAmount).toFixed(2));
                const id = toast.loading(t('market.toast-messsage.transaction-pending'));

                try {
                    const tx = await getAMMSportsTransaction(
                        selectedSide === Side.BUY,
                        isVoucherSelected,
                        overtimeVoucher ? overtimeVoucher.id : 0,
                        selectedStableIndex,
                        networkId,
                        sportsAMMContractWithSigner,
                        overtimeVoucherContractWithSigner,
                        market.address,
                        selectedPosition,
                        parsedAmount,
                        ammQuote,
                        referralId,
                        ethers.utils.parseEther('0.02'),
                        { gasLimit: MAX_L2_GAS_LIMIT }
                    );

                    const txResult = await tx.wait();

                    if (txResult && txResult.transactionHash) {
                        refetchBalances(walletAddress, networkId);
                        selectedSide === Side.BUY
                            ? toast.update(id, getSuccessToastOptions(t('market.toast-messsage.buy-success')))
                            : toast.update(id, getSuccessToastOptions(t('market.toast-messsage.sell-success')));
                        setIsBuying(false);
                        setTokenAmount(0);
                        setUsdAmount(0);

                        if (selectedSide === Side.BUY) {
                            trackEvent({
                                category: 'AMM',
                                action: `buy-with-${COLLATERALS[selectedStableIndex]}`,
                                value: Number(formatCurrency(ammPosition.sides[Side.BUY].quote, 3, true)),
                            });
                        } else {
                            trackEvent({
                                category: 'AMM',
                                action: 'sell-to-amm',
                            });
                        }
                    }
                } catch (e) {
                    setIsBuying(false);
                    refetchBalances(walletAddress, networkId);
                    toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                    console.log('Error ', e);
                }
            }
        }
    };

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

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton disabled={submitDisabled} onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        if (!hasAllowance) {
            return (
                <SubmitButton
                    disabled={submitDisabled}
                    onClick={async () => {
                        if (!!tokenAmount) {
                            setOpenApprovalModal(true);
                        }
                    }}
                >
                    {t('common.wallet.approve')}
                </SubmitButton>
            );
        }

        return (
            <SubmitButton
                disabled={submitDisabled}
                onClick={async () => {
                    if (!!tokenAmount) {
                        handleSubmit();
                    }
                }}
            >
                {t(`common.${selectedSide.toLowerCase()}-side`)}
            </SubmitButton>
        );
    };

    const isBuy = selectedSide == Side.BUY;
    const showPotentialProfit = !Number(tokenAmount) || positionPriceDetailsQuery.isLoading || !!tooltipTextUsdAmount;
    const liqudityInfo = floorNumberToDecimals(availablePerSide.positions[selectedPosition].available);
    const showCollateralSelector = selectedSide == Side.BUY && !market.gameStarted;
    const skew = positionPriceDetailsQuery.isLoading
        ? '-'
        : formatPercentage(ammPosition.sides[selectedSide].priceImpact);

    return (
        <>
            <AMMContainer>
                <AMMContent>
                    <PrimaryLabel>
                        {isBuying
                            ? t('markets.market-details.amount-to-buy')
                            : t('markets.market-details.amount-to-sell')}
                    </PrimaryLabel>
                    {isBuy && (
                        <CustomTooltip open={!!tooltipTextUsdAmount && !openApprovalModal} title={tooltipTextUsdAmount}>
                            <AmountToBuyContainer>
                                <AmountToBuyInput
                                    name="usdAmount"
                                    type="number"
                                    value={usdAmountValue}
                                    onChange={(e) => {
                                        if (countDecimals(Number(e.target.value)) > 2) {
                                            return;
                                        }
                                        setFieldChanging(e.target.name);
                                        setUsdAmount(e.target.value);
                                    }}
                                />
                                <MaxButton disabled={isFetching} onClick={onMaxUsdClick}>
                                    {t('markets.market-details.max')}
                                </MaxButton>
                            </AmountToBuyContainer>
                        </CustomTooltip>
                    )}
                    {!isBuy && (
                        <CustomTooltip
                            open={!!tooltipTextTokenAmount && !openApprovalModal}
                            title={tooltipTextTokenAmount}
                        >
                            <AmountToBuyContainer>
                                <AmountToBuyInput
                                    name="positionsAmount"
                                    type="number"
                                    onChange={(e) => {
                                        if (countDecimals(Number(e.target.value)) > 2) {
                                            return;
                                        }
                                        if (Number(e.target.value) >= 0) {
                                            setFieldChanging(e.target.name);
                                            setTokenAmount(e.target.value);
                                        } else {
                                            setUsdAmount(0);
                                        }
                                    }}
                                    value={tokenAmount}
                                />
                                <MaxButton disabled={isFetching} onClick={onMaxClick}>
                                    {t('markets.market-details.max')}
                                </MaxButton>
                            </AmountToBuyContainer>
                        </CustomTooltip>
                    )}
                    <InputDetails>
                        <DetailContainer>
                            <SecondaryLabel>{t('markets.market-details.liquidity')}</SecondaryLabel>
                            <SecondaryValue>{liqudityInfo}</SecondaryValue>
                        </DetailContainer>
                        <DetailContainer>
                            <SecondaryLabel>{t('markets.market-details.skew')}</SecondaryLabel>
                            <SecondaryValue>{skew}</SecondaryValue>
                        </DetailContainer>
                    </InputDetails>
                    {isBuy && (
                        <PotentialProfitContainer>
                            <PrimaryLabel>{t('markets.market-details.potential-profit')}</PrimaryLabel>
                            <PotentialProfit>
                                {showPotentialProfit
                                    ? '-'
                                    : `$${formatCurrency(
                                          Number(tokenAmount) - ammPosition.sides[selectedSide].quote
                                      )} (${formatPercentage(
                                          1 / (ammPosition.sides[selectedSide].quote / Number(tokenAmount)) - 1
                                      )})`}
                            </PotentialProfit>
                        </PotentialProfitContainer>
                    )}
                    {isBuy && (
                        <CollateralInfoContainer>
                            <PrimaryLabel>{t('market.pay-with')}</PrimaryLabel>
                            <CollateralInfo>
                                <Collateral>{COLLATERALS[selectedStableIndex]}</Collateral>
                                <StableBalance>
                                    {`${t('markets.market-details.available')} ${formatCurrencyWithSign(
                                        USD_SIGN,
                                        stableBalances ? stableBalances[COLLATERALS[selectedStableIndex]] : 0,
                                        2
                                    )}`}
                                </StableBalance>
                            </CollateralInfo>
                        </CollateralInfoContainer>
                    )}
                    {showCollateralSelector && (
                        <CollateralSelector
                            collateralArray={COLLATERALS}
                            selectedItem={selectedStableIndex}
                            onChangeCollateral={(index) => setStableIndex(index)}
                            overtimeVoucher={overtimeVoucher}
                            isVoucherSelected={isVoucherSelected}
                            setIsVoucherSelected={setIsVoucherSelected}
                        />
                    )}
                </AMMContent>
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
            </AMMContainer>
            <SubmitButtonContainer>
                <>{getSubmitButton()}</>
            </SubmitButtonContainer>
        </>
    );
};

export default AMM;

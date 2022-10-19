import { useMatomo } from '@datapunt/matomo-tracker-react';
import {
    ApexMatchInfoColumn,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    ScoreLabel,
    WinnerLabel,
} from 'components/common';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import {
    ApexBetTypeKeyMapping,
    APPROVAL_BUFFER,
    COLLATERALS,
    MAX_TOKEN_SLIPPAGE,
    MAX_USD_SLIPPAGE,
} from 'constants/markets';
import { BigNumber, ethers } from 'ethers';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useMarketCancellationOddsQuery from 'queries/markets/useMarketCancellationOddsQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AMMPosition, AvailablePerSide, Balances, MarketData, Odds } from 'types/markets';
import { getAMMSportsTransaction, getAmountForApproval, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { formatDateWithTime } from 'utils/formatters/date';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { getIsApexTopGame, isApexGame, isDiscounted, isMlsGame } from 'utils/markets';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import ApprovalModal from '../../../../components/ApprovalModal/ApprovalModal';
import Toggle from '../../../../components/Toggle/Toggle';
import { USD_SIGN } from '../../../../constants/currency';
import { MAX_GAS_LIMIT } from '../../../../constants/network';
import { MAX_L2_GAS_LIMIT, Position, Side } from '../../../../constants/options';
import { ODDS_COLOR } from '../../../../constants/ui';
import useAvailablePerSideQuery from '../../../../queries/markets/useAvailablePerSideQuery';
import useMarketBalancesQuery from '../../../../queries/markets/useMarketBalancesQuery';
import usePositionPriceDetailsQuery from '../../../../queries/markets/usePositionPriceDetailsQuery';
import useMultipleCollateralBalanceQuery from '../../../../queries/wallet/useMultipleCollateralBalanceQuery';
import { getIsAppReady } from '../../../../redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from '../../../../redux/modules/wallet';
import { RootState } from '../../../../redux/rootReducer';
import { Colors, FlexDivCentered } from '../../../../styles/common';
import {
    countDecimals,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithSign,
    formatPercentage,
} from '../../../../utils/formatters/number';
import { checkAllowance } from '../../../../utils/network';
import networkConnector from '../../../../utils/networkConnector';
import WalletInfo from '../WalletInfo';
import CollateralSelector from './CollateralSelector';
import {
    BetTypeInfo,
    AmountInfo,
    AmountToBuyContainer,
    AmountToBuyInput,
    AmountToBuyLabel,
    ClaimableAmount,
    ClaimButton,
    CustomTooltip,
    FooterContainer,
    Icon,
    InfoRow,
    InfoTitle,
    InfoValue,
    InputContainer,
    LabelContainer,
    LabelsContainer,
    MarketContainer,
    MarketHeader,
    MatchDate,
    MatchInfo,
    MatchInfoColumn,
    MatchVSLabel,
    RaceNameLabel,
    MaxButton,
    OddsContainer,
    Option,
    OptionTeamName,
    Pick,
    Separator,
    SliderInfo,
    SliderInfoTitle,
    SliderInfoValue,
    Status,
    StatusSourceContainer,
    StatusSourceInfo,
    SubmitButton,
    Discount,
} from './styled-components/MarketDetails';
import { useConnectModal } from '@rainbow-me/rainbowkit';

type MarketDetailsProps = {
    market: MarketData;
    selectedSide: Side;
    setSelectedSide: (side: Side) => void;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ market, selectedSide, setSelectedSide }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [selectedStableIndex, setStableIndex] = useState<number>(0);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [tokenAmount, setTokenAmountValue] = useState<number | string>('');
    const [usdAmountValue, setUSDAmountValue] = useState<number | string>('');
    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const [claimable, setClaimable] = useState<boolean>(false);
    const [claimableAmount, setClaimableAmount] = useState<number>(0);
    const [oddsOnCancellation, setOddsOnCancellation] = useState<Odds | undefined>(undefined);
    const [tooltipTextTokenAmount, setTooltipTextTokenAmount] = useState<string>('');
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<string>('');
    const [fieldChanging, setFieldChanging] = useState<string>('');
    const [availablePerSide, setavailablePerSide] = useState<AvailablePerSide>({
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
    const [balances, setBalances] = useState<Balances | undefined>(undefined);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [maxAmount, setMaxAmount] = useState<number>(0);
    const [maxUsdAmount, setMaxUsdAmount] = useState<number>(0);
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(false);
    const { openConnectModal } = useConnectModal();
    const { trackEvent } = useMatomo();

    const referralId =
        walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase() ? getReferralId() : null;

    useEffect(() => {
        setStableIndex(0);
    }, [selectedSide]);

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: !!market.address && isWalletConnected,
    });

    const positionPriceDetailsQuery = usePositionPriceDetailsQuery(
        market.address,
        selectedPosition,
        Number(tokenAmount) || 1,
        selectedStableIndex,
        networkId
    );

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
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

    const availablePerSideQuery = useAvailablePerSideQuery(market.address, selectedSide);

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
                const roundedMaxAmount = floorNumberToDecimals(availablePerSide.positions[selectedPosition].available);
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
        if (positionPriceDetailsQuery.isSuccess && positionPriceDetailsQuery.data) {
            setAmmPosition(positionPriceDetailsQuery.data);
        }
    }, [positionPriceDetailsQuery.isSuccess, positionPriceDetailsQuery.data]);

    useEffect(() => {
        if (availablePerSideQuery.isSuccess && availablePerSideQuery.data) {
            setavailablePerSide(availablePerSideQuery.data);
        }
    }, [availablePerSideQuery.isSuccess, availablePerSideQuery.data]);

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    const marketCancellationOddsQuery = useMarketCancellationOddsQuery(market?.address || '', {
        enabled: market?.cancelled,
    });

    useEffect(() => {
        if (marketCancellationOddsQuery.isSuccess && marketCancellationOddsQuery.data) {
            setOddsOnCancellation(marketCancellationOddsQuery.data);
        }
    }, [marketCancellationOddsQuery.isSuccess, marketCancellationOddsQuery.data]);

    useEffect(() => {
        if (balances) {
            if (market.resolved) {
                if (market.cancelled) {
                    if (balances.home > 0 || balances.draw > 0 || balances.away > 0) {
                        setClaimable(true);
                        setClaimableAmount(
                            balances.home * (oddsOnCancellation?.home || 0) +
                                balances.draw * (oddsOnCancellation?.draw || 0) +
                                balances.away * (oddsOnCancellation?.away || 0)
                        );
                    }
                } else if (
                    market.finalResult !== 0 &&
                    //@ts-ignore
                    balances?.[Position[market.finalResult - 1].toLowerCase()] > 0
                ) {
                    setClaimable(true);
                    //@ts-ignore
                    setClaimableAmount(balances?.[Position[market.finalResult - 1].toLowerCase()]);
                } else if (market.finalResult === 0) {
                    if (balances.home > 0 || balances.draw > 0 || balances.away > 0) {
                        setClaimable(true);
                        setClaimableAmount(balances.home + balances.draw + balances.away);
                    }
                }
            }
        }
    }, [
        balances,
        market.cancelled,
        market.finalResult,
        market.resolved,
        oddsOnCancellation?.away,
        oddsOnCancellation?.draw,
        oddsOnCancellation?.home,
    ]);

    useEffect(() => {
        setMaxAmount(0);
    }, [selectedStableIndex]);

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
                                selectedStableIndex == 0 || selectedStableIndex == 1 ? 18 : 6
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

    const onMaxClick = async () => {
        setFieldChanging('positionsAmount');
        setTokenAmount(maxAmount);
    };

    useEffect(() => {
        const getMaxUsdAmount = async () => {
            setIsFetching(true);
            if (selectedSide === Side.BUY) {
                const { sportsAMMContract, signer } = networkConnector;
                if (sportsAMMContract && signer) {
                    const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                    contract.connect(signer);
                    const roundedMaxAmount = floorNumberToDecimals(
                        availablePerSide.positions[selectedPosition].available
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
        ammPosition,
        selectedStableIndex,
        market.address,
        availablePerSide.positions,
        selectedPosition,
        fetchAmmQuote,
    ]);

    const onMaxUsdClick = async () => {
        setFieldChanging('usdAmount');
        setUsdAmount(maxUsdAmount);
    };

    const claimReward = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
            contract.connect(signer);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            try {
                const tx = await contract.exerciseOptions();
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    if (market.finalResult === 0) {
                        toast.update(id, getSuccessToastOptions(t('market.toast-messsage.claim-refund-success')));
                    } else {
                        toast.update(id, getSuccessToastOptions(t('market.toast-messsage.claim-winnings-success')));
                    }
                    setClaimable(false);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

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

    const setUsdAmount = (value: string | number) => {
        setUSDAmountValue(value);
        setTooltipTextMessageUsdAmount(value);
    };

    useDebouncedEffect(() => {
        if (fieldChanging == 'positionsAmount') {
            Number(tokenAmount) >= 1 ? setUsdAmount(ammPosition.sides[selectedSide].quote.toFixed(2)) : setUsdAmount(0);
        }
    }, [tokenAmount, ammPosition, selectedStableIndex]);

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

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    return (
        <MarketContainer>
            <WalletInfo market={market} />
            {market.paused ? (
                <Status claimable={false}>{t('markets.market-card.paused')}</Status>
            ) : (
                <>
                    {!market.gameStarted && !market.cancelled && (
                        <MarketHeader>
                            <FlexDivCentered>
                                <Toggle
                                    label={{
                                        firstLabel: t('common.buy-side'),
                                        secondLabel: t('common.sell-side'),
                                        fontSize: '18px',
                                    }}
                                    active={selectedSide === Side.SELL}
                                    dotSize="18px"
                                    dotBackground="#303656"
                                    dotBorder="3px solid #3FD1FF"
                                    handleClick={() => {
                                        setSelectedSide(selectedSide === Side.BUY ? Side.SELL : Side.BUY);
                                        setTokenAmount('');
                                        setUsdAmount('');
                                    }}
                                />
                            </FlexDivCentered>
                            {selectedSide == Side.BUY && !market.gameStarted && (
                                <CollateralSelector
                                    collateralArray={COLLATERALS}
                                    selectedItem={selectedStableIndex}
                                    onChangeCollateral={(index) => setStableIndex(index)}
                                    overtimeVoucher={overtimeVoucher}
                                    isVoucherSelected={isVoucherSelected}
                                    setIsVoucherSelected={setIsVoucherSelected}
                                />
                            )}
                        </MarketHeader>
                    )}
                    {market.gameStarted && (
                        <Status claimable={claimable}>
                            {!market.resolved
                                ? t('markets.market-card.pending-resolution')
                                : claimable
                                ? t('markets.market-card.claimable')
                                : t('markets.market-card.finished')}
                        </Status>
                    )}
                    {!market.gameStarted && market.resolved && (
                        <Status claimable={false}>{t('markets.market-card.canceled')}</Status>
                    )}
                </>
            )}
            <MatchInfo>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer
                        isWinner={market.finalResult == 1 && !isApexTopGame}
                        finalResult={market.finalResult}
                        isApexTopGame={isApexTopGame}
                    >
                        <MatchParticipantImage
                            alt="Home team logo"
                            src={homeLogoSrc}
                            onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                        />
                    </MatchParticipantImageContainer>
                    {market.resolved && market.gameStarted && !isApexTopGame && (
                        <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                            {t('common.winner')}
                        </WinnerLabel>
                    )}
                    <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                    {market.resolved && market.gameStarted && !isApexTopGame && (
                        <ScoreLabel>{market.homeScore}</ScoreLabel>
                    )}
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                    {isApexTopGame ? (
                        <BetTypeInfo>
                            {t(`common.top-bet-type-title`, {
                                driver: market.homeTeam,
                                betType: t(`common.${ApexBetTypeKeyMapping[market.betType]}`),
                                race: market.leagueRaceName,
                            })}
                        </BetTypeInfo>
                    ) : (
                        <>
                            <MatchVSLabel>
                                VS{' '}
                                {isApexGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={22} marginLeft={2} />
                                )}
                                {isMlsGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.mls-tooltip`)} iconFontSize={22} marginLeft={2} />
                                )}
                            </MatchVSLabel>
                            {market.leagueRaceName && <RaceNameLabel>{market.leagueRaceName}</RaceNameLabel>}
                        </>
                    )}
                </MatchInfoColumn>
                {!isApexTopGame && (
                    <MatchInfoColumn>
                        <MatchParticipantImageContainer
                            isWinner={market.finalResult == 2}
                            finalResult={market.finalResult}
                        >
                            <MatchParticipantImage
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                            />
                        </MatchParticipantImageContainer>
                        {market.resolved && market.gameStarted && (
                            <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                                {t('common.winner')}
                            </WinnerLabel>
                        )}

                        <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                        {market.resolved && market.gameStarted && <ScoreLabel>{market.awayScore}</ScoreLabel>}
                    </MatchInfoColumn>
                )}
            </MatchInfo>
            {isApexTopGame && market.resolved && market.gameStarted && (
                <>
                    <MatchInfo>
                        <ApexMatchInfoColumn>
                            <ScoreLabel winningColor={market.finalResult == 1 ? Colors.GREEN : undefined}>
                                {t('common.yes')}
                            </ScoreLabel>
                            <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                                {t('common.winner')}
                            </WinnerLabel>
                        </ApexMatchInfoColumn>
                        <ApexMatchInfoColumn>
                            <ScoreLabel winningColor={market.finalResult == 2 ? Colors.GREEN : undefined}>
                                {t('common.no')}
                            </ScoreLabel>
                            <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                                {t('common.winner')}
                            </WinnerLabel>
                        </ApexMatchInfoColumn>
                    </MatchInfo>
                    <MatchInfo>
                        <ScoreLabel>
                            {t('markets.market-card.result')}: {market.homeScore}
                        </ScoreLabel>
                    </MatchInfo>
                </>
            )}
            {!market.paused && !market.gameStarted && !market.resolved && (
                <>
                    <OddsContainer>
                        <Pick
                            selected={selectedPosition === Position.HOME}
                            onClick={() => {
                                setSelectedPosition(Position.HOME);
                                setTokenAmount('');
                                setUsdAmount('');
                            }}
                        >
                            <Option color={ODDS_COLOR.HOME}>{isApexTopGame ? t('common.yes') : '1'}</Option>
                            {!isApexTopGame && <OptionTeamName>{market.homeTeam.toUpperCase()}</OptionTeamName>}
                            <InfoRow>
                                <InfoTitle>{t('markets.market-details.price')}:</InfoTitle>
                                <InfoValue>
                                    $ {(market.positions[Position.HOME].sides[selectedSide].odd || 0).toFixed(2)}
                                    {market.positions[Position.HOME].sides[selectedSide].odd == 0 && (
                                        <Tooltip
                                            overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                            iconFontSize={10}
                                            customIconStyling={{
                                                marginTop: '-10px',
                                                display: 'flex',
                                                marginLeft: '3px',
                                            }}
                                        />
                                    )}
                                </InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoTitle>{t('markets.market-details.liquidity')}:</InfoTitle>
                                <InfoValue>
                                    {availablePerSideQuery.isLoading
                                        ? '-'
                                        : floorNumberToDecimals(availablePerSide.positions[Position.HOME].available)}
                                </InfoValue>
                            </InfoRow>
                            {selectedSide === Side.BUY &&
                                isDiscounted(availablePerSide.positions[Position.HOME].buyImpactPrice) && (
                                    <Discount>
                                        -
                                        {Math.ceil(
                                            Math.abs(availablePerSide.positions[Position.HOME].buyImpactPrice || 0)
                                        )}
                                        %
                                    </Discount>
                                )}
                        </Pick>
                        {typeof market.positions[Position.DRAW].sides[selectedSide].odd !== 'undefined' && (
                            <Pick
                                selected={selectedPosition === Position.DRAW}
                                onClick={() => {
                                    setSelectedPosition(Position.DRAW);
                                    setTokenAmount('');
                                    setUsdAmount('');
                                }}
                            >
                                <Option color={ODDS_COLOR.DRAW}>X</Option>
                                <OptionTeamName>{t('markets.market-card.draw')}</OptionTeamName>
                                <InfoRow>
                                    <InfoTitle>{t('markets.market-details.price')}:</InfoTitle>
                                    <InfoValue>
                                        $ {(market.positions[Position.DRAW].sides[selectedSide].odd || 0).toFixed(2)}
                                        {market.positions[Position.DRAW].sides[selectedSide].odd == 0 && (
                                            <Tooltip
                                                overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                                iconFontSize={10}
                                                customIconStyling={{
                                                    marginTop: '-10px',
                                                    display: 'flex',
                                                    marginLeft: '3px',
                                                }}
                                            />
                                        )}
                                    </InfoValue>
                                </InfoRow>
                                <InfoRow>
                                    <InfoTitle>{t('markets.market-details.liquidity')}:</InfoTitle>
                                    <InfoValue>
                                        {availablePerSideQuery.isLoading
                                            ? '-'
                                            : floorNumberToDecimals(
                                                  availablePerSide.positions[Position.DRAW].available
                                              )}
                                    </InfoValue>
                                </InfoRow>
                                {selectedSide === Side.BUY &&
                                    isDiscounted(availablePerSide.positions[Position.DRAW].buyImpactPrice) && (
                                        <Discount>
                                            -
                                            {Math.ceil(
                                                Math.abs(availablePerSide.positions[Position.DRAW].buyImpactPrice || 0)
                                            )}
                                            %
                                        </Discount>
                                    )}
                            </Pick>
                        )}
                        <Pick
                            selected={selectedPosition === Position.AWAY}
                            onClick={() => {
                                setSelectedPosition(Position.AWAY);
                                setTokenAmount('');
                                setUsdAmount('');
                            }}
                        >
                            <Option color={ODDS_COLOR.AWAY}>{isApexTopGame ? t('common.no') : '2'}</Option>
                            {!isApexTopGame && <OptionTeamName>{market.awayTeam.toUpperCase()}</OptionTeamName>}
                            <InfoRow>
                                <InfoTitle>{t('markets.market-details.price')}:</InfoTitle>
                                <InfoValue>
                                    $ {(market.positions[Position.AWAY].sides[selectedSide].odd || 0).toFixed(2)}
                                    {market.positions[Position.AWAY].sides[selectedSide].odd == 0 && (
                                        <Tooltip
                                            overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                            iconFontSize={10}
                                            customIconStyling={{
                                                marginTop: '-10px',
                                                display: 'flex',
                                                marginLeft: '3px',
                                            }}
                                        />
                                    )}
                                </InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoTitle>{t('markets.market-details.liquidity')}:</InfoTitle>
                                <InfoValue>
                                    {availablePerSideQuery.isLoading
                                        ? '-'
                                        : floorNumberToDecimals(availablePerSide.positions[Position.AWAY].available)}
                                </InfoValue>
                            </InfoRow>
                            {selectedSide === Side.BUY &&
                                isDiscounted(availablePerSide.positions[Position.AWAY].buyImpactPrice) && (
                                    <Discount>
                                        -
                                        {Math.ceil(
                                            Math.abs(availablePerSide.positions[Position.AWAY].buyImpactPrice || 0)
                                        )}
                                        %
                                    </Discount>
                                )}
                        </Pick>
                    </OddsContainer>
                    {selectedSide === Side.BUY && (
                        <>
                            <LabelsContainer>
                                <LabelContainer>
                                    <AmountToBuyLabel>{t('markets.market-details.usd-amount')}:</AmountToBuyLabel>
                                </LabelContainer>
                                <LabelContainer>
                                    <AmountToBuyLabel>{t('markets.market-details.positions-amount')}:</AmountToBuyLabel>
                                </LabelContainer>
                            </LabelsContainer>
                            <FlexDivCentered>
                                <InputContainer>
                                    <CustomTooltip
                                        open={!!tooltipTextUsdAmount && !openApprovalModal}
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
                                                    setFieldChanging(e.target.name);
                                                    setUsdAmount(e.target.value);
                                                }}
                                            />
                                            <MaxButton disabled={isFetching} onClick={onMaxUsdClick}>
                                                {t('markets.market-details.max')}
                                            </MaxButton>
                                        </AmountToBuyContainer>
                                    </CustomTooltip>
                                </InputContainer>
                                <InputContainer>
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
                                </InputContainer>
                            </FlexDivCentered>
                        </>
                    )}

                    {selectedSide === Side.SELL && (
                        <>
                            <LabelContainer>
                                <AmountToBuyLabel>{t('markets.market-details.amount-to-sell')}:</AmountToBuyLabel>
                                <AmountToBuyLabel>{t('markets.market-details.total-to-receive')}:</AmountToBuyLabel>
                            </LabelContainer>
                            <FlexDivCentered>
                                <CustomTooltip
                                    open={!!tooltipTextTokenAmount && !openApprovalModal}
                                    title={tooltipTextTokenAmount}
                                >
                                    <AmountToBuyContainer>
                                        <AmountToBuyInput
                                            type="number"
                                            onChange={(e) => {
                                                if (countDecimals(Number(e.target.value)) > 2) {
                                                    return;
                                                }
                                                if (Number(e.target.value) >= 0) {
                                                    setTokenAmount(e.target.value);
                                                }
                                            }}
                                            value={tokenAmount}
                                        />
                                        <MaxButton disabled={isFetching} onClick={onMaxClick}>
                                            Max
                                        </MaxButton>
                                    </AmountToBuyContainer>
                                </CustomTooltip>
                                <AmountToBuyContainer>
                                    <AmountInfo>
                                        <SliderInfoValue>
                                            {`= $${
                                                !tokenAmount || positionPriceDetailsQuery.isLoading
                                                    ? ''
                                                    : formatCurrency(ammPosition.sides[selectedSide].quote, 3, true)
                                            }`}
                                        </SliderInfoValue>
                                    </AmountInfo>
                                </AmountToBuyContainer>
                            </FlexDivCentered>
                        </>
                    )}

                    <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>
                    <FooterContainer>
                        <SliderInfo>
                            <SliderInfoTitle>{t('markets.market-details.skew')}:</SliderInfoTitle>
                            <SliderInfoValue>
                                {positionPriceDetailsQuery.isLoading
                                    ? '-'
                                    : formatPercentage(ammPosition.sides[selectedSide].priceImpact)}
                            </SliderInfoValue>
                            <Tooltip
                                overlay={t(`market.skew-tooltip`)}
                                component={<Icon className={`icon-exotic icon-exotic--info`} />}
                                iconFontSize={23}
                                marginLeft={2}
                                top={0}
                            />
                        </SliderInfo>
                        {selectedSide === Side.BUY && (
                            <>
                                <Separator>|</Separator>
                                <SliderInfo>
                                    <SliderInfoTitle>{t('markets.market-details.potential-profit')}:</SliderInfoTitle>
                                    <SliderInfoValue>
                                        {!Number(tokenAmount) ||
                                        positionPriceDetailsQuery.isLoading ||
                                        !!tooltipTextTokenAmount ||
                                        !!tooltipTextUsdAmount
                                            ? '-'
                                            : `$${formatCurrency(
                                                  Number(tokenAmount) - ammPosition.sides[selectedSide].quote
                                              )} (${formatPercentage(
                                                  1 / (ammPosition.sides[selectedSide].quote / Number(tokenAmount)) - 1
                                              )})`}
                                    </SliderInfoValue>
                                </SliderInfo>
                            </>
                        )}
                    </FooterContainer>
                    <StatusSourceContainer>
                        <StatusSourceInfo />
                        <StatusSourceInfo />
                    </StatusSourceContainer>
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
            )}
            {!market.paused && (
                <>
                    {claimable && (
                        <ClaimableAmount>
                            {t(`markets.market-details.amount-claimable`)}:{' '}
                            <span>{formatCurrencyWithSign(USD_SIGN, claimableAmount, 2)}</span>
                        </ClaimableAmount>
                    )}
                    {claimable && (
                        <ClaimButton
                            cancelled={market.resolved && !market.gameStarted}
                            onClick={claimReward.bind(this)}
                        >
                            {market.resolved && !market.gameStarted
                                ? t(`markets.market-details.claim-back`)
                                : t(`markets.market-card.claim`)}
                        </ClaimButton>
                    )}
                </>
            )}
        </MarketContainer>
    );
};

export default MarketDetails;

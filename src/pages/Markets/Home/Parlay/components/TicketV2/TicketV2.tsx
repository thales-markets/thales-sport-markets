import axios from 'axios';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import { ShareTicketModalProps } from 'components/ShareTicketModalV2/ShareTicketModalV2';
import Toggle from 'components/Toggle';
import Tooltip from 'components/Tooltip';
import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getLoadingToastOptions, getSuccessToastOptions } from 'config/toast';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    APPROVAL_BUFFER,
    BATCH_SIZE,
    COINGECKO_SWAP_TO_THALES_QUOTE_SLIPPAGE,
    MIN_COLLATERAL_MULTIPLIER,
    THALES_CONTRACT_RATE_KEY,
} from 'constants/markets';
import { secondsToMilliseconds } from 'date-fns';
import { OddsType } from 'enums/markets';
import { BuyTicketStep } from 'enums/tickets';
import { BigNumber, ethers } from 'ethers';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useInterval from 'hooks/useInterval';
import Slippage from 'pages/Markets/Home/Parlay/components/Slippage';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import useLiveTradingProcessorDataQuery from 'queries/markets/useLiveTradingProcessorDataQuery';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useTicketLiquidityQuery from 'queries/markets/useTicketLiquidityQuery';
import useCoingeckoRatesQuery from 'queries/rates/useCoingeckoRatesQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getIsFreeBetDisabledByUser,
    getLiveBetSlippage,
    getTicketPayment,
    removeAll,
    setIsFreeBetDisabledByUser,
    setLiveBetSlippage,
    setPaymentAmountToBuy,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
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
import { BoldContent, FlexDiv, FlexDivCentered } from 'styles/common';
import {
    DEFAULT_CURRENCY_DECIMALS,
    LONG_CURRENCY_DECIMALS,
    bigNumberFormatter,
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
import { SportsAmmData, TicketMarket } from 'types/markets';
import { Coins } from 'types/tokens';
import { ThemeInterface } from 'types/ui';
import { executeBiconomyTransaction, getGasFeesForTx } from 'utils/biconomy';
import {
    getCollateral,
    getCollateralAddress,
    getCollateralIndex,
    getCollaterals,
    getDefaultCollateral,
    getMaxCollateralDollarValue,
    isLpSupported,
    isStableCurrency,
    mapMultiCollateralBalances,
} from 'utils/collaterals';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getLiveTradingProcessorTransaction } from 'utils/liveTradingProcessor';
import { formatMarketOdds } from 'utils/markets';
import { getTradeData } from 'utils/marketsV2';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchBalances, refetchCoingeckoRates, refetchFreeBetBalance } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { getSportsAMMV2QuoteMethod, getSportsAMMV2Transaction } from 'utils/sportsAmmV2';
import {
    buildTxForApproveTradeWithRouter,
    buildTxForSwap,
    checkSwapAllowance,
    getQuote,
    getSwapParams,
    sendTransaction,
} from 'utils/swap';
import { getAddedPayoutMultiplier } from 'utils/tickets';
import { delay } from 'utils/timer';
import { getKeepSelectionFromStorage, setKeepSelectionToStorage } from 'utils/ui';
import { Address } from 'viem';
import BuyStepsModal from '../BuyStepsModal';
import SuggestedAmount from '../SuggestedAmount';
import {
    AmountToBuyContainer,
    CheckboxContainer,
    ClearLabel,
    GasSummary,
    HorizontalLine,
    InfoContainer,
    InfoLabel,
    InfoTooltip,
    InfoValue,
    InfoWrapper,
    InputContainer,
    RowContainer,
    RowSummary,
    SettingsIcon,
    SettingsIconContainer,
    SettingsLabel,
    SettingsWrapper,
    ShareWrapper,
    SlippageDropdownContainer,
    SummaryLabel,
    SummaryValue,
    TwitterIcon,
    XButton,
    defaultButtonProps,
} from '../styled-components';

type TicketProps = {
    markets: TicketMarket[];
    setMarketsOutOfLiquidity: (indexes: number[]) => void;
    oddsChanged: boolean;
    acceptOddChanges: (changed: boolean) => void;
    onSuccess?: () => void;
    submitButtonDisabled?: boolean;
    setUseThalesCollateral: (useThales: boolean) => void;
};

const TicketErrorMessage = {
    RISK_PER_COMB: 'RiskPerComb exceeded',
    SAME_TEAM_IN_PARLAY: 'SameTeamOnParlay',
};

const SLIPPAGE_PERCENTAGES = [0.5, 1, 2];

const Ticket: React.FC<TicketProps> = ({
    markets,
    setMarketsOutOfLiquidity,
    oddsChanged,
    acceptOddChanges,
    onSuccess,
    submitButtonDisabled,
    setUseThalesCollateral,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isLiveTicket = useMemo(() => {
        return markets?.[0]?.live;
    }, [markets]);

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const isParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const selectedOddsType = useSelector(getOddsType);
    const ticketPayment = useSelector(getTicketPayment);
    const liveBetSlippage = useSelector(getLiveBetSlippage);
    const isFreeBetDisabledByUser = useSelector(getIsFreeBetDisabledByUser);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;
    const buyInAmount = ticketPayment.amountToBuy;

    const [payout, setPayout] = useState(0);
    const [buyInAmountInDefaultCollateral, setBuyInAmountInDefaultCollateral] = useState(0);
    const [minBuyInAmountInDefaultCollateral, setMinBuyInAmountInDefaultCollateral] = useState(0);
    const [minBuyInAmount, setMinBuyInAmount] = useState(0);
    const [finalQuotes, setFinalQuotes] = useState<number[]>([]);

    const [isAMMPaused, setIsAMMPaused] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [tooltipTextBuyInAmount, setTooltipTextBuyInAmount] = useState('');

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);
    const [keepSelection, setKeepSelection] = useState<boolean>(getKeepSelectionFromStorage() || false);

    const [isFreeBetActive, setIsFreeBetActive] = useState(false);
    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);
    const [checkFreeBetBalance, setCheckFreeBetBalance] = useState(false);

    const [gas, setGas] = useState(0);
    const [slippageDropdownOpen, setSlippageDropdownOpen] = useState(false);

    const [swapToThales, setSwapToThales] = useState(false);
    const [swappedThalesToReceive, setSwappedThalesToReceive] = useState(0);
    const [swapQuote, setSwapQuote] = useState(0);
    const [hasSwapAllowance, setHasSwapAllowance] = useState(false);
    const [buyStep, setBuyStep] = useState(BuyTicketStep.APPROVE_SWAP);
    const [openBuyStepsModal, setOpenBuyStepsModal] = useState(false);

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const usedCollateralForBuy = useMemo(
        () => (swapToThales ? (CRYPTO_CURRENCY_MAP.THALES as Coins) : selectedCollateral),
        [swapToThales, selectedCollateral]
    );
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const isThales = selectedCollateral === CRYPTO_CURRENCY_MAP.THALES;
    const collateralAddress = useMemo(
        () =>
            getCollateralAddress(
                networkId,
                isEth && !swapToThales
                    ? getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
                    : selectedCollateralIndex
            ),
        [networkId, selectedCollateralIndex, isEth, swapToThales]
    );
    const thalesCollateralAddress = multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins].addresses[networkId];
    const isStableCollateral = isStableCurrency(selectedCollateral);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;
    const collateralHasLp = isLpSupported(usedCollateralForBuy);

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
        if (ammContractsStatusData?.sportsAMM) {
            setIsAMMPaused(true);
        }
    }, [ammContractsStatusData]);

    const sportsAmmDataQuery = useSportsAmmDataQuery(networkId, {
        enabled: isAppReady,
    });
    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const freeBetCollateralBalances =
        freeBetCollateralBalancesQuery?.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery.data
            : undefined;

    const freeBetBalanceExists = freeBetCollateralBalances
        ? !!Object.values(freeBetCollateralBalances).find((balance) => balance)
        : false;

    const sportsAmmData: SportsAmmData | undefined = useMemo(() => {
        if (sportsAmmDataQuery.isSuccess && sportsAmmDataQuery.data) {
            return sportsAmmDataQuery.data;
        }
        return undefined;
    }, [sportsAmmDataQuery.isSuccess, sportsAmmDataQuery.data]);

    const paymentTokenBalance: number = useMemo(() => {
        if (isFreeBetActive && freeBetBalanceExists && freeBetCollateralBalances) {
            return freeBetCollateralBalances[selectedCollateral];
        }
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[selectedCollateral];
        }
        return 0;
    }, [
        freeBetBalanceExists,
        freeBetCollateralBalances,
        isFreeBetActive,
        multipleCollateralBalances.data,
        multipleCollateralBalances.isSuccess,
        selectedCollateral,
    ]);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const coingeckoRatesQuery = useCoingeckoRatesQuery({
        enabled: isAppReady,
    });
    const coingeckoThalesMinRecive = useMemo(() => {
        const coingeckoThalesAmount =
            coingeckoRatesQuery.isSuccess && coingeckoRatesQuery.data[CRYPTO_CURRENCY_MAP.THALES as Coins]
                ? (Number(buyInAmount) * coingeckoRatesQuery.data[selectedCollateral]) /
                  coingeckoRatesQuery.data[CRYPTO_CURRENCY_MAP.THALES as Coins]
                : 0;
        return coingeckoThalesAmount * (1 - COINGECKO_SWAP_TO_THALES_QUOTE_SLIPPAGE);
    }, [coingeckoRatesQuery, selectedCollateral, buyInAmount]);

    const selectedCollateralCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[usedCollateralForBuy] : 1;
    const thalesContractCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[THALES_CONTRACT_RATE_KEY] : 1;

    const liveTradingProcessorDataQuery = useLiveTradingProcessorDataQuery(networkId, {
        enabled: isAppReady,
    });

    const maxAllowedExecutionDelay = useMemo(
        () =>
            liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.maxAllowedExecutionDelay
                : 10,
        [liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    const resetFreeBet = useCallback(() => {
        setIsFreeBetInitialized(false);
        setIsFreeBetActive(false);
        setCheckFreeBetBalance(false);
    }, []);

    // Reset free bet
    useEffect(() => {
        resetFreeBet();
    }, [walletAddress, resetFreeBet]);

    // Select initially Free Bet if exists at least min for buy
    useEffect(() => {
        if (!freeBetBalanceExists) {
            resetFreeBet();
        } else if (!isFreeBetDisabledByUser && !isFreeBetInitialized && minBuyInAmountInDefaultCollateral) {
            const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);
            if (!balanceList) return;

            const selectedCollateralItem = balanceList?.find((item) => item.collateralKey == selectedCollateral);

            const isSelectedCollateralBalanceLowerThanMin =
                selectedCollateralItem && selectedCollateralItem.balanceDollarValue < minBuyInAmountInDefaultCollateral;

            if (isSelectedCollateralBalanceLowerThanMin) {
                setIsFreeBetActive(false);
            } else if (!isFreeBetActive) {
                setIsFreeBetActive(true);
            }
            setCheckFreeBetBalance(true);
            setIsFreeBetInitialized(true);
        }
    }, [
        resetFreeBet,
        freeBetCollateralBalances,
        exchangeRates,
        networkId,
        selectedCollateral,
        freeBetBalanceExists,
        minBuyInAmountInDefaultCollateral,
        isFreeBetActive,
        isFreeBetInitialized,
        isFreeBetDisabledByUser,
    ]);

    // Select max balance collateral for Free Bet
    useEffect(() => {
        if (checkFreeBetBalance && minBuyInAmountInDefaultCollateral) {
            const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);
            if (!balanceList) return;

            const selectedCollateralItem = balanceList?.find((item) => item.collateralKey == selectedCollateral);

            const isSelectedCollateralBalanceLowerThanMin =
                selectedCollateralItem && selectedCollateralItem.balanceDollarValue < minBuyInAmountInDefaultCollateral;

            const maxBalanceItem = getMaxCollateralDollarValue(balanceList);
            const isMaxBalanceLowerThanMin =
                maxBalanceItem && maxBalanceItem.balanceDollarValue < minBuyInAmountInDefaultCollateral;

            if (
                maxBalanceItem &&
                !isMaxBalanceLowerThanMin &&
                selectedCollateral !== maxBalanceItem.collateralKey &&
                (!ticketPayment.forceChangeCollateral || isSelectedCollateralBalanceLowerThanMin)
            ) {
                dispatch(
                    setPaymentSelectedCollateralIndex({
                        selectedCollateralIndex: maxBalanceItem.index,
                        networkId,
                    })
                );
                if (!isFreeBetDisabledByUser) {
                    setIsFreeBetActive(true);
                }
            }
            setCheckFreeBetBalance(false);
        }
    }, [
        dispatch,
        exchangeRates,
        isFreeBetActive,
        freeBetCollateralBalances,
        freeBetBalanceExists,
        minBuyInAmountInDefaultCollateral,
        selectedCollateral,
        networkId,
        ticketPayment.forceChangeCollateral,
        checkFreeBetBalance,
        isFreeBetDisabledByUser,
    ]);

    useEffect(() => {
        setMinBuyInAmountInDefaultCollateral(sportsAmmData?.minBuyInAmount || 0);
    }, [sportsAmmData?.minBuyInAmount]);

    const totalQuote = useMemo(() => {
        const quote = markets.reduce(
            (partialQuote, market) =>
                partialQuote * (market.odd > 0 ? market.odd * getAddedPayoutMultiplier(usedCollateralForBuy) : 1),
            1
        );
        const maxSupportedOdds = sportsAmmData?.maxSupportedOdds || 1;
        return quote < maxSupportedOdds ? maxSupportedOdds : quote;
    }, [markets, sportsAmmData?.maxSupportedOdds, usedCollateralForBuy]);

    const totalBonus = useMemo(() => {
        const bonus = {
            percentage: 0,
            value: 0,
        };
        if (isThales || swapToThales) {
            const multiplier = getAddedPayoutMultiplier(CRYPTO_CURRENCY_MAP.THALES as Coins);
            const percentage = Math.pow(1 / multiplier, markets.length);
            bonus.percentage = percentage - 1;
            bonus.value = Number(payout) - Number(payout) / percentage;
        }
        return bonus;
    }, [isThales, markets.length, payout, swapToThales]);

    const ticketLiquidityQuery = useTicketLiquidityQuery(markets, networkId, {
        enabled: isAppReady,
    });

    const ticketLiquidity: number | undefined = useMemo(
        () =>
            ticketLiquidityQuery.isSuccess && ticketLiquidityQuery.data !== undefined
                ? isThales || swapToThales
                    ? Math.floor(
                          (ticketLiquidityQuery.data * selectedCollateralCurrencyRate) / thalesContractCurrencyRate
                      )
                    : ticketLiquidityQuery.data
                : undefined,
        [
            ticketLiquidityQuery.isSuccess,
            ticketLiquidityQuery.data,
            isThales,
            selectedCollateralCurrencyRate,
            thalesContractCurrencyRate,
            swapToThales,
        ]
    );

    // Clear Ticket when network is changed
    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            dispatch(removeAll());
        } else {
            isMounted.current = true;
        }
    }, [dispatch, networkId]);

    const fetchTicketAmmQuote = useCallback(
        async (buyInAmountForQuote: number) => {
            if (Number(buyInAmountForQuote) <= 0) return;

            const { sportsAMMV2Contract, multiCollateralOnOffRampContract } = networkConnector;
            if (sportsAMMV2Contract && minBuyInAmountInDefaultCollateral) {
                const tradeData = getTradeData(markets);

                try {
                    const [minimumNeededForMinUsdAmountValue] = await Promise.all([
                        collateralHasLp
                            ? minBuyInAmountInDefaultCollateral /
                              (isThales || swapToThales
                                  ? thalesContractCurrencyRate
                                  : isDefaultCollateral
                                  ? 1
                                  : selectedCollateralCurrencyRate)
                            : multiCollateralOnOffRampContract?.getMinimumNeeded(
                                  collateralAddress,
                                  coinParser(minBuyInAmountInDefaultCollateral.toString(), networkId)
                              ),
                    ]);

                    const minBuyin =
                        (collateralHasLp
                            ? minimumNeededForMinUsdAmountValue
                            : coinFormatter(minimumNeededForMinUsdAmountValue, networkId, usedCollateralForBuy)) *
                        (isDefaultCollateral && !swapToThales ? 1 : MIN_COLLATERAL_MULTIPLIER);

                    setMinBuyInAmount(roundNumberToDecimals(minBuyin, 18));

                    if (markets[0]?.live) {
                        const [minimumReceivedForBuyInAmount] = await Promise.all([
                            collateralHasLp
                                ? buyInAmountForQuote *
                                  (isDefaultCollateral && !swapToThales ? 1 : selectedCollateralCurrencyRate)
                                : multiCollateralOnOffRampContract?.getMinimumReceived(
                                      swapToThales ? thalesCollateralAddress : collateralAddress,
                                      coinParser(buyInAmountForQuote.toString(), networkId, usedCollateralForBuy)
                                  ),
                        ]);

                        const minimumReceivedForBuyInAmountInDefaultCollateral = collateralHasLp
                            ? minimumReceivedForBuyInAmount
                            : coinFormatter(minimumReceivedForBuyInAmount, networkId);
                        setBuyInAmountInDefaultCollateral(minimumReceivedForBuyInAmountInDefaultCollateral);

                        return { buyInAmountInDefaultCollateral: minimumReceivedForBuyInAmountInDefaultCollateral };
                    } else {
                        const [parlayAmmQuote] = await Promise.all([
                            getSportsAMMV2QuoteMethod(
                                swapToThales ? thalesCollateralAddress : collateralAddress,
                                isDefaultCollateral && !swapToThales,
                                sportsAMMV2Contract,
                                tradeData,
                                coinParser(buyInAmountForQuote.toString(), networkId, usedCollateralForBuy)
                            ),
                        ]);

                        setBuyInAmountInDefaultCollateral(
                            isThales || swapToThales
                                ? (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) *
                                      selectedCollateralCurrencyRate
                                : coinFormatter(parlayAmmQuote.buyInAmountInDefaultCollateral, networkId)
                        );

                        return parlayAmmQuote;
                    }
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
                    return { error: e };
                }
            }
        },
        [
            minBuyInAmountInDefaultCollateral,
            markets,
            collateralHasLp,
            isDefaultCollateral,
            isThales,
            thalesContractCurrencyRate,
            selectedCollateralCurrencyRate,
            collateralAddress,
            networkId,
            buyInAmount,
            swapToThales,
            swappedThalesToReceive,
            usedCollateralForBuy,
            thalesCollateralAddress,
        ]
    );

    const swapToThalesParams = useMemo(
        () =>
            getSwapParams(
                networkId,
                walletAddress as Address,
                coinParser(buyInAmount.toString(), networkId, selectedCollateral),
                collateralAddress as Address
            ),
        [buyInAmount, collateralAddress, networkId, selectedCollateral, walletAddress]
    );

    // Set THALES swap receive
    useDebouncedEffect(() => {
        if (isThales) {
            setSwapToThales(false);
            setUseThalesCollateral(false);
            setSwappedThalesToReceive(0);
            setSwapQuote(0);
        } else if (swapToThales && buyInAmount) {
            const getSwapQuote = async () => {
                const quote = await getQuote(networkId, swapToThalesParams);

                setSwappedThalesToReceive(quote);
                setSwapQuote(quote / Number(buyInAmount));
            };

            getSwapQuote();
        } else {
            setSwappedThalesToReceive(0);
            setSwapQuote(0);
        }
    }, [swapToThales, buyInAmount, networkId, swapToThalesParams, isThales, setUseThalesCollateral]);

    // Refresh swap THALES quote on 7s
    useInterval(
        async () => {
            if (!openBuyStepsModal) {
                const quote = await getQuote(networkId, swapToThalesParams);
                setSwappedThalesToReceive(quote);
                setSwapQuote(quote / Number(buyInAmount));
            }
        },
        !isThales && swapToThales && buyInAmount ? secondsToMilliseconds(7) : null
    );

    // Reset buy step when collateral is changed
    useEffect(() => {
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
    }, [selectedCollateral]);

    // Check swap allowance
    useEffect(() => {
        if (isWalletConnected && swapToThales) {
            const getSwapAllowance = async () => {
                const allowance = await checkSwapAllowance(
                    networkId,
                    walletAddress as Address,
                    swapToThalesParams.src,
                    coinParser(buyInAmount.toString(), networkId, selectedCollateral)
                );

                setHasSwapAllowance(allowance);
            };

            getSwapAllowance();
        }
    }, [
        walletAddress,
        isWalletConnected,
        buyInAmount,
        networkId,
        selectedCollateral,
        swapToThales,
        swapToThalesParams.src,
        isBuying,
    ]);

    // Check allowance
    useEffect(() => {
        const { sportsAMMV2Contract, sUSDContract, signer, multipleCollateral } = networkConnector;

        if (isFreeBetActive && isWalletConnected) {
            setHasAllowance(true);
            return;
        }
        if (sportsAMMV2Contract && multipleCollateral && signer) {
            const collateralToAllow = swapToThales
                ? (CRYPTO_CURRENCY_MAP.THALES as Coins)
                : isLiveTicket && isEth
                ? (CRYPTO_CURRENCY_MAP.WETH as Coins)
                : selectedCollateral;

            const collateralContractWithSigner =
                isDefaultCollateral && !swapToThales
                    ? sUSDContract?.connect(signer)
                    : multipleCollateral[collateralToAllow]?.connect(signer);

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = coinParser(
                        (swapToThales ? swappedThalesToReceive : Number(buyInAmount)).toString(),
                        networkId,
                        collateralToAllow
                    );
                    const allowance = await checkAllowance(
                        parsedTicketPrice,
                        collateralContractWithSigner,
                        walletAddress,
                        sportsAMMV2Contract.address
                    );
                    if (!mountedRef.current) return null;
                    setHasAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && buyInAmount) {
                isEth && !isLiveTicket && !swapToThales ? setHasAllowance(true) : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        buyInAmount,
        selectedCollateralIndex,
        networkId,
        selectedCollateral,
        isEth,
        isDefaultCollateral,
        isLiveTicket,
        isFreeBetActive,
        swapToThales,
        swappedThalesToReceive,
    ]);

    const isValidProfit: boolean = useMemo(() => {
        return (
            sportsAmmData?.maxSupportedAmount !== undefined &&
            Number(buyInAmountInDefaultCollateral) / Number(totalQuote) - Number(buyInAmountInDefaultCollateral) >
                sportsAmmData?.maxSupportedAmount
        );
    }, [sportsAmmData?.maxSupportedAmount, buyInAmountInDefaultCollateral, totalQuote]);

    // Validations
    useEffect(() => {
        if (isBuying) return;

        if (
            (Number(buyInAmount) && finalQuotes.some((quote) => quote === 0)) ||
            (Number(buyInAmountInDefaultCollateral) &&
                ticketLiquidity &&
                Number(buyInAmountInDefaultCollateral) > ticketLiquidity)
        ) {
            setTooltipTextBuyInAmount(t('markets.parlay.validation.availability'));
        } else if (
            Number(buyInAmount) &&
            (swapToThales ? swapQuote && swappedThalesToReceive < minBuyInAmount : Number(buyInAmount) < minBuyInAmount)
        ) {
            const minBuyin = minBuyInAmount / (swapToThales ? swapQuote : 1);
            const decimals = getPrecision(minBuyin);
            setTooltipTextBuyInAmount(
                t('markets.parlay.validation.min-amount', {
                    min: `${formatCurrencyWithKey(
                        selectedCollateral,
                        ceilNumberToDecimals(minBuyin, decimals),
                        decimals
                    )}${
                        isDefaultCollateral
                            ? ''
                            : ` (${formatCurrencyWithSign(
                                  USD_SIGN,
                                  ceilNumberToDecimals(minBuyInAmountInDefaultCollateral * MIN_COLLATERAL_MULTIPLIER),
                                  2
                              )})`
                    }`,
                })
            );
        } else if (isValidProfit) {
            setTooltipTextBuyInAmount(
                t('markets.parlay.validation.max-profit', {
                    max: formatCurrencyWithSign(USD_SIGN, sportsAmmData?.maxSupportedAmount || 0),
                })
            );
        } else if (Number(buyInAmount) > paymentTokenBalance) {
            setTooltipTextBuyInAmount(t('markets.parlay.validation.no-funds'));
        } else {
            setTooltipTextBuyInAmount('');
        }
    }, [
        buyInAmount,
        buyInAmountInDefaultCollateral,
        finalQuotes,
        isDefaultCollateral,
        isValidProfit,
        minBuyInAmount,
        minBuyInAmountInDefaultCollateral,
        paymentTokenBalance,
        selectedCollateral,
        sportsAmmData?.maxSupportedAmount,
        t,
        ticketLiquidity,
        swapToThales,
        swappedThalesToReceive,
        selectedCollateralCurrencyRate,
        swapQuote,
        isBuying,
    ]);

    const setCollateralAmount = useCallback(
        (value: string | number) => {
            dispatch(setPaymentAmountToBuy(value));
        },
        [dispatch]
    );

    const setMaxAmount = (value: string | number) => {
        const decimals = isStableCollateral ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS;
        const liquidityInCollateral = (ticketLiquidity || 1) / selectedCollateralCurrencyRate;
        const amount = liquidityInCollateral > Number(value) ? Number(value) : liquidityInCollateral;
        setCollateralAmount(floorNumberToDecimals(amount, decimals));
    };

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { sportsAMMV2Contract, sUSDContract, signer, multipleCollateral } = networkConnector;

        if (sportsAMMV2Contract && multipleCollateral && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const collateralContractWithSigner = isDefaultCollateral
                    ? sUSDContract?.connect(signer)
                    : multipleCollateral[isEth ? (CRYPTO_CURRENCY_MAP.WETH as Coins) : selectedCollateral]?.connect(
                          signer
                      );

                const addressToApprove = sportsAMMV2Contract.address;
                let txResult;
                if (isAA) {
                    txResult = await executeBiconomyTransaction(
                        collateralContractWithSigner?.address ?? '',
                        collateralContractWithSigner,
                        'approve',
                        [addressToApprove, approveAmount]
                    );
                } else {
                    const tx = (await collateralContractWithSigner?.approve(
                        addressToApprove,
                        approveAmount
                    )) as ethers.ContractTransaction;
                    setOpenApprovalModal(false);
                    txResult = await tx.wait();
                }

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

    const handleBuyWithThalesSteps = async (initialStep: BuyTicketStep) => {
        let step = initialStep;

        const { sportsAMMV2Contract, multipleCollateral, signer } = networkConnector;

        // Validation for min buy-in while modal is open
        if (swappedThalesToReceive && swappedThalesToReceive < minBuyInAmount) {
            setOpenBuyStepsModal(false);
            return step;
        }

        if (step <= BuyTicketStep.SWAP) {
            if (!isEth && !hasSwapAllowance) {
                if (step !== BuyTicketStep.APPROVE_SWAP) {
                    setBuyStep(BuyTicketStep.APPROVE_SWAP);
                }

                const approveAmount = coinParser(
                    (Number(buyInAmount) * (1 + APPROVAL_BUFFER)).toString(),
                    networkId,
                    selectedCollateral
                );
                let approveSwapRawTransaction = await buildTxForApproveTradeWithRouter(
                    networkId,
                    walletAddress as Address,
                    swapToThalesParams.src,
                    approveAmount.toString()
                );

                // retry once
                if (!approveSwapRawTransaction) {
                    await delay(1200);
                    approveSwapRawTransaction = await buildTxForApproveTradeWithRouter(
                        networkId,
                        walletAddress as Address,
                        swapToThalesParams.src,
                        approveAmount.toString()
                    );
                }

                try {
                    const approveTxHash = await sendTransaction(approveSwapRawTransaction);

                    if (approveTxHash) {
                        step = BuyTicketStep.SWAP;
                        setBuyStep(step);
                        await delay(1000); // wait for 1inch API to read correct approval
                    }
                } catch (e) {
                    console.log('Approve swap failed', e);
                }
            } else {
                step = BuyTicketStep.SWAP;
                setBuyStep(step);
            }
        }

        if (step === BuyTicketStep.SWAP) {
            try {
                let swapRawTransaction = (await buildTxForSwap(networkId, swapToThalesParams)).tx;
                // retry once
                if (!swapRawTransaction) {
                    await delay(1200);
                    swapRawTransaction = (await buildTxForSwap(networkId, swapToThalesParams)).tx;
                }

                const swapTxHash = swapRawTransaction ? await sendTransaction(swapRawTransaction) : undefined;

                if (swapTxHash) {
                    step = BuyTicketStep.APPROVE_BUY;
                    setBuyStep(step);
                    await delay(3000); // wait for THALES balance to increase
                }
            } catch (e) {
                console.log('Swap tx failed', e);
            }
        }

        if (step >= BuyTicketStep.APPROVE_BUY) {
            if (!hasAllowance) {
                step = BuyTicketStep.APPROVE_BUY;
                setBuyStep(step);

                if (sportsAMMV2Contract && multipleCollateral && signer) {
                    try {
                        const collateralContractWithSigner = multipleCollateral[
                            CRYPTO_CURRENCY_MAP.THALES as Coins
                        ]?.connect(signer);

                        const addressToApprove = sportsAMMV2Contract.address;
                        const approveAmount = ethers.constants.MaxUint256;

                        let txResult;
                        if (isAA) {
                            txResult = await executeBiconomyTransaction(
                                collateralContractWithSigner?.address ?? '',
                                collateralContractWithSigner,
                                'approve',
                                [addressToApprove, approveAmount]
                            );
                        } else {
                            const tx = (await collateralContractWithSigner?.approve(
                                addressToApprove,
                                approveAmount
                            )) as ethers.ContractTransaction;
                            txResult = await tx.wait();
                        }

                        if (txResult && txResult.transactionHash) {
                            step = BuyTicketStep.BUY;
                            setBuyStep(step);
                        }
                    } catch (e) {
                        console.log('Approve buy failed', e);
                    }
                }
            } else {
                step = BuyTicketStep.BUY;
                setBuyStep(step);
            }
        }

        return step;
    };

    const handleSubmit = async () => {
        const {
            sportsAMMV2Contract,
            signer,
            liveTradingProcessorContract,
            sportsAMMDataContract,
            sportsAMMV2ManagerContract,
            multipleCollateral,
            freeBetHolderContract,
        } = networkConnector;

        // TODO: separate logic for regular and live markets
        if (
            ((sportsAMMV2Contract && !markets[0].live) || (liveTradingProcessorContract && markets[0].live)) &&
            signer
        ) {
            setIsBuying(true);
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));

            let step = buyStep;
            if (swapToThales) {
                await refetchCoingeckoRates();
                if (
                    step <= BuyTicketStep.SWAP &&
                    swappedThalesToReceive &&
                    swappedThalesToReceive < coingeckoThalesMinRecive
                ) {
                    await delay(800);
                    toast.update(
                        toastId,
                        getErrorToastOptions(
                            t('common.errors.swap-quote-low', {
                                quote: formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.THALES, swappedThalesToReceive),
                                minQuote: formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.THALES, coingeckoThalesMinRecive),
                            })
                        )
                    );
                    setIsBuying(false);
                    return;
                }

                setOpenBuyStepsModal(true);
                step = await handleBuyWithThalesSteps(step);

                if (step !== BuyTicketStep.BUY) {
                    toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                    setIsBuying(false);
                    return;
                }
            }

            const sportsAMMV2ContractWithSigner = markets[0].live
                ? liveTradingProcessorContract?.connect(signer)
                : sportsAMMV2Contract?.connect(signer);
            const freeBetContractWithSigner = freeBetHolderContract?.connect(signer);

            try {
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;

                const tradeData = getTradeData(markets);
                const parsedBuyInAmount = coinParser(
                    (swapToThales ? swappedThalesToReceive : buyInAmount).toString(),
                    networkId,
                    usedCollateralForBuy
                );
                const parsedTotalQuote = ethers.utils.parseEther(floorNumberToDecimals(totalQuote, 18).toString());
                const additionalSlippage = ethers.utils.parseEther(
                    tradeData[0].live ? liveBetSlippage / 100 + '' : '0.02'
                );

                let tx;
                if (tradeData[0].live) {
                    const liveTradeDataOdds = tradeData[0].odds;
                    const liveTradeDataPosition = tradeData[0].position;
                    const liveTotalQuote = liveTradeDataOdds[liveTradeDataPosition];

                    if (isEth && multipleCollateral?.WETH && !swapToThales) {
                        const WETHContractWithSigner = multipleCollateral.WETH.connect(signer);

                        const wrapTx = await WETHContractWithSigner.deposit({ value: parsedBuyInAmount });
                        const wrapTxResult = await wrapTx.wait();

                        if (wrapTxResult && wrapTxResult.transactionHash) {
                            tx = await getLiveTradingProcessorTransaction(
                                collateralAddress,
                                sportsAMMV2ContractWithSigner,
                                tradeData,
                                parsedBuyInAmount,
                                liveTotalQuote,
                                referralId,
                                additionalSlippage,
                                isAA,
                                false,
                                undefined
                            );
                        }
                    } else {
                        tx = await getLiveTradingProcessorTransaction(
                            swapToThales ? thalesCollateralAddress : collateralAddress,
                            sportsAMMV2ContractWithSigner,
                            tradeData,
                            parsedBuyInAmount,
                            liveTotalQuote,
                            referralId,
                            additionalSlippage,
                            isAA,
                            isFreeBetActive,
                            freeBetContractWithSigner
                        );
                    }
                } else {
                    tx = await getSportsAMMV2Transaction(
                        swapToThales ? thalesCollateralAddress : collateralAddress,
                        isDefaultCollateral && !swapToThales,
                        isEth && !swapToThales,
                        networkId,
                        sportsAMMV2ContractWithSigner,
                        freeBetContractWithSigner,
                        tradeData,
                        parsedBuyInAmount,
                        parsedTotalQuote,
                        referralId,
                        additionalSlippage,
                        isAA,
                        isFreeBetActive
                    );
                }

                const txResult = isAA ? tx : await tx?.wait();

                if (txResult && txResult.transactionHash) {
                    PLAUSIBLE.trackEvent(
                        tradeData[0].live
                            ? isFreeBetActive
                                ? PLAUSIBLE_KEYS.freeBetLive
                                : PLAUSIBLE_KEYS.livePositionBuy
                            : PLAUSIBLE_KEYS.parlayBuy,
                        {
                            props: {
                                value: Number(buyInAmount),
                                collateral: selectedCollateral,
                                networkId,
                            },
                        }
                    );
                    if (!tradeData[0].live) {
                        refetchBalances(walletAddress, networkId);

                        const modalData: ShareTicketModalProps = {
                            markets: [...markets],
                            multiSingle: false,
                            paid:
                                !collateralHasLp || (isDefaultCollateral && !swapToThales)
                                    ? Number(buyInAmountInDefaultCollateral)
                                    : swapToThales
                                    ? swappedThalesToReceive
                                    : Number(buyInAmount),
                            payout: payout,
                            onClose: () => {
                                if (!keepSelection) dispatch(removeAll());
                                onModalClose();
                                onSuccess && onSuccess();
                            },
                            isTicketLost: false,
                            collateral: collateralHasLp ? usedCollateralForBuy : defaultCollateral,
                            isLive: false,
                            applyPayoutMultiplier: true,
                        };
                        setShareTicketModalData(modalData);
                        setShowShareTicketModal(true);

                        setBuyStep(BuyTicketStep.COMPLETED);
                        setOpenBuyStepsModal(false);

                        toast.update(toastId, getSuccessToastOptions(t('market.toast-message.buy-success')));
                        setIsBuying(false);
                        setCollateralAmount('');
                    } else if (sportsAMMV2ContractWithSigner) {
                        let counter = 0;
                        let adapterAllowed = false;
                        const requestId = txResult.events.find((event: any) =>
                            isFreeBetActive
                                ? event.event == 'FreeBetLiveTradeRequested'
                                : event.event === 'LiveTradeRequested'
                        ).args[2];
                        const startTime = Date.now();
                        console.log('filfill start time:', new Date(startTime));
                        const checkFulfilled = async () => {
                            counter++;
                            if (!adapterAllowed) {
                                const adapterResponse = await axios.get(
                                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/live-trading/read-message/request/${requestId}`
                                );

                                if (!!adapterResponse.data) {
                                    if (adapterResponse.data.allow) {
                                        adapterAllowed = true;
                                        toast.update(toastId, getLoadingToastOptions(adapterResponse.data.message));
                                    } else {
                                        setIsBuying(false);
                                        refetchBalances(walletAddress, networkId);
                                        toast.update(toastId, getErrorToastOptions(adapterResponse.data.message));
                                        return;
                                    }
                                }
                            }

                            const isFulfilled = await sportsAMMV2ContractWithSigner.requestIdToFulfillAllowed(
                                requestId
                            );
                            if (!isFulfilled) {
                                if (Date.now() - startTime >= (maxAllowedExecutionDelay + 10) * 1000) {
                                    setIsBuying(false);
                                    refetchBalances(walletAddress, networkId);
                                    toast.update(toastId, getErrorToastOptions(t('markets.parlay.odds-changed-error')));
                                } else {
                                    if (counter / 5 === 1 && !adapterAllowed) {
                                        toast.update(
                                            toastId,
                                            getLoadingToastOptions(t('market.toast-message.fulfilling-live-trade'))
                                        );
                                    }
                                    setTimeout(checkFulfilled, 1000);
                                }
                            } else {
                                console.log('filfill end time:', new Date(Date.now()));
                                console.log('fulfill duration', (Date.now() - startTime) / 1000, 'seconds');
                                refetchBalances(walletAddress, networkId);
                                if (sportsAMMDataContract && sportsAMMV2ManagerContract && freeBetHolderContract) {
                                    const numOfActiveTicketsPerUser = isFreeBetActive
                                        ? await freeBetHolderContract.numOfActiveTicketsPerUser(walletAddress)
                                        : await sportsAMMV2ManagerContract.numOfActiveTicketsPerUser(walletAddress);
                                    const userTickets = await sportsAMMDataContract.getActiveTicketsDataPerUser(
                                        walletAddress.toLowerCase(),
                                        Number(numOfActiveTicketsPerUser) - 1,
                                        BATCH_SIZE
                                    );
                                    const lastTicket = isFreeBetActive
                                        ? userTickets.freeBetsData[userTickets.freeBetsData.length - 1]
                                        : userTickets.ticketsData[userTickets.ticketsData.length - 1];
                                    const lastTicketPaid =
                                        !collateralHasLp || (isDefaultCollateral && !swapToThales)
                                            ? coinFormatter(lastTicket.buyInAmount, networkId)
                                            : swapToThales
                                            ? swappedThalesToReceive
                                            : Number(buyInAmount);
                                    const lastTicketPayout = lastTicketPaid / bigNumberFormatter(lastTicket.totalQuote);

                                    const modalData: ShareTicketModalProps = {
                                        markets: [
                                            {
                                                ...markets[0],
                                                odd: bigNumberFormatter(lastTicket.totalQuote),
                                            },
                                        ],
                                        multiSingle: false,
                                        paid: lastTicketPaid,
                                        payout: lastTicketPayout,
                                        onClose: () => {
                                            if (!keepSelection) dispatch(removeAll());
                                            onModalClose();
                                            onSuccess && onSuccess();
                                        },
                                        isTicketLost: false,
                                        collateral: collateralHasLp ? selectedCollateral : defaultCollateral,
                                        isLive: true,
                                        applyPayoutMultiplier: false,
                                    };
                                    setShareTicketModalData(modalData);
                                    setShowShareTicketModal(true);
                                }

                                setBuyStep(BuyTicketStep.COMPLETED);
                                setOpenBuyStepsModal(false);

                                toast.update(toastId, getSuccessToastOptions(t('market.toast-message.buy-success')));
                                setIsBuying(false);
                                setCollateralAmount('');
                            }
                        };
                        toast.update(toastId, getLoadingToastOptions(t('market.toast-message.live-trade-requested')));
                        setTimeout(checkFulfilled, 2000);
                    }

                    if (isFreeBetActive) {
                        refetchFreeBetBalance(walletAddress, networkId);
                        setIsFreeBetInitialized(false);
                    }
                }
            } catch (e) {
                setIsBuying(false);
                refetchBalances(walletAddress, networkId);
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log('Error ', e);
            }
        }
    };

    // Button validations
    useEffect(() => {
        if (isAMMPaused) {
            setSubmitDisabled(true);
            return;
        }

        // Minimum buyIn
        if (
            !Number(buyInAmount) ||
            (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) < minBuyInAmount ||
            isBuying ||
            isAllowing
        ) {
            setSubmitDisabled(true);
            return;
        }

        // Enable Approve if it hasn't allowance
        if (!hasAllowance && !swapToThales) {
            setSubmitDisabled(false);
            return;
        }

        // Validation message is present
        if (tooltipTextBuyInAmount) {
            setSubmitDisabled(true);
            return;
        }

        // No payout
        if (!Number(payout)) {
            setSubmitDisabled(true);
            return;
        }

        // Not enough funds
        setSubmitDisabled(!paymentTokenBalance || Number(buyInAmount) > paymentTokenBalance);
    }, [
        buyInAmount,
        isBuying,
        isAllowing,
        hasAllowance,
        hasSwapAllowance,
        paymentTokenBalance,
        totalQuote,
        tooltipTextBuyInAmount,
        minBuyInAmountInDefaultCollateral,
        isAMMPaused,
        minBuyInAmount,
        payout,
        oddsChanged,
        markets,
        isLiveTicket,
        swappedThalesToReceive,
        swapToThales,
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

        // Show Approve only on valid input buy amount
        if (!swapToThales && !hasAllowance && buyInAmount && Number(buyInAmount) >= minBuyInAmount) {
            if (isLiveTicket && isEth) {
                return (
                    <Tooltip
                        overlay={t('common.wrap-eth-tooltip')}
                        component={
                            <Button
                                disabled={submitDisabled}
                                onClick={() =>
                                    isParticle
                                        ? handleAllowance(ethers.constants.MaxUint256)
                                        : setOpenApprovalModal(true)
                                }
                                {...defaultButtonProps}
                            >
                                {t('common.wallet.approve')}
                            </Button>
                        }
                    ></Tooltip>
                );
            }
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

        if (!swapToThales && isLiveTicket && isEth) {
            return (
                <>
                    <Tooltip
                        overlay={t('common.wrap-eth-tooltip')}
                        component={
                            <Button
                                disabled={submitDisabled}
                                onClick={async () => handleSubmit()}
                                {...defaultButtonProps}
                            >
                                {t(`common.wrap-and-buy`)}
                            </Button>
                        }
                    ></Tooltip>
                </>
            );
        }

        return (
            <Button
                disabled={submitDisabled || submitButtonDisabled}
                onClick={async () => handleSubmit()}
                {...defaultButtonProps}
            >
                {t(`common.buy-side`)}
            </Button>
        );
    };

    useEffect(() => {
        let isSubscribed = true; // Use for race condition

        const fetchData = async () => {
            setIsFetching(true);
            const { sportsAMMV2Contract } = networkConnector;
            if (sportsAMMV2Contract && Number(buyInAmount) > 0 && minBuyInAmountInDefaultCollateral) {
                const parlayAmmQuote = await fetchTicketAmmQuote(
                    swapToThales ? swappedThalesToReceive : Number(buyInAmount)
                );

                if (!mountedRef.current || !isSubscribed || !parlayAmmQuote) return null;

                if (!parlayAmmQuote.error) {
                    if (markets[0]?.live) {
                        setPayout(
                            (1 / totalQuote) *
                                Number(
                                    collateralHasLp
                                        ? swapToThales
                                            ? swappedThalesToReceive
                                            : buyInAmount
                                        : parlayAmmQuote.buyInAmountInDefaultCollateral
                                )
                        );
                    } else {
                        const payout = coinFormatter(
                            parlayAmmQuote.payout,
                            networkId,
                            collateralHasLp
                                ? swapToThales
                                    ? (CRYPTO_CURRENCY_MAP.THALES as Coins)
                                    : selectedCollateral
                                : undefined
                        );
                        setPayout(payout);
                        const amountsToBuy: number[] = (parlayAmmQuote.amountsToBuy || []).map((quote: BigNumber) =>
                            coinFormatter(
                                quote,
                                networkId,
                                collateralHasLp
                                    ? swapToThales
                                        ? (CRYPTO_CURRENCY_MAP.THALES as Coins)
                                        : selectedCollateral
                                    : undefined
                            )
                        );
                        // Update markets (using order index) which are out of liquidity
                        const marketsOutOfLiquidity = amountsToBuy
                            .map((amountToBuy, index) => (amountToBuy === 0 ? index : -1))
                            .filter((index) => index !== -1);
                        setMarketsOutOfLiquidity(marketsOutOfLiquidity);

                        setFinalQuotes(amountsToBuy);
                    }
                } else {
                    setMarketsOutOfLiquidity([]);
                    setPayout(0);
                    // setTooltipTextMessageUsdAmount(0, [], parlayAmmQuote.error);
                }
            } else {
                if (Number(buyInAmount) === 0) {
                    setFinalQuotes([]);
                    setMarketsOutOfLiquidity([]);
                }
            }
            setIsFetching(false);
        };
        fetchData().catch((e) => console.log(e));

        return () => {
            isSubscribed = false;
        };
    }, [
        buyInAmount,
        fetchTicketAmmQuote,
        minBuyInAmountInDefaultCollateral,
        setMarketsOutOfLiquidity,
        markets,
        networkId,
        buyInAmountInDefaultCollateral,
        collateralHasLp,
        selectedCollateral,
        totalQuote,
        swappedThalesToReceive,
        swapToThales,
    ]);

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const getQuoteTooltipText = () => {
        return selectedOddsType === OddsType.AMM
            ? t('markets.parlay.info.min-quote', {
                  value: formatMarketOdds(selectedOddsType, sportsAmmData?.maxSupportedOdds),
              })
            : t('markets.parlay.info.max-quote', {
                  value: formatMarketOdds(selectedOddsType, sportsAmmData?.maxSupportedOdds),
              });
    };

    const hidePayout =
        Number(buyInAmount) <= 0 ||
        (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) < minBuyInAmount ||
        payout === 0 ||
        // hide when validation tooltip exists except in case of invalid profit and not enough funds
        (tooltipTextBuyInAmount && !isValidProfit && Number(buyInAmount) < paymentTokenBalance) ||
        isFetching;

    const profitPercentage =
        (Number(buyInAmountInDefaultCollateral) / Number(totalQuote) - Number(buyInAmountInDefaultCollateral)) /
        Number(buyInAmountInDefaultCollateral);

    const onModalClose = useCallback(() => {
        setShowShareTicketModal(false);
    }, []);

    const twitterShareDisabled = submitDisabled || !hasAllowance;
    const onTwitterIconClick = () => {
        //create data copy to avoid modal re-render while opened
        const modalData: ShareTicketModalProps = {
            markets: [...markets],
            multiSingle: false,
            paid:
                !collateralHasLp || (isDefaultCollateral && !swapToThales)
                    ? Number(buyInAmountInDefaultCollateral)
                    : swapToThales
                    ? swappedThalesToReceive
                    : Number(buyInAmount),
            payout: payout,
            onClose: onModalClose,
            isTicketLost: false,
            collateral: collateralHasLp ? selectedCollateral : defaultCollateral,
            isLive: !!markets[0].live,
            applyPayoutMultiplier: true,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(!twitterShareDisabled);
    };

    useEffect(() => {
        const setGasFee = async () => {
            const { sportsAMMV2Contract, sUSDContract, signer, multipleCollateral } = networkConnector;
            if (!signer || !multipleCollateral || !sportsAMMV2Contract) return;

            const referralId =
                walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                    ? getReferralId()
                    : null;

            const tradeData = getTradeData(markets);
            const parsedTotalQuote = ethers.utils.parseEther(totalQuote.toString());
            const additionalSlippage = ethers.utils.parseEther('0.02');

            // TODO: check swap to THALES
            if (!hasAllowance) {
                const collateralContractWithSigner = isDefaultCollateral
                    ? sUSDContract?.connect(signer)
                    : multipleCollateral[selectedCollateral]?.connect(signer);

                const addressToApprove = sportsAMMV2Contract.address;

                const gas = await getGasFeesForTx(
                    collateralContractWithSigner?.address ?? '',
                    collateralContractWithSigner,
                    'approve',
                    [addressToApprove, ethers.constants.MaxUint256]
                );

                setGas(gas as number);
            } else {
                const gas = await getGasFeesForTx(collateralAddress, sportsAMMV2Contract, 'trade', [
                    tradeData,
                    buyInAmount,
                    parsedTotalQuote,
                    additionalSlippage,
                    referralId,
                    collateralAddress,
                    isEth,
                ]);

                setGas(gas as number);
            }
        };
        if (isAA) setGasFee();
    }, [
        collateralAddress,
        markets,
        buyInAmountInDefaultCollateral,
        networkId,
        payout,
        isDefaultCollateral,
        isAA,
        hasAllowance,
        selectedCollateral,
        isEth,
        walletAddress,
        totalQuote,
        buyInAmount,
    ]);

    return (
        <>
            <RowSummary columnDirection={true}>
                <RowContainer>
                    <SummaryLabel>{t('markets.parlay.total-quote')}:</SummaryLabel>
                    <InfoTooltip
                        open={inputRefVisible && totalQuote === sportsAmmData?.maxSupportedOdds}
                        title={getQuoteTooltipText()}
                        placement={'top'}
                        arrow={true}
                    >
                        <SummaryValue fontSize={12}>{formatMarketOdds(selectedOddsType, totalQuote)}</SummaryValue>
                    </InfoTooltip>
                    <ClearLabel alignRight={true} onClick={() => dispatch(removeAll())}>
                        {t('markets.parlay.clear')}
                        <XButton margin={'0 0 4px 5px'} className={`icon icon--clear`} />
                    </ClearLabel>
                </RowContainer>
                {(isThales || swapToThales) && (
                    <RowContainer>
                        <SummaryLabel>{t('markets.parlay.total-bonus')}:</SummaryLabel>
                        <SummaryValue fontSize={12}>{formatPercentage(totalBonus.percentage)}</SummaryValue>
                        <SummaryValue isCurrency={true} isHidden={!!hidePayout} fontSize={12}>
                            {`(${formatCurrencyWithSign(
                                '+ ' + USD_SIGN,
                                totalBonus.value * selectedCollateralCurrencyRate
                            )})`}
                        </SummaryValue>
                        <SummaryLabel>
                            <Tooltip
                                overlay={<>{t(`markets.parlay.thales-bonus-tooltip`)}</>}
                                iconFontSize={14}
                                marginLeft={3}
                            />
                        </SummaryLabel>
                    </RowContainer>
                )}
            </RowSummary>
            <SuggestedAmount
                insertedAmount={buyInAmount}
                exchangeRates={exchangeRates}
                collateralIndex={selectedCollateralIndex}
                changeAmount={(value) => setCollateralAmount(value)}
            />
            {freeBetBalanceExists && (
                <RowSummary>
                    <RowContainer>
                        <SummaryLabel>
                            <FreeBetIcon className="icon icon--gift" />
                            {t('markets.parlay.use-free-bet')}
                            <Tooltip
                                overlay={<>{t('profile.free-bet.claim-btn')}</>}
                                iconFontSize={14}
                                marginLeft={3}
                            />
                            :
                        </SummaryLabel>
                        <CheckboxContainer>
                            <Checkbox
                                disabled={false}
                                checked={isFreeBetActive}
                                value={isFreeBetActive.toString()}
                                onChange={(e: any) => {
                                    const isChecked = e.target.checked || false;
                                    setIsFreeBetActive(isChecked);
                                    dispatch(setIsFreeBetDisabledByUser(!isChecked));
                                    if (isChecked) {
                                        setCheckFreeBetBalance(true);
                                    }
                                }}
                            />
                        </CheckboxContainer>
                    </RowContainer>
                </RowSummary>
            )}
            <RowSummary>
                <SummaryLabel lineHeight={26}>{t('markets.parlay.buy-in')}:</SummaryLabel>
            </RowSummary>
            <InputContainer ref={inputRef}>
                <AmountToBuyContainer>
                    <NumericInput
                        value={buyInAmount}
                        onChange={(e) => {
                            setCollateralAmount(e.target.value);
                        }}
                        showValidation={inputRefVisible && !!tooltipTextBuyInAmount && !openApprovalModal}
                        validationMessage={tooltipTextBuyInAmount}
                        inputFontWeight="600"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                        disabled={isAllowing || isBuying}
                        placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                        currencyComponent={
                            <CollateralSelector
                                collateralArray={getCollaterals(networkId)}
                                selectedItem={selectedCollateralIndex}
                                onChangeCollateral={() => {
                                    setCollateralAmount('');
                                }}
                                isDetailedView
                                collateralBalances={
                                    isFreeBetActive ? freeBetCollateralBalances : multipleCollateralBalances.data
                                }
                                exchangeRates={exchangeRates}
                                dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                            />
                        }
                        balance={formatCurrencyWithKey(selectedCollateral, paymentTokenBalance)}
                        onMaxButton={() => setMaxAmount(paymentTokenBalance)}
                    />
                </AmountToBuyContainer>
            </InputContainer>
            {!isThales && (
                <RowSummary>
                    <RowContainer>
                        <SummaryLabel isBonus>
                            {t('markets.parlay.swap-thales')}
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.parlay.swap-thales-tooltip"
                                        components={{
                                            bold: <BoldContent />,
                                        }}
                                    />
                                }
                                iconFontSize={14}
                                marginLeft={3}
                            />
                            :
                        </SummaryLabel>
                    </RowContainer>
                    <ToggleContainer>
                        <Toggle
                            active={swapToThales}
                            width="44px"
                            height="20px"
                            background={swapToThales ? theme.borderColor.tertiary : undefined}
                            borderColor={swapToThales ? theme.borderColor.tertiary : theme.borderColor.senary}
                            borderWidth={swapToThales ? '0px' : undefined}
                            dotSize="14px"
                            dotBackground={theme.background.senary}
                            dotMargin="3px"
                            handleClick={() => {
                                setSwapToThales(!swapToThales);
                                setUseThalesCollateral(!swapToThales);
                            }}
                        />
                    </ToggleContainer>
                </RowSummary>
            )}
            <InfoContainer>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.liquidity')}:</InfoLabel>
                    <InfoValue>
                        {ticketLiquidity ? formatCurrencyWithSign(USD_SIGN, ticketLiquidity, 0, true) : '-'}
                    </InfoValue>
                </InfoWrapper>
                {isLiveTicket && (
                    <>
                        <SettingsIconContainer>
                            <OutsideClickHandler
                                onOutsideClick={() => slippageDropdownOpen && setSlippageDropdownOpen(false)}
                            >
                                <SettingsWrapper onClick={() => setSlippageDropdownOpen(!slippageDropdownOpen)}>
                                    <SettingsLabel>{t('markets.parlay.slippage.slippage')}</SettingsLabel>
                                    <SettingsIcon className={`icon icon--settings`} />
                                </SettingsWrapper>
                                {slippageDropdownOpen && (
                                    <SlippageDropdownContainer>
                                        <Slippage
                                            fixed={SLIPPAGE_PERCENTAGES}
                                            defaultValue={liveBetSlippage}
                                            onChangeHandler={(slippage: number) =>
                                                dispatch(setLiveBetSlippage(slippage))
                                            }
                                        />
                                    </SlippageDropdownContainer>
                                )}
                            </OutsideClickHandler>
                        </SettingsIconContainer>
                    </>
                )}
            </InfoContainer>
            {isAA && (
                <GasSummary>
                    <SummaryLabel>
                        {t('markets.parlay.total-gas')}:
                        <Tooltip overlay={<> {t('markets.parlay.gas-tooltip')}</>} iconFontSize={14} marginLeft={3} />
                    </SummaryLabel>
                    <SummaryValue isCollateralInfo={true}>
                        {gas === 0 ? '-' : formatCurrencyWithSign(USD_SIGN, gas as number, 2, true)}
                    </SummaryValue>
                </GasSummary>
            )}
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.total-to-pay')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : isDefaultCollateral && !swapToThales
                        ? formatCurrencyWithSign(USD_SIGN, Number(buyInAmount) + gas)
                        : `${formatCurrencyWithKey(
                              usedCollateralForBuy,
                              (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) + gas
                          )} (${formatCurrencyWithSign(USD_SIGN, Number(buyInAmountInDefaultCollateral) + gas)})`}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : !collateralHasLp || (isDefaultCollateral && !swapToThales)
                        ? formatCurrencyWithSign(USD_SIGN, payout)
                        : `${formatCurrencyWithKey(usedCollateralForBuy, payout)} (${formatCurrencyWithSign(
                              USD_SIGN,
                              Number(buyInAmountInDefaultCollateral) / Number(totalQuote)
                          )})`}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.potential-profit')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : `${
                              collateralHasLp && (!isDefaultCollateral || swapToThales)
                                  ? formatCurrencyWithKey(
                                        usedCollateralForBuy,
                                        payout - (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) - gas
                                    )
                                  : formatCurrencyWithSign(
                                        USD_SIGN,
                                        payout - Number(buyInAmountInDefaultCollateral) - gas
                                    )
                          } (${formatPercentage(profitPercentage)})`}
                </SummaryValue>
            </RowSummary>

            <HorizontalLine />
            <RowSummary>
                <RowContainer>
                    <SummaryLabel>
                        {t('markets.parlay.persist-games')}
                        <Tooltip
                            overlay={<>{t(`markets.parlay.keep-selection-tooltip`)}</>}
                            iconFontSize={14}
                            marginLeft={3}
                        />
                        :
                    </SummaryLabel>
                    <CheckboxContainer>
                        <Checkbox
                            disabled={false}
                            checked={keepSelection}
                            value={keepSelection.toString()}
                            onChange={(e: any) => {
                                setKeepSelection(e.target.checked || false);
                                setKeepSelectionToStorage(e.target.checked || false);
                            }}
                        />
                    </CheckboxContainer>
                </RowContainer>
            </RowSummary>
            {!isBuying && oddsChanged && (
                <>
                    <FlexDivCentered>
                        <OddsChangedDiv>{t('markets.parlay.odds-changed-description')}</OddsChangedDiv>
                    </FlexDivCentered>
                    <FlexDivCentered>
                        <Button
                            onClick={() => acceptOddChanges(false)}
                            borderColor="transparent"
                            backgroundColor={theme.button.background.septenary}
                            {...defaultButtonProps}
                        >
                            {t('markets.parlay.accept-odds-changes')}
                        </Button>
                    </FlexDivCentered>
                </>
            )}
            {!oddsChanged && <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>}
            <ShareWrapper>
                <TwitterIcon disabled={twitterShareDisabled} onClick={onTwitterIconClick} />
            </ShareWrapper>
            {showShareTicketModal && shareTicketModalData && (
                <ShareTicketModalV2
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                    isTicketLost={shareTicketModalData.isTicketLost}
                    collateral={shareTicketModalData.collateral}
                    isLive={shareTicketModalData.isLive}
                    applyPayoutMultiplier={shareTicketModalData.applyPayoutMultiplier}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(buyInAmount) * (1 + APPROVAL_BUFFER)}
                    collateralIndex={selectedCollateralIndex}
                    tokenSymbol={isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
            {openBuyStepsModal && (
                <BuyStepsModal
                    step={buyStep}
                    isFailed={!isBuying}
                    currencyKey={selectedCollateral}
                    onSubmit={handleSubmit}
                    onClose={() => setOpenBuyStepsModal(false)}
                />
            )}
        </>
    );
};

const OddsChangedDiv = styled.div`
    color: ${(props) => props.theme.button.background.septenary};
    padding-top: 10px;
    font-size: 12px;
`;

const FreeBetIcon = styled.i`
    font-size: 15px;
    font-family: OvertimeIconsV2 !important;
    text-transform: none !important;
    margin-right: 3px;
    color: ${(props) => props.theme.textColor.quaternary} !important;
`;

const ToggleContainer = styled(FlexDiv)``;

export default Ticket;

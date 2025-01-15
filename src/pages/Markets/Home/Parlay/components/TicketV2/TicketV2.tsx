import axios from 'axios';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import OutsideClickHandler from 'components/OutsideClick';
import SelectInput from 'components/SelectInput';
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
    COINGECKO_SWAP_TO_OVER_QUOTE_SLIPPAGE,
    OVER_CONTRACT_RATE_KEY,
    SWAP_APPROVAL_BUFFER,
    SYSTEM_BET_MAX_ALLOWED_SYSTEM_COMBINATIONS,
    SYSTEM_BET_MINIMUM_DENOMINATOR,
    SYSTEM_BET_MINIMUM_MARKETS,
} from 'constants/markets';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { OddsType } from 'enums/markets';
import { BuyTicketStep } from 'enums/tickets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useInterval from 'hooks/useInterval';
import useLocalStorage from 'hooks/useLocalStorage';
import Slippage from 'pages/Markets/Home/Parlay/components/Slippage';
import CurrentLevelProgressLine from 'pages/Overdrop/components/CurrentLevelProgressLine';
import { OverdropIcon } from 'pages/Overdrop/components/styled-components';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import useLiveTradingProcessorDataQuery from 'queries/markets/useLiveTradingProcessorDataQuery';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useTicketLiquidityQuery from 'queries/markets/useTicketLiquidityQuery';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import useCoingeckoRatesQuery from 'queries/rates/useCoingeckoRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    getIsFreeBetDisabledByUser,
    getIsSystemBet,
    getLiveBetSlippage,
    getTicketPayment,
    removeAll,
    resetTicketError,
    setIsFreeBetDisabledByUser,
    setIsSystemBet,
    setLiveBetSlippage,
    setPaymentAmountToBuy,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy, getIsConnectedViaParticle, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { BoldContent, FlexDiv, FlexDivCentered } from 'styles/common';
import {
    Coins,
    DEFAULT_CURRENCY_DECIMALS,
    LONG_CURRENCY_DECIMALS,
    bigNumberFormatter,
    ceilNumberToDecimals,
    coinFormatter,
    coinParser,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatPercentage,
    getPrecision,
    roundNumberToDecimals,
} from 'thales-utils';
import { SportsAmmData, TicketMarket } from 'types/markets';
import { OverdropMultiplier, OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { OverdropLevel, ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import { executeBiconomyTransaction, getPaymasterData } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import {
    convertFromStableToCollateral,
    getCollateral,
    getCollateralAddress,
    getCollateralIndex,
    getCollaterals,
    getDefaultCollateral,
    getMaxCollateralDollarValue,
    isLpSupported,
    isOverCurrency,
    isStableCurrency,
    mapMultiCollateralBalances,
} from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import { getLiveTradingProcessorTransaction, getRequestId } from 'utils/liveTradingProcessor';
import { formatMarketOdds } from 'utils/markets';
import { getTradeData } from 'utils/marketsV2';
import { checkAllowance } from 'utils/network';
import {
    formatPoints,
    getCurrentLevelByPoints,
    getMultiplierIcon,
    getMultiplierLabel,
    getNextLevelItemByPoints,
    getParlayMultiplier,
    getTooltipKey,
} from 'utils/overdrop';
import { refetchBalances, refetchCoingeckoRates, refetchFreeBetBalance, refetchProofs } from 'utils/queryConnector';
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
import { getAddedPayoutOdds, getSystemBetData } from 'utils/tickets';
import { delay } from 'utils/timer';
import { getKeepSelectionFromStorage, setKeepSelectionToStorage } from 'utils/ui';
import { Address, Client, maxUint256, parseEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import BuyStepsModal from '../BuyStepsModal';
import SuggestedAmount from '../SuggestedAmount';
import {
    AmountToBuyContainer,
    Arrow,
    CheckboxContainer,
    ClearLabel,
    CurrentLevelProgressLineContainer,
    GasSummary,
    HorizontalLine,
    InfoContainer,
    InfoLabel,
    InfoValue,
    InfoWrapper,
    InputContainer,
    LeftLevel,
    OverdropLabel,
    OverdropProgressWrapper,
    OverdropRowSummary,
    OverdropSummary,
    OverdropValue,
    RightLevel,
    RowContainer,
    RowSummary,
    SelectContainer,
    SettingsIcon,
    SettingsIconContainer,
    SettingsLabel,
    SettingsWrapper,
    ShareWrapper,
    SlippageDropdownContainer,
    SummaryLabel,
    SummaryValue,
    SystemBetValidation,
    TwitterIcon,
    XButton,
    defaultButtonProps,
    systemDropdownStyle,
} from '../styled-components';

type TicketProps = {
    markets: TicketMarket[];
    setMarketsOutOfLiquidity: (indexes: number[]) => void;
    oddsChanged: boolean;
    acceptOddChanges: (changed: boolean) => void;
    onSuccess?: () => void;
    submitButtonDisabled?: boolean;
    setUseOverCollateral: (useThales: boolean) => void;
};

const TicketErrorMessage = {
    RISK_PER_COMB: 'RiskPerComb exceeded',
    SAME_TEAM_IN_PARLAY: 'SameTeamOnParlay',
    PROOF_IS_NOT_VALID: 'Proof is not valid',
};

const SLIPPAGE_PERCENTAGES = [0.5, 1, 2];

const Ticket: React.FC<TicketProps> = ({
    markets,
    setMarketsOutOfLiquidity,
    oddsChanged,
    acceptOddChanges,
    onSuccess,
    submitButtonDisabled,
    setUseOverCollateral: setUseOverCollateral,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isLiveTicket = useMemo(() => {
        return markets?.[0]?.live;
    }, [markets]);

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();

    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const selectedOddsType = useSelector(getOddsType);
    const ticketPayment = useSelector(getTicketPayment);
    const liveBetSlippage = useSelector(getLiveBetSlippage);
    const isFreeBetDisabledByUser = useSelector(getIsFreeBetDisabledByUser);
    const isSystemBet = useSelector(getIsSystemBet);
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
    const [tooltipTextBuyInAmount, setTooltipTextBuyInAmount] = useState<string>('');
    const [isFreeBetActive, setIsFreeBetActive] = useState<boolean>(false);
    const [isOverdropSummaryOpen, setIsOverdropSummaryOpen] = useState<boolean>(false);

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);
    const [keepSelection, setKeepSelection] = useState<boolean>(getKeepSelectionFromStorage() || false);

    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);
    const [checkFreeBetBalance, setCheckFreeBetBalance] = useState(false);

    const [gas, setGas] = useState(0);
    const [slippageDropdownOpen, setSlippageDropdownOpen] = useState(false);

    const [swapToOver, setSwapToOver] = useState(false);
    const [swappedOverToReceive, setSwappedOverToReceive] = useState(0);
    const [swapQuote, setSwapQuote] = useState(0);
    const [hasSwapAllowance, setHasSwapAllowance] = useState(false);
    const [buyStep, setBuyStep] = useState(BuyTicketStep.APPROVE_SWAP);
    const [openBuyStepsModal, setOpenBuyStepsModal] = useState(false);
    const [systemBetDenominator, setSystemBetDenominator] = useLocalStorage(
        LOCAL_STORAGE_KEYS.SYSTEM_BET_DENOMINATOR,
        SYSTEM_BET_MINIMUM_DENOMINATOR
    );

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, { enabled: isConnected });

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const usedCollateralForBuy = useMemo(
        () => (swapToOver ? (CRYPTO_CURRENCY_MAP.OVER as Coins) : selectedCollateral),
        [swapToOver, selectedCollateral]
    );
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const isOver = isOverCurrency(selectedCollateral);
    const collateralAddress = useMemo(
        () =>
            getCollateralAddress(
                networkId,
                isEth && !swapToOver
                    ? getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
                    : selectedCollateralIndex
            ),
        [networkId, selectedCollateralIndex, isEth, swapToOver]
    );
    const overCollateralAddress = multipleCollateral[CRYPTO_CURRENCY_MAP.OVER as Coins].addresses[networkId];
    const isStableCollateral = isStableCurrency(selectedCollateral);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;
    const collateralHasLp = isLpSupported(usedCollateralForBuy);

    const noProofs = useMemo(() => markets.every((market) => !market.proof), [markets]);

    // Used for cancelling the subscription and asynchronous tasks in a useEffect
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (markets[0]?.live) {
            dispatch(setIsSystemBet(false));
        }
    }, [dispatch, isSystemBet, markets]);

    useEffect(() => {
        if (markets.length <= systemBetDenominator) {
            setSystemBetDenominator(
                markets.length <= SYSTEM_BET_MINIMUM_DENOMINATOR ? SYSTEM_BET_MINIMUM_DENOMINATOR : markets.length - 1
            );
        }
    }, [markets.length, setSystemBetDenominator, systemBetDenominator]);

    const overdropMultipliers: OverdropMultiplier[] = useMemo(() => {
        const parlayMultiplier = {
            name: 'parlayMultiplier',
            label: 'Games in parlay',
            multiplier: getParlayMultiplier(isSystemBet ? systemBetDenominator : markets.length),
            icon: <>{markets.length}</>,
            tooltip: 'parlay-boost',
        };
        const thalesMultiplier = {
            name: 'thalesMultiplier',
            label: 'THALES used',
            multiplier: isOver || swapToOver ? 10 : 0,
            icon: <OverdropIcon className="icon icon--thales-logo" />,
            tooltip: 'thales-boost',
        };
        return [
            ...(userMultipliersQuery.isSuccess
                ? userMultipliersQuery.data.map((multiplier) => ({
                      ...multiplier,
                      label: getMultiplierLabel(multiplier),
                      icon: getMultiplierIcon(multiplier),
                      tooltip: getTooltipKey(multiplier),
                  }))
                : [
                      {
                          name: 'dailyMultiplier',
                          label: 'Days in a row',
                          multiplier: 0,
                          icon: <>0</>,
                          tooltip: 'daily-boost',
                      },
                      {
                          name: 'weeklyMultiplier',
                          label: 'Weeks in a row',
                          multiplier: 0,
                          icon: <>0</>,
                          tooltip: 'weekly-boost',
                      },
                      {
                          name: 'twitterMultiplier',
                          label: 'Twitter share',
                          multiplier: 0,
                          icon: <OverdropIcon className="icon icon--x-twitter" />,
                          tooltip: 'twitter-boost',
                      },
                  ]),
            parlayMultiplier,
            thalesMultiplier,
        ];
    }, [
        swapToOver,
        userMultipliersQuery.data,
        userMultipliersQuery.isSuccess,
        markets,
        isOver,
        isSystemBet,
        systemBetDenominator,
    ]);

    const ammContractsPaused = useAMMContractsPausedQuery({ networkId, client });

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

    const sportsAmmDataQuery = useSportsAmmDataQuery({ networkId, client });
    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const freeBetCollateralBalances =
        freeBetCollateralBalancesQuery?.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery.data
            : undefined;

    const freeBetBalanceExists = freeBetCollateralBalances
        ? !!Object.values(freeBetCollateralBalances).find((balance) => balance)
        : false;
    // Set free bet if user has free bet balance
    useEffect(() => {
        if (freeBetBalanceExists) {
            setIsFreeBetActive(true);
        }
    }, [freeBetBalanceExists]);

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

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates = exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const coingeckoRatesQuery = useCoingeckoRatesQuery();
    const coingeckoOverMinRecive = useMemo(() => {
        const coingeckoOverAmount =
            coingeckoRatesQuery.isSuccess && coingeckoRatesQuery.data[CRYPTO_CURRENCY_MAP.OVER as Coins]
                ? (Number(buyInAmount) * coingeckoRatesQuery.data[selectedCollateral]) /
                  coingeckoRatesQuery.data[CRYPTO_CURRENCY_MAP.OVER as Coins]
                : 0;
        return coingeckoOverAmount * (1 - COINGECKO_SWAP_TO_OVER_QUOTE_SLIPPAGE[networkId]);
    }, [coingeckoRatesQuery, selectedCollateral, buyInAmount, networkId]);

    const selectedCollateralCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[usedCollateralForBuy] : 1;
    const overContractCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[OVER_CONTRACT_RATE_KEY] : 1;

    const liveTradingProcessorDataQuery = useLiveTradingProcessorDataQuery({ networkId, client });

    const maxAllowedExecutionDelay = useMemo(
        () =>
            liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.maxAllowedExecutionDelay
                : 10,
        [liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: isConnected,
    });

    const userData: OverdropUserData | undefined = useMemo(() => {
        if (userDataQuery?.isSuccess && userDataQuery?.data) {
            return userDataQuery.data;
        }
        return;
    }, [userDataQuery.data, userDataQuery?.isSuccess]);

    const levelItem: OverdropLevel = useMemo(() => {
        if (userData) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            return levelItem;
        }
        return OVERDROP_LEVELS[0];
    }, [userData]);

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

    const isValidSystemBet = useMemo(() => isSystemBet && markets.length >= SYSTEM_BET_MINIMUM_MARKETS, [
        isSystemBet,
        markets.length,
    ]);

    const systemData = useMemo(
        () =>
            isValidSystemBet
                ? getSystemBetData(
                      markets,
                      systemBetDenominator,
                      usedCollateralForBuy,
                      sportsAmmData?.maxSupportedOdds || 1
                  )
                : { systemBetQuotePerCombination: 0, systemBetQuote: 0, systemBetMinimumQuote: 0 },
        [isValidSystemBet, markets, sportsAmmData?.maxSupportedOdds, systemBetDenominator, usedCollateralForBuy]
    );

    const totalQuote = useMemo(() => {
        let quote = 0;
        if (isSystemBet) {
            quote = systemData.systemBetQuote;
        } else {
            quote = markets.reduce(
                (partialQuote, market) =>
                    partialQuote * (market.odd > 0 ? getAddedPayoutOdds(usedCollateralForBuy, market.odd) : market.odd),
                1
            );
            const maxSupportedOdds = sportsAmmData?.maxSupportedOdds || 1;
            quote = quote < maxSupportedOdds ? maxSupportedOdds : quote;
        }
        return quote;
    }, [isSystemBet, markets, sportsAmmData?.maxSupportedOdds, systemData.systemBetQuote, usedCollateralForBuy]);

    const totalBonus = useMemo(() => {
        const bonus = {
            percentage: 0,
            value: 0,
        };
        if (isOver || swapToOver) {
            const { quote, basicQuote } = isSystemBet
                ? isValidSystemBet
                    ? {
                          quote: getSystemBetData(markets, systemBetDenominator, usedCollateralForBuy).systemBetQuote,
                          basicQuote: getSystemBetData(markets, systemBetDenominator, 'USDC' as Coins).systemBetQuote,
                      }
                    : {
                          quote: 0,
                          basicQuote: 0,
                      }
                : markets.reduce(
                      (partialQuote, market) => {
                          return {
                              quote:
                                  partialQuote.quote *
                                  (market.odd > 0
                                      ? getAddedPayoutOdds(CRYPTO_CURRENCY_MAP.OVER as Coins, market.odd)
                                      : market.odd),
                              basicQuote: partialQuote.basicQuote * market.odd,
                          };
                      },
                      {
                          quote: 1,
                          basicQuote: 1,
                      }
                  );
            const percentage = basicQuote / quote;
            bonus.percentage = percentage - 1;
            bonus.value = Number(payout) - Number(payout) / percentage;
        }
        return bonus;
    }, [
        isSystemBet,
        isOver,
        isValidSystemBet,
        markets,
        payout,
        swapToOver,
        systemBetDenominator,
        usedCollateralForBuy,
    ]);

    const numberOfSystemBetCombination = useMemo(() => {
        let combinationsCount = 1;
        for (let i = 0; i < systemBetDenominator; i++) {
            combinationsCount = (combinationsCount * (markets.length - i)) / (i + 1);
        }
        return combinationsCount;
    }, [markets.length, systemBetDenominator]);

    const isInvalidRegularTotalQuote = useMemo(() => !isSystemBet && totalQuote === sportsAmmData?.maxSupportedOdds, [
        isSystemBet,
        sportsAmmData?.maxSupportedOdds,
        totalQuote,
    ]);

    const isInvalidSystemTotalQuote = useMemo(
        () => isSystemBet && isValidSystemBet && totalQuote === sportsAmmData?.maxSupportedOdds,
        [isSystemBet, isValidSystemBet, sportsAmmData?.maxSupportedOdds, totalQuote]
    );

    const isInvalidNumberOfCombination = useMemo(
        () =>
            isSystemBet &&
            numberOfSystemBetCombination >
                (sportsAmmData?.maxAllowedSystemCombinations || SYSTEM_BET_MAX_ALLOWED_SYSTEM_COMBINATIONS),
        [isSystemBet, numberOfSystemBetCombination, sportsAmmData?.maxAllowedSystemCombinations]
    );

    const ticketLiquidityQuery = useTicketLiquidityQuery(
        markets,
        { networkId, client },
        {
            enabled: !noProofs,
        }
    );

    const ticketLiquidity: number | undefined = useMemo(() => {
        if (ticketLiquidityQuery.isSuccess && ticketLiquidityQuery.data !== undefined) {
            let liquidity = ticketLiquidityQuery.data;

            if (isOver || swapToOver) {
                liquidity = Math.floor((liquidity * selectedCollateralCurrencyRate) / overContractCurrencyRate);
            }

            if (isSystemBet) {
                liquidity = Math.floor((liquidity * markets.length) / systemBetDenominator);
            }

            return liquidity;
        }

        return undefined;
    }, [
        ticketLiquidityQuery.isSuccess,
        ticketLiquidityQuery.data,
        isOver,
        swapToOver,
        isSystemBet,
        selectedCollateralCurrencyRate,
        overContractCurrencyRate,
        systemBetDenominator,
        markets.length,
    ]);

    const overdropSummaryOpen = useMemo(() => isOverdropSummaryOpen && !isFreeBetActive, [
        isOverdropSummaryOpen,
        isFreeBetActive,
    ]);

    const gameMultipliersQuery = useGameMultipliersQuery();

    const overdropGameMultipliersInThisTicket = useMemo(() => {
        const gameMultipliers =
            gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];
        return gameMultipliers.filter((multiplier) => markets.find((market) => multiplier.gameId === market.gameId));
    }, [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess, markets]);

    const overdropTotalXP = useMemo(() => {
        if (!buyInAmountInDefaultCollateral) {
            return 0;
        }
        const basePoints = buyInAmountInDefaultCollateral * (2 - totalQuote);
        const totalMultiplier = [...overdropMultipliers, ...overdropGameMultipliersInThisTicket].reduce(
            (prev, curr) => prev + Number(curr.multiplier),
            0
        );
        return basePoints * (1 + totalMultiplier / 100);
    }, [buyInAmountInDefaultCollateral, totalQuote, overdropMultipliers, overdropGameMultipliersInThisTicket]);

    // Clear buyin and errors when network is changed
    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            dispatch(setPaymentAmountToBuy(''));
            dispatch(resetTicketError());
        } else {
            isMounted.current = true;
        }
    }, [dispatch, networkId]);

    const fetchTicketAmmQuote = useCallback(
        async (buyInAmountForQuote: number, fetchQuoteOnly: boolean) => {
            if (
                buyInAmountForQuote <= 0 ||
                noProofs ||
                (isSystemBet && (!isValidSystemBet || isInvalidNumberOfCombination))
            )
                return;

            const sportsAMMV2Contract = getContractInstance(ContractType.SPORTS_AMM_V2, {
                client,
                networkId,
            });
            const multiCollateralOnOffRampContract = getContractInstance(ContractType.MULTICOLLATERAL_ON_OFF_RAMP, {
                client,
                networkId,
            });

            if (sportsAMMV2Contract) {
                const tradeData = getTradeData(markets);

                try {
                    if (markets[0]?.live) {
                        const [minimumReceivedForBuyInAmount] = await Promise.all([
                            collateralHasLp
                                ? buyInAmountForQuote *
                                  (isDefaultCollateral && !swapToOver ? 1 : selectedCollateralCurrencyRate)
                                : multiCollateralOnOffRampContract?.read.getMinimumReceived([
                                      swapToOver ? overCollateralAddress : collateralAddress,
                                      coinParser(buyInAmountForQuote.toString(), networkId, usedCollateralForBuy),
                                  ]),
                        ]);

                        const minimumReceivedForBuyInAmountInDefaultCollateral: number = collateralHasLp
                            ? minimumReceivedForBuyInAmount
                            : coinFormatter(minimumReceivedForBuyInAmount, networkId);

                        !fetchQuoteOnly &&
                            setBuyInAmountInDefaultCollateral(minimumReceivedForBuyInAmountInDefaultCollateral);

                        return {
                            buyInAmountInDefaultCollateralNumber: minimumReceivedForBuyInAmountInDefaultCollateral,
                        };
                    } else {
                        const [parlayAmmQuote] = await Promise.all([
                            getSportsAMMV2QuoteMethod(
                                swapToOver ? overCollateralAddress : collateralAddress,
                                isDefaultCollateral && !swapToOver,
                                sportsAMMV2Contract,
                                tradeData,
                                coinParser(buyInAmountForQuote.toString(), networkId, usedCollateralForBuy),
                                isSystemBet,
                                systemBetDenominator
                            ),
                        ]);

                        !fetchQuoteOnly &&
                            setBuyInAmountInDefaultCollateral(
                                isOver || swapToOver
                                    ? (swapToOver ? swappedOverToReceive : Number(buyInAmount)) *
                                          selectedCollateralCurrencyRate
                                    : coinFormatter(parlayAmmQuote.buyInAmountInDefaultCollateral, networkId)
                            );

                        return {
                            ...parlayAmmQuote,
                            buyInAmountInDefaultCollateralNumber: coinFormatter(
                                parlayAmmQuote.buyInAmountInDefaultCollateral,
                                networkId
                            ),
                        };
                    }
                } catch (e: any) {
                    const errorMessage = e.error?.data?.message;
                    if (errorMessage) {
                        if (errorMessage.includes(TicketErrorMessage.RISK_PER_COMB)) {
                            return { error: TicketErrorMessage.RISK_PER_COMB };
                        } else if (errorMessage.includes(TicketErrorMessage.SAME_TEAM_IN_PARLAY)) {
                            return { error: TicketErrorMessage.SAME_TEAM_IN_PARLAY };
                        }
                    } else if (e && e.toString().includes(TicketErrorMessage.PROOF_IS_NOT_VALID)) {
                        const gameIds = markets.map((market) => market.gameId).join(',');
                        const typeIds = markets.map((market) => market.typeId).join(',');
                        const playerIds = markets.map((market) => market.playerProps.playerId).join(',');
                        const lines = markets.map((market) => market.line).join(',');
                        refetchProofs(networkId, gameIds, typeIds, playerIds, lines);
                    }
                    console.log(e);
                    return { error: e };
                }
            }
        },
        [
            client,
            networkId,
            noProofs,
            isSystemBet,
            isValidSystemBet,
            isInvalidNumberOfCombination,
            markets,
            collateralHasLp,
            isOver,
            swapToOver,
            isDefaultCollateral,
            selectedCollateralCurrencyRate,
            collateralAddress,
            usedCollateralForBuy,
            overCollateralAddress,
            systemBetDenominator,
            swappedOverToReceive,
            buyInAmount,
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
        if (isOver) {
            setSwapToOver(false);
            setUseOverCollateral(false);
            setSwappedOverToReceive(0);
            setSwapQuote(0);
        } else if (swapToOver && buyInAmount) {
            const getSwapQuote = async () => {
                const quote = await getQuote(networkId, swapToThalesParams);

                setSwappedOverToReceive(quote);
                setSwapQuote(quote / Number(buyInAmount));
            };

            getSwapQuote();
        } else {
            setSwappedOverToReceive(0);
            setSwapQuote(0);
        }
    }, [swapToOver, buyInAmount, networkId, swapToThalesParams, isOver, setUseOverCollateral]);

    // Refresh swap THALES quote on 7s
    useInterval(
        async () => {
            if (!openBuyStepsModal && !tooltipTextBuyInAmount) {
                const quote = await getQuote(networkId, swapToThalesParams);
                setSwappedOverToReceive(quote);
                setSwapQuote(quote / Number(buyInAmount));
            }
        },
        !isOver && swapToOver && buyInAmount ? secondsToMilliseconds(7) : null
    );

    // Reset buy step when collateral is changed
    useEffect(() => {
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
    }, [selectedCollateral]);

    // Check swap allowance
    useEffect(() => {
        if (isConnected && swapToOver && buyInAmount) {
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
        buyInAmount,
        networkId,
        selectedCollateral,
        swapToOver,
        swapToThalesParams.src,
        isBuying,
        isConnected,
    ]);

    // Check allowance
    useEffect(() => {
        const collateralToAllow = swapToOver
            ? (CRYPTO_CURRENCY_MAP.OVER as Coins)
            : isLiveTicket && isEth
            ? (CRYPTO_CURRENCY_MAP.WETH as Coins)
            : selectedCollateral;

        const getAllowance = async () => {
            try {
                const parsedTicketPrice = coinParser(
                    (swapToOver ? swappedOverToReceive : Number(buyInAmount)).toString(),
                    networkId,
                    collateralToAllow
                );

                const collateralIndex =
                    isDefaultCollateral && !swapToOver
                        ? getCollateralIndex(networkId, getDefaultCollateral(networkId))
                        : getCollateralIndex(networkId, collateralToAllow);

                const collateralContractWithSigner = getContractInstance(
                    ContractType.MULTICOLLATERAL,
                    { client, networkId },
                    collateralIndex
                );

                const allowance = await checkAllowance(
                    parsedTicketPrice,
                    collateralContractWithSigner,
                    walletAddress,
                    sportsAMMV2Contract.addresses[networkId]
                );
                if (!mountedRef.current) return null;
                setHasAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };
        if (isConnected && buyInAmount) {
            (isEth && !isLiveTicket && !swapToOver) || isFreeBetActive ? setHasAllowance(true) : getAllowance();
        }
    }, [
        walletAddress,
        isConnected,
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
        swapToOver,
        swappedOverToReceive,
        isBuying,
        client,
    ]);

    const isValidProfit: boolean = useMemo(() => {
        return (
            totalQuote > 0 &&
            sportsAmmData?.maxSupportedAmount !== undefined &&
            Number(buyInAmountInDefaultCollateral) / Number(totalQuote) - Number(buyInAmountInDefaultCollateral) >
                sportsAmmData?.maxSupportedAmount
        );
    }, [sportsAmmData?.maxSupportedAmount, buyInAmountInDefaultCollateral, totalQuote]);

    // set min buy in amount for selected collateral
    useEffect(() => {
        const rates = isOver || swapToOver ? overContractCurrencyRate : selectedCollateralCurrencyRate;
        const amount = sportsAmmData?.minBuyInAmount || 0;
        const minBuyin = convertFromStableToCollateral(usedCollateralForBuy, amount, rates, networkId);

        setMinBuyInAmount(minBuyin);
    }, [
        isOver,
        swapToOver,
        swappedOverToReceive,
        overContractCurrencyRate,
        selectedCollateralCurrencyRate,
        usedCollateralForBuy,
        sportsAmmData?.minBuyInAmount,
        networkId,
    ]);

    // Validations
    useEffect(() => {
        if (isBuying) return;

        if (
            (Number(buyInAmount) && finalQuotes.some((quote) => quote === 0)) ||
            (buyInAmountInDefaultCollateral && ticketLiquidity && buyInAmountInDefaultCollateral > ticketLiquidity)
        ) {
            setTooltipTextBuyInAmount(t('markets.parlay.validation.availability'));
        } else if (
            Number(buyInAmount) &&
            (swapToOver ? swapQuote && swappedOverToReceive < minBuyInAmount : Number(buyInAmount) < minBuyInAmount)
        ) {
            let minBuyin = minBuyInAmount / (swapToOver ? swapQuote : 1);
            minBuyin =
                swapToOver && isDefaultCollateral && minBuyin < minBuyInAmountInDefaultCollateral
                    ? minBuyInAmountInDefaultCollateral
                    : minBuyin;
            const decimals = getPrecision(minBuyin);

            setTooltipTextBuyInAmount(
                t('markets.parlay.validation.min-amount', {
                    min: `${formatCurrencyWithKey(selectedCollateral, minBuyin, decimals)}${
                        isDefaultCollateral
                            ? ''
                            : ` (${formatCurrencyWithSign(USD_SIGN, minBuyInAmountInDefaultCollateral)})`
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
        swapToOver,
        swappedOverToReceive,
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
        const amount = liquidityInCollateral > Number(value) ? Number(value) : Math.max(0, liquidityInCollateral);
        setCollateralAmount(floorNumberToDecimals(amount, decimals));
    };

    const handleAllowance = async (approveAmount: bigint) => {
        setIsAllowing(true);
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        try {
            const collateralIndex = getCollateralIndex(
                networkId,
                isDefaultCollateral
                    ? getDefaultCollateral(networkId)
                    : isEth
                    ? (CRYPTO_CURRENCY_MAP.WETH as Coins)
                    : selectedCollateral
            );

            const collateralContractWithSigner = getContractInstance(
                ContractType.MULTICOLLATERAL,
                {
                    client: walletClient.data,
                    networkId,
                },
                collateralIndex
            );

            const addressToApprove = sportsAMMV2Contract.addresses[networkId];
            let txHash;
            if (isBiconomy) {
                txHash = await executeBiconomyTransaction(
                    networkId,
                    collateralContractWithSigner?.address ?? '',
                    collateralContractWithSigner,
                    'approve',
                    [addressToApprove, approveAmount]
                );
            } else {
                txHash = await collateralContractWithSigner?.write.approve([addressToApprove, approveAmount]);
                setOpenApprovalModal(false);
            }

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash: txHash,
            });

            if (txReceipt.status === 'success') {
                setIsAllowing(false);
                toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
            }
        } catch (e) {
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            console.log(e);
            setIsAllowing(false);
        }
    };

    const handleBuyWithThalesSteps = async (
        initialStep: BuyTicketStep
    ): Promise<{ step: BuyTicketStep; overAmount: number }> => {
        let step = initialStep;
        let overAmount = swappedOverToReceive;

        // Validation for min buy-in while modal is open
        if (swappedOverToReceive && swappedOverToReceive < minBuyInAmount) {
            setOpenBuyStepsModal(false);
            return { step, overAmount };
        }

        if (step <= BuyTicketStep.SWAP) {
            if (!isEth && !hasSwapAllowance) {
                if (step !== BuyTicketStep.APPROVE_SWAP) {
                    step = BuyTicketStep.APPROVE_SWAP;
                    setBuyStep(BuyTicketStep.APPROVE_SWAP);
                }

                const approveAmount = coinParser(
                    (Number(buyInAmount) * (1 + SWAP_APPROVAL_BUFFER)).toString(),
                    networkId,
                    selectedCollateral
                );
                const approveSwapRawTransaction = await buildTxForApproveTradeWithRouter(
                    networkId,
                    walletAddress as Address,
                    swapToThalesParams.src,
                    walletClient.data,
                    approveAmount.toString()
                );

                try {
                    const approveTxHash = await sendTransaction(approveSwapRawTransaction);

                    if (approveTxHash) {
                        await delay(3000); // wait for 1inch API to read correct approval
                        step = BuyTicketStep.SWAP;
                        setBuyStep(step);
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
                const swapRawTransaction = (await buildTxForSwap(networkId, swapToThalesParams)).tx;

                // check allowance again
                if (!swapRawTransaction) {
                    await delay(1800);
                    const hasRefreshedAllowance = await checkSwapAllowance(
                        networkId,
                        walletAddress as Address,
                        swapToThalesParams.src,
                        coinParser(buyInAmount.toString(), networkId, selectedCollateral)
                    );
                    if (!hasRefreshedAllowance) {
                        step = BuyTicketStep.APPROVE_SWAP;
                        setBuyStep(step);
                    }
                }

                const balanceBefore = multipleCollateralBalances?.data
                    ? multipleCollateralBalances.data[CRYPTO_CURRENCY_MAP.OVER as Coins]
                    : 0;
                const swapTxHash = swapRawTransaction ? await sendTransaction(swapRawTransaction) : undefined;

                if (swapTxHash) {
                    step = BuyTicketStep.APPROVE_BUY;
                    setBuyStep(step);

                    await delay(3000); // wait for OVER balance to increase

                    const collateralContractWithSigner = getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        { client: walletClient.data, networkId },
                        getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.OVER as Coins)
                    );

                    const balanceAfter = bigNumberFormatter(
                        await collateralContractWithSigner?.read.balanceOf([walletAddress])
                    );
                    overAmount = balanceAfter - balanceBefore;
                    setSwappedOverToReceive(overAmount);
                }
            } catch (e) {
                console.log('Swap tx failed', e);
            }
        }

        if (step >= BuyTicketStep.APPROVE_BUY) {
            if (!hasAllowance) {
                step = BuyTicketStep.APPROVE_BUY;
                setBuyStep(step);

                try {
                    const collateralContractWithSigner = getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        { client: walletClient.data, networkId },
                        getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.OVER as Coins)
                    );

                    const sportsAMMV2ContractWithSigner = getContractInstance(ContractType.SPORTS_AMM_V2, {
                        client: walletClient.data,
                        networkId,
                    }) as ViemContract;

                    const addressToApprove = sportsAMMV2ContractWithSigner.address;
                    const approveAmount = maxUint256;

                    let txHash;
                    if (isBiconomy) {
                        txHash = await executeBiconomyTransaction(
                            networkId,
                            collateralContractWithSigner?.address ?? '',
                            collateralContractWithSigner,
                            'approve',
                            [addressToApprove, approveAmount]
                        );
                    } else {
                        txHash = await collateralContractWithSigner?.write.approve([addressToApprove, approveAmount]);
                    }

                    const txReceipt = await waitForTransactionReceipt(client as Client, {
                        hash: txHash,
                    });

                    if (txReceipt.status === 'success') {
                        step = BuyTicketStep.BUY;
                        setBuyStep(step);
                    }
                } catch (e) {
                    console.log('Approve buy failed', e);
                }
            } else {
                step = BuyTicketStep.BUY;
                setBuyStep(step);
            }
        }

        return { step, overAmount: overAmount };
    };

    const handleSubmit = async () => {
        const networkConfig = {
            client: walletClient.data,
            networkId,
        };

        const sportsAMMV2Contract = getContractInstance(ContractType.SPORTS_AMM_V2, networkConfig);
        const liveTradingProcessorContract = getContractInstance(ContractType.LIVE_TRADING_PROCESSOR, networkConfig);
        const sportsAMMDataContract = getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig);
        const sportsAMMV2ManagerContract = getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, networkConfig);
        const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);

        // TODO: separate logic for regular and live markets
        if ((sportsAMMV2Contract && !markets[0].live) || (liveTradingProcessorContract && markets[0].live)) {
            setIsBuying(true);
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));

            let step = buyStep;
            let overAmount = swappedOverToReceive;
            if (swapToOver) {
                await refetchCoingeckoRates();
                if (
                    step <= BuyTicketStep.SWAP &&
                    swappedOverToReceive &&
                    swappedOverToReceive < coingeckoOverMinRecive
                ) {
                    await delay(800);
                    toast.update(
                        toastId,
                        getErrorToastOptions(
                            t('common.errors.swap-quote-low', {
                                quote: formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.OVER, swappedOverToReceive),
                                minQuote: formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.OVER, coingeckoOverMinRecive),
                            })
                        )
                    );
                    setIsBuying(false);
                    return;
                }

                setOpenBuyStepsModal(true);
                ({ step, overAmount } = await handleBuyWithThalesSteps(step));

                if (step !== BuyTicketStep.BUY) {
                    toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                    setIsBuying(false);
                    return;
                }
            }

            const sportsAMMV2OrLiveContract = markets[0].live ? liveTradingProcessorContract : sportsAMMV2Contract;

            try {
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;

                const tradeData = getTradeData(markets);
                const parsedBuyInAmount = coinParser(
                    (swapToOver ? overAmount : buyInAmount).toString(),
                    networkId,
                    usedCollateralForBuy
                );
                const parsedTotalQuote = parseEther(floorNumberToDecimals(totalQuote, 18).toString());
                const additionalSlippage = parseEther(tradeData[0].live ? liveBetSlippage / 100 + '' : '0.02');

                let tx;
                if (tradeData[0].live) {
                    const liveTradeDataOdds = tradeData[0].odds;
                    const liveTradeDataPosition = tradeData[0].position;
                    const liveTotalQuote = liveTradeDataOdds[liveTradeDataPosition];

                    if (isEth && !swapToOver) {
                        const WETHContractWithSigner = getContractInstance(
                            ContractType.MULTICOLLATERAL,
                            { client: walletClient.data, networkId },
                            getCollateralIndex(networkId, 'WETH')
                        );

                        if (WETHContractWithSigner) {
                            const wrapTx = await WETHContractWithSigner.write.deposit({ value: parsedBuyInAmount });

                            const txReceipt = await waitForTransactionReceipt(client as Client, {
                                hash: wrapTx,
                            });

                            if (txReceipt.status === 'success') {
                                tx = await getLiveTradingProcessorTransaction(
                                    collateralAddress,
                                    sportsAMMV2OrLiveContract,
                                    tradeData,
                                    parsedBuyInAmount,
                                    liveTotalQuote,
                                    referralId,
                                    additionalSlippage,
                                    isBiconomy,
                                    false,
                                    undefined
                                );
                            }
                        }
                    } else {
                        tx = await getLiveTradingProcessorTransaction(
                            swapToOver ? overCollateralAddress : collateralAddress,
                            sportsAMMV2OrLiveContract,
                            tradeData,
                            parsedBuyInAmount,
                            liveTotalQuote,
                            referralId,
                            additionalSlippage,
                            isBiconomy,
                            isFreeBetActive,
                            freeBetHolderContract
                        );
                    }
                } else {
                    tx = await getSportsAMMV2Transaction(
                        swapToOver ? overCollateralAddress : collateralAddress,
                        isDefaultCollateral && !swapToOver,
                        isEth && !swapToOver,
                        networkId,
                        sportsAMMV2OrLiveContract,
                        freeBetHolderContract,
                        tradeData,
                        parsedBuyInAmount,
                        parsedTotalQuote,
                        referralId,
                        additionalSlippage,
                        isBiconomy,
                        isFreeBetActive,
                        walletClient.data,
                        isSystemBet,
                        systemBetDenominator
                    );
                }

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: tx,
                });

                if (txReceipt.status === 'success') {
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
                                !collateralHasLp || (isDefaultCollateral && !swapToOver)
                                    ? Number(buyInAmountInDefaultCollateral)
                                    : swapToOver
                                    ? swappedOverToReceive
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
                            isTicketOpen: true,
                            systemBetData: isSystemBet
                                ? {
                                      systemBetDenominator,
                                      numberOfCombination: numberOfSystemBetCombination,
                                      buyInPerCombination: Number(buyInAmount) / numberOfSystemBetCombination,
                                      minPayout:
                                          Number(buyInAmount) /
                                          numberOfSystemBetCombination /
                                          systemData.systemBetMinimumQuote,
                                      maxPayout: payout,
                                      numberOfWinningCombinations: 0,
                                  }
                                : undefined,
                        };
                        setShareTicketModalData(modalData);
                        setShowShareTicketModal(true);

                        setBuyStep(BuyTicketStep.COMPLETED);
                        setOpenBuyStepsModal(false);

                        toast.update(toastId, getSuccessToastOptions(t('market.toast-message.buy-success')));
                        setIsBuying(false);
                        setCollateralAmount('');
                    } else if (sportsAMMV2OrLiveContract) {
                        let counter = 0;
                        let adapterAllowed = false;

                        const requestId = getRequestId(txReceipt.logs, isFreeBetActive);
                        if (!requestId) {
                            throw new Error('Request ID not found');
                        }

                        const startTime = Date.now();
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

                            const isFulfilled = await sportsAMMV2OrLiveContract.read.requestIdToFulfillAllowed([
                                requestId,
                            ]);
                            if (!isFulfilled) {
                                if (Date.now() - startTime >= secondsToMilliseconds(maxAllowedExecutionDelay + 10)) {
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
                                refetchBalances(walletAddress, networkId);
                                if (sportsAMMDataContract && sportsAMMV2ManagerContract && freeBetHolderContract) {
                                    const numOfActiveTicketsPerUser = isFreeBetActive
                                        ? await freeBetHolderContract.read.numOfActiveTicketsPerUser([walletAddress])
                                        : await sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([
                                              walletAddress,
                                          ]);
                                    const userTickets = await sportsAMMDataContract.read.getActiveTicketsDataPerUser([
                                        walletAddress,
                                        Number(numOfActiveTicketsPerUser) - 1,
                                        BATCH_SIZE,
                                    ]);
                                    const lastTicket = isFreeBetActive
                                        ? userTickets.freeBetsData[userTickets.freeBetsData.length - 1]
                                        : userTickets.ticketsData[userTickets.ticketsData.length - 1];
                                    const lastTicketPaid =
                                        !collateralHasLp || (isDefaultCollateral && !swapToOver)
                                            ? coinFormatter(lastTicket.buyInAmount, networkId)
                                            : swapToOver
                                            ? swappedOverToReceive
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
                                        isTicketOpen: true,
                                        systemBetData: undefined,
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
            (swapToOver ? swappedOverToReceive : Number(buyInAmount)) < minBuyInAmount ||
            isBuying ||
            isAllowing
        ) {
            setSubmitDisabled(true);
            return;
        }

        // Enable Approve if it hasn't allowance
        if (!hasAllowance && !swapToOver) {
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

        if (isSystemBet && !isValidSystemBet) {
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
        swappedOverToReceive,
        swapToOver,
        isSystemBet,
        isInvalidSystemTotalQuote,
        isValidSystemBet,
    ]);

    const getSubmitButton = () => {
        if (isAMMPaused) {
            return (
                <Button disabled={submitDisabled} {...defaultButtonProps}>
                    {t('markets.parlay.validation.amm-contract-paused')}
                </Button>
            );
        }

        if (!isConnected) {
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
                    {t('get-started.log-in')}
                </Button>
            );
        }

        // Show Approve only on valid input buy amount
        if (!swapToOver && !hasAllowance && buyInAmount && Number(buyInAmount) >= minBuyInAmount) {
            if (isLiveTicket && isEth) {
                return (
                    <Tooltip overlay={t('common.wrap-eth-tooltip')}>
                        <Button
                            disabled={submitDisabled}
                            onClick={() => (isParticle ? handleAllowance(maxUint256) : setOpenApprovalModal(true))}
                            {...defaultButtonProps}
                        >
                            {t('common.wallet.approve')}
                        </Button>
                    </Tooltip>
                );
            }
            return (
                <Button
                    disabled={submitDisabled}
                    onClick={() => (isParticle ? handleAllowance(maxUint256) : setOpenApprovalModal(true))}
                    {...defaultButtonProps}
                >
                    {t('common.wallet.approve')}
                </Button>
            );
        }

        if (!swapToOver && isLiveTicket && isEth) {
            return (
                <>
                    <Tooltip overlay={t('common.wrap-eth-tooltip')}>
                        <Button disabled={submitDisabled} onClick={async () => handleSubmit()} {...defaultButtonProps}>
                            {t(`common.wrap-and-buy`)}
                        </Button>
                    </Tooltip>
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

            if (minBuyInAmount > 0) {
                if (!isDefaultCollateral && !isOver && !swapToOver) {
                    const parlayAmmQuoteForMin = await fetchTicketAmmQuote(minBuyInAmount, true);

                    if (!mountedRef.current || !isSubscribed || !parlayAmmQuoteForMin) return null;

                    if (!parlayAmmQuoteForMin.error) {
                        setMinBuyInAmountInDefaultCollateral(parlayAmmQuoteForMin.buyInAmountInDefaultCollateralNumber);
                    }
                } else {
                    setMinBuyInAmountInDefaultCollateral(
                        isDefaultCollateral
                            ? sportsAmmData?.minBuyInAmount || 0
                            : (swapToOver ? swappedOverToReceive : minBuyInAmount) * selectedCollateralCurrencyRate
                    );
                }
            }

            if (Number(buyInAmount) > 0 && minBuyInAmountInDefaultCollateral) {
                const parlayAmmQuote = await fetchTicketAmmQuote(
                    swapToOver ? swappedOverToReceive : Number(buyInAmount),
                    false
                );

                if (!mountedRef.current || !isSubscribed || !parlayAmmQuote) return null;

                if (!parlayAmmQuote.error) {
                    if (markets[0]?.live) {
                        setPayout(
                            (1 / totalQuote) *
                                Number(
                                    collateralHasLp
                                        ? swapToOver
                                            ? swappedOverToReceive
                                            : buyInAmount
                                        : parlayAmmQuote.buyInAmountInDefaultCollateralNumber
                                )
                        );
                    } else {
                        const payout = coinFormatter(
                            parlayAmmQuote[1],
                            networkId,
                            collateralHasLp
                                ? swapToOver
                                    ? (CRYPTO_CURRENCY_MAP.OVER as Coins)
                                    : selectedCollateral
                                : undefined
                        );
                        setPayout(payout);
                        const amountsToBuy: number[] = (parlayAmmQuote.amountsToBuy || []).map((quote: bigint) =>
                            coinFormatter(
                                quote,
                                networkId,
                                collateralHasLp
                                    ? swapToOver
                                        ? (CRYPTO_CURRENCY_MAP.OVER as Coins)
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
        isDefaultCollateral,
        isOver,
        selectedCollateralCurrencyRate,
        overContractCurrencyRate,
        sportsAmmData?.minBuyInAmount,
        minBuyInAmount,
        minBuyInAmountInDefaultCollateral,
        setMarketsOutOfLiquidity,
        markets,
        networkId,
        buyInAmountInDefaultCollateral,
        collateralHasLp,
        selectedCollateral,
        totalQuote,
        swappedOverToReceive,
        swapToOver,
    ]);

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const getQuoteTooltipText = () => {
        return selectedOddsType === OddsType.AMM
            ? isSystemBet
                ? t('markets.parlay.info.system-bet-min-quote', {
                      value: formatMarketOdds(
                          selectedOddsType,
                          (sportsAmmData?.maxSupportedOdds || 0) / numberOfSystemBetCombination
                      ),
                  })
                : t('markets.parlay.info.min-quote', {
                      value: formatMarketOdds(selectedOddsType, sportsAmmData?.maxSupportedOdds),
                  })
            : isSystemBet
            ? t('markets.parlay.info.system-bet-max-quote', {
                  value: formatMarketOdds(
                      selectedOddsType,
                      (sportsAmmData?.maxSupportedOdds || 0) / numberOfSystemBetCombination
                  ),
              })
            : t('markets.parlay.info.max-quote', {
                  value: formatMarketOdds(selectedOddsType, sportsAmmData?.maxSupportedOdds),
              });
    };

    const hidePayout =
        Number(buyInAmount) <= 0 ||
        (swapToOver ? swappedOverToReceive : Number(buyInAmount)) < minBuyInAmount ||
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
                !collateralHasLp || (isDefaultCollateral && !swapToOver)
                    ? Number(buyInAmountInDefaultCollateral)
                    : swapToOver
                    ? swappedOverToReceive
                    : Number(buyInAmount),
            payout: payout,
            onClose: onModalClose,
            isTicketLost: false,
            collateral: collateralHasLp ? selectedCollateral : defaultCollateral,
            isLive: !!markets[0].live,
            applyPayoutMultiplier: true,
            isTicketOpen: true,
            systemBetData: isSystemBet
                ? {
                      systemBetDenominator,
                      numberOfCombination: numberOfSystemBetCombination,
                      buyInPerCombination: Number(buyInAmount) / numberOfSystemBetCombination,
                      minPayout: Number(buyInAmount) / numberOfSystemBetCombination / systemData.systemBetMinimumQuote,
                      maxPayout: payout,
                      numberOfWinningCombinations: 0,
                  }
                : undefined,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(!twitterShareDisabled);
    };

    useEffect(() => {
        const setGasFee = async () => {
            const networkConfig = {
                client: walletClient.data,
                networkId,
            };

            const sportsAMMV2ContractWithSigner = getContractInstance(ContractType.SPORTS_AMM_V2, networkConfig);
            const defaultCollateralContractWithSigner = getContractInstance(
                ContractType.MULTICOLLATERAL,
                networkConfig,
                getCollateralIndex(networkId, getDefaultCollateral(networkId))
            );
            const multipleCollateralWithSigner = getContractInstance(
                ContractType.MULTICOLLATERAL,
                networkConfig,
                getCollateralIndex(networkId, selectedCollateral)
            );

            if (!sportsAMMV2ContractWithSigner || !defaultCollateralContractWithSigner || !multipleCollateralWithSigner)
                return;

            const referralId =
                walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                    ? getReferralId()
                    : null;

            const tradeData = getTradeData(markets);
            const parsedTotalQuote = parseEther(totalQuote.toString());
            const additionalSlippage = parseEther('0.02');

            // TODO: check swap to THALES
            if (!hasAllowance) {
                const collateralContractWithSigner = isDefaultCollateral
                    ? defaultCollateralContractWithSigner
                    : multipleCollateralWithSigner;

                const addressToApprove = sportsAMMV2ContractWithSigner.address;

                const gasFees = await getPaymasterData(
                    collateralContractWithSigner?.address ?? '',
                    collateralContractWithSigner,
                    'approve',
                    [addressToApprove, maxUint256]
                );

                if (gasFees) {
                    setGas(gasFees?.maxGasFeeUSD as number);
                }
            } else {
                const gasFees = await getPaymasterData(collateralAddress, sportsAMMV2ContractWithSigner, 'trade', [
                    tradeData,
                    buyInAmount,
                    parsedTotalQuote,
                    additionalSlippage,
                    referralId,
                    collateralAddress,
                    isEth,
                ]);

                if (gasFees) {
                    setGas(gasFees?.maxGasFeeUSD as number);
                }
            }
        };
        if (isBiconomy) setGasFee();
    }, [
        collateralAddress,
        markets,
        buyInAmountInDefaultCollateral,
        networkId,
        payout,
        isDefaultCollateral,
        isBiconomy,
        hasAllowance,
        selectedCollateral,
        isEth,
        walletAddress,
        totalQuote,
        buyInAmount,
        client,
        walletClient.data,
    ]);

    const overdropTotalBoost = useMemo(
        () =>
            [...overdropMultipliers, ...overdropGameMultipliersInThisTicket].reduce(
                (prev, curr) => prev + Number(curr.multiplier),
                0
            ),
        [overdropGameMultipliersInThisTicket, overdropMultipliers]
    );

    const overdropBoostedGamesTotalBoost = useMemo(
        () => overdropGameMultipliersInThisTicket.reduce((prev, curr) => prev + Number(curr.multiplier), 0),
        [overdropGameMultipliersInThisTicket]
    );

    const systemOptions = useMemo(() => {
        const systemOptions: Array<{ value: number; label: string }> = [];
        for (let index = 2; index < markets.length; index++) {
            systemOptions.push({
                value: index,
                label: `${index}/${markets.length}`,
            });
        }
        return systemOptions;
    }, [markets.length]);

    return (
        <>
            {isSystemBet && (
                <>
                    {isValidSystemBet ? (
                        <>
                            <RowContainer>
                                <SummaryLabel>{t('markets.parlay.system')}:</SummaryLabel>
                                <SelectContainer>
                                    <SelectInput
                                        options={systemOptions}
                                        handleChange={(value: any) => setSystemBetDenominator(Number(value))}
                                        defaultValue={systemBetDenominator - 2}
                                        width={90}
                                        style={systemDropdownStyle}
                                    />
                                </SelectContainer>
                            </RowContainer>
                            <RowSummary>
                                <Tooltip
                                    open={inputRefVisible && isInvalidNumberOfCombination}
                                    overlay={t('markets.parlay.info.system-bet-number-of-combination', {
                                        value:
                                            sportsAmmData?.maxAllowedSystemCombinations ||
                                            SYSTEM_BET_MAX_ALLOWED_SYSTEM_COMBINATIONS,
                                    })}
                                    isValidation
                                >
                                    <SummaryLabel>{t('markets.parlay.number-of-combinations')}:</SummaryLabel>
                                </Tooltip>
                                <SummaryValue
                                    isCollateralInfo={true}
                                    fontSize={14}
                                    isError={isInvalidNumberOfCombination}
                                >
                                    {numberOfSystemBetCombination}
                                </SummaryValue>
                            </RowSummary>{' '}
                        </>
                    ) : (
                        <RowContainer>
                            <SystemBetValidation>
                                {t('markets.parlay.system-bet-min-markets-validation', {
                                    minMarkets: SYSTEM_BET_MINIMUM_MARKETS,
                                })}
                            </SystemBetValidation>
                        </RowContainer>
                    )}
                    {isSystemBet && <HorizontalLine />}
                </>
            )}
            <RowSummary columnDirection={true}>
                {isSystemBet && (
                    <RowContainer>
                        <SummaryLabel>{t('markets.parlay.min-quote')}:</SummaryLabel>
                        <SummaryValue fontSize={12}>
                            {formatMarketOdds(selectedOddsType, systemData.systemBetMinimumQuote)}
                        </SummaryValue>
                        <ClearLabel alignRight={true} onClick={() => dispatch(removeAll())}>
                            {t('markets.parlay.clear')}
                            <XButton margin={'0 0 4px 5px'} className={`icon icon--clear`} />
                        </ClearLabel>
                    </RowContainer>
                )}
                <RowContainer>
                    <SummaryLabel>
                        {isSystemBet ? t('markets.parlay.max-quote') : t('markets.parlay.total-quote')}:
                    </SummaryLabel>
                    <Tooltip
                        open={inputRefVisible && (isInvalidRegularTotalQuote || isInvalidSystemTotalQuote)}
                        overlay={getQuoteTooltipText()}
                        isWarning
                    >
                        <SummaryValue fontSize={12}>
                            {formatMarketOdds(
                                selectedOddsType,
                                isSystemBet ? systemData.systemBetQuotePerCombination : totalQuote
                            )}
                        </SummaryValue>
                    </Tooltip>
                    {!isSystemBet && (
                        <ClearLabel alignRight={true} onClick={() => dispatch(removeAll())}>
                            {t('markets.parlay.clear')}
                            <XButton margin={'0 0 4px 5px'} className={`icon icon--clear`} />
                        </ClearLabel>
                    )}
                </RowContainer>
                {(isOver || swapToOver) && (
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
                minAmount={
                    swapToOver && swapQuote
                        ? ceilNumberToDecimals(minBuyInAmount / swapQuote, getPrecision(minBuyInAmount / swapQuote))
                        : undefined
                }
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
            {!isOver && !isFreeBetActive && (
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
                            active={swapToOver}
                            width="44px"
                            height="20px"
                            background={swapToOver ? theme.borderColor.tertiary : undefined}
                            borderColor={swapToOver ? theme.borderColor.tertiary : theme.borderColor.senary}
                            borderWidth={swapToOver ? '0px' : undefined}
                            dotSize="14px"
                            dotBackground={theme.background.senary}
                            dotMargin="3px"
                            handleClick={() => {
                                setSwapToOver(!swapToOver);
                                setUseOverCollateral(!swapToOver);
                            }}
                        />
                    </ToggleContainer>
                </RowSummary>
            )}
            <InfoContainer hasMarginTop={!isOver && !isFreeBetActive && isLiveTicket}>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.liquidity')}:</InfoLabel>
                    <InfoValue>
                        {ticketLiquidity ? formatCurrencyWithSign(USD_SIGN, ticketLiquidity, 0, true) : '-'}
                    </InfoValue>
                </InfoWrapper>
                {isLiveTicket && (
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
                                        onChangeHandler={(slippage: number) => dispatch(setLiveBetSlippage(slippage))}
                                    />
                                </SlippageDropdownContainer>
                            )}
                        </OutsideClickHandler>
                    </SettingsIconContainer>
                )}
            </InfoContainer>
            {isBiconomy && (
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
                        : isDefaultCollateral && !swapToOver
                        ? formatCurrencyWithSign(USD_SIGN, Number(buyInAmount) + gas)
                        : `${formatCurrencyWithKey(
                              usedCollateralForBuy,
                              (swapToOver ? swappedOverToReceive : Number(buyInAmount)) + gas
                          )} (${formatCurrencyWithSign(USD_SIGN, Number(buyInAmountInDefaultCollateral) + gas)})`}
                </SummaryValue>
            </RowSummary>
            {isSystemBet ? (
                <>
                    <RowSummary>
                        <SummaryLabel>{t('markets.parlay.buy-in-per-combination')}:</SummaryLabel>
                        <SummaryValue isInfo={true}>
                            {hidePayout
                                ? '-'
                                : isDefaultCollateral && !swapToOver
                                ? formatCurrencyWithSign(
                                      USD_SIGN,
                                      (Number(buyInAmount) + gas) / numberOfSystemBetCombination
                                  )
                                : `${formatCurrencyWithKey(
                                      usedCollateralForBuy,
                                      ((swapToOver ? swappedOverToReceive : Number(buyInAmount)) + gas) /
                                          numberOfSystemBetCombination
                                  )} (${formatCurrencyWithSign(
                                      USD_SIGN,
                                      (Number(buyInAmountInDefaultCollateral) + gas) / numberOfSystemBetCombination
                                  )})`}
                        </SummaryValue>
                    </RowSummary>
                    <RowSummary>
                        <SummaryLabel>{t('markets.parlay.min-payout')}:</SummaryLabel>
                        <SummaryValue isInfo={true}>
                            {hidePayout
                                ? '-'
                                : !collateralHasLp || (isDefaultCollateral && !swapToOver)
                                ? formatCurrencyWithSign(
                                      USD_SIGN,
                                      Number(buyInAmount) /
                                          numberOfSystemBetCombination /
                                          systemData.systemBetMinimumQuote
                                  )
                                : `${formatCurrencyWithKey(
                                      usedCollateralForBuy,
                                      Number(buyInAmount) /
                                          numberOfSystemBetCombination /
                                          systemData.systemBetMinimumQuote
                                  )} (${formatCurrencyWithSign(
                                      USD_SIGN,
                                      Number(buyInAmountInDefaultCollateral) /
                                          numberOfSystemBetCombination /
                                          systemData.systemBetMinimumQuote
                                  )})`}
                        </SummaryValue>
                    </RowSummary>
                    <RowSummary>
                        <SummaryLabel>{t('markets.parlay.max-payout')}:</SummaryLabel>
                        <SummaryValue isInfo={true}>
                            {hidePayout
                                ? '-'
                                : !collateralHasLp || (isDefaultCollateral && !swapToOver)
                                ? formatCurrencyWithSign(USD_SIGN, payout)
                                : `${formatCurrencyWithKey(usedCollateralForBuy, payout)} (${formatCurrencyWithSign(
                                      USD_SIGN,
                                      Number(buyInAmountInDefaultCollateral) / Number(totalQuote)
                                  )})`}
                        </SummaryValue>
                    </RowSummary>
                </>
            ) : (
                <>
                    <RowSummary>
                        <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                        <SummaryValue isInfo={true}>
                            {hidePayout
                                ? '-'
                                : !collateralHasLp || (isDefaultCollateral && !swapToOver)
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
                                      collateralHasLp && (!isDefaultCollateral || swapToOver)
                                          ? formatCurrencyWithKey(
                                                usedCollateralForBuy,
                                                payout - (swapToOver ? swappedOverToReceive : Number(buyInAmount)) - gas
                                            )
                                          : formatCurrencyWithSign(
                                                USD_SIGN,
                                                payout - Number(buyInAmountInDefaultCollateral) - gas
                                            )
                                  } (${formatPercentage(profitPercentage)})`}
                        </SummaryValue>
                    </RowSummary>
                </>
            )}
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
            <OverdropRowSummary margin={overdropSummaryOpen ? '5px 0' : '5px 0 0 0'}>
                <OverdropRowSummary
                    isClickable={!isFreeBetActive}
                    onClick={() => {
                        if (!isFreeBetActive) {
                            setIsOverdropSummaryOpen(!isOverdropSummaryOpen);
                        }
                    }}
                >
                    <OverdropLabel>{t('markets.parlay.overdrop.overdrop-xp')}</OverdropLabel>
                    <OverdropValue color={theme.overdrop.textColor.senary}>
                        {!isOverdropSummaryOpen &&
                            (isFreeBetActive ? `Free bets not eligible` : `${formatPoints(overdropTotalXP)}`)}
                        {!overdropSummaryOpen && <OverdropValue>{` (${overdropTotalBoost}% boost)`}</OverdropValue>}
                        {!isFreeBetActive && (
                            <Arrow className={!overdropSummaryOpen ? 'icon icon--caret-down' : 'icon icon--caret-up'} />
                        )}
                    </OverdropValue>
                </OverdropRowSummary>
            </OverdropRowSummary>
            {overdropSummaryOpen && (
                <OverdropSummary>
                    <OverdropRowSummary>
                        <OverdropLabel>{t('markets.parlay.overdrop.buy-in-xp')}</OverdropLabel>
                        <OverdropValue>{`${formatCurrency(buyInAmountInDefaultCollateral)} XP`}</OverdropValue>
                    </OverdropRowSummary>
                    <OverdropRowSummary>
                        <OverdropLabel>{t('markets.parlay.overdrop.odds-xp')}</OverdropLabel>
                        <OverdropValue>{`${formatCurrency(2 - totalQuote, 2)}x`}</OverdropValue>
                    </OverdropRowSummary>
                    <OverdropRowSummary>
                        <OverdropLabel>
                            {t('markets.parlay.overdrop.base-xp')}{' '}
                            <Tooltip
                                overlay={<>{t(`markets.parlay.overdrop.tooltip.base-xp`)}</>}
                                iconFontSize={14}
                                marginLeft={3}
                            />
                        </OverdropLabel>
                        <OverdropValue>{`${formatCurrency(
                            buyInAmountInDefaultCollateral * (2 - totalQuote)
                        )} XP`}</OverdropValue>
                    </OverdropRowSummary>
                    <HorizontalLine />
                    {overdropMultipliers.map((multiplier) => (
                        <OverdropRowSummary key={multiplier.name}>
                            <OverdropLabel>
                                {multiplier.label}{' '}
                                <Tooltip
                                    overlay={<>{t(`markets.parlay.overdrop.tooltip.${multiplier.tooltip}`)}</>}
                                    iconFontSize={14}
                                    marginLeft={3}
                                />
                            </OverdropLabel>
                            <OverdropValue>+{multiplier.multiplier}%</OverdropValue>
                        </OverdropRowSummary>
                    ))}
                    {overdropGameMultipliersInThisTicket && (
                        <OverdropRowSummary>
                            <OverdropLabel>
                                Boosted games{' '}
                                <Tooltip
                                    overlay={<>{t(`markets.parlay.overdrop.tooltip.promo-boost`)}</>}
                                    iconFontSize={14}
                                    marginLeft={3}
                                />
                            </OverdropLabel>
                            <OverdropValue>+{overdropBoostedGamesTotalBoost}%</OverdropValue>
                        </OverdropRowSummary>
                    )}
                    <HorizontalLine />
                    <OverdropRowSummary>
                        <OverdropLabel>{t('markets.parlay.overdrop.total-xp-boost')}</OverdropLabel>
                        <OverdropValue>+{overdropTotalBoost}%</OverdropValue>
                    </OverdropRowSummary>
                    <OverdropRowSummary>
                        <OverdropLabel color={theme.overdrop.textColor.senary}>
                            {t('markets.parlay.overdrop.total-xp-earned')}
                        </OverdropLabel>
                        <OverdropValue color={theme.overdrop.textColor.senary}>
                            +{formatPoints(overdropTotalXP)}
                        </OverdropValue>
                    </OverdropRowSummary>
                    <OverdropProgressWrapper>
                        <LeftLevel>LVL {levelItem.level}</LeftLevel>
                        <CurrentLevelProgressLineContainer>
                            <CurrentLevelProgressLine
                                progressUpdateXP={overdropTotalXP}
                                hideLevelLabel
                                showNumbersOnly
                            />
                        </CurrentLevelProgressLineContainer>
                        <RightLevel
                            highlight={
                                overdropTotalXP + (userData?.points ?? 0) >
                                getNextLevelItemByPoints(userData?.points).minimumPoints
                            }
                        >
                            LVL {levelItem.level + 1}
                        </RightLevel>
                    </OverdropProgressWrapper>
                </OverdropSummary>
            )}
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
            <ShareWrapper disabled={twitterShareDisabled} onClick={onTwitterIconClick}>
                <SummaryLabel disabled={twitterShareDisabled}>{t('markets.parlay.share-ticket.label')}</SummaryLabel>
                <TwitterIcon disabled={twitterShareDisabled} />
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
                    systemBetData={shareTicketModalData.systemBetData}
                    isTicketOpen={shareTicketModalData.isTicketOpen}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={roundNumberToDecimals(
                        Number(buyInAmount) * (1 + APPROVAL_BUFFER),
                        isStableCollateral ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS
                    )}
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

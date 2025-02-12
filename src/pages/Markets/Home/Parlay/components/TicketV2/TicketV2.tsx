import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import OutsideClickHandler from 'components/OutsideClick';
import SelectInput from 'components/SelectInput';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import SimpleLoader from 'components/SimpleLoader';
import Toggle from 'components/Toggle';
import Tooltip from 'components/Tooltip';
import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getLoadingToastOptions, getSuccessToastOptions } from 'config/toast';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    APPROVAL_BUFFER,
    COINGECKO_SWAP_TO_THALES_QUOTE_SLIPPAGE,
    SGP_BET_MINIMUM_MARKETS,
    SWAP_APPROVAL_BUFFER,
    SYSTEM_BET_MAX_ALLOWED_SYSTEM_COMBINATIONS,
    SYSTEM_BET_MINIMUM_DENOMINATOR,
    SYSTEM_BET_MINIMUM_MARKETS,
    THALES_CONTRACT_RATE_KEY,
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
    getIsSgp,
    getIsSystemBet,
    getLiveBetSlippage,
    getTicketPayment,
    removeAll,
    resetTicketError,
    setIsFreeBetDisabledByUser,
    setIsSgp,
    setIsSystemBet,
    setLiveBetSlippage,
    setPaymentAmountToBuy,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsBiconomy, getIsConnectedViaParticle, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { BoldContent, FlexDiv, FlexDivCentered, FlexDivColumn } from 'styles/common';
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
import { SportsAmmData, TicketMarket, TradeData } from 'types/markets';
import { OverdropMultiplier, OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { SportsbookData } from 'types/sgp';
import { ShareTicketModalProps } from 'types/tickets';
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
    isStableCurrency,
    isThalesCurrency,
    mapMultiCollateralBalances,
} from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import { isErrorExcluded, logErrorToDiscord } from 'utils/discord';
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
import { getAddedPayoutOdds, getShareTicketModalData, getSystemBetData, getSystemBetDataObject } from 'utils/tickets';
import { delay } from 'utils/timer';
import { getRequestId, getTradingProcessorTransaction, processTransaction } from 'utils/tradingProcessor';
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
    OddChangeDown,
    OddChangeUp,
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
    setOddsChanged?: (changed: boolean) => void;
    acceptOddChanges: (changed: boolean) => void;
    onSuccess?: () => void;
    submitButtonDisabled?: boolean;
    setUseThalesCollateral: (useThales: boolean) => void;
    sgpData?: SportsbookData;
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
    setOddsChanged,
    acceptOddChanges,
    onSuccess,
    submitButtonDisabled,
    setUseThalesCollateral,
    sgpData,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const dispatch = useDispatch();

    const isLiveTicket = useMemo(() => {
        return markets?.[0]?.live;
    }, [markets]);

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const isSgp = useSelector(getIsSgp);

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

    const [swapToThales, setSwapToThales] = useState(false);
    const [swappedThalesToReceive, setSwappedThalesToReceive] = useState(0);
    const [swapQuote, setSwapQuote] = useState(0);
    const [hasSwapAllowance, setHasSwapAllowance] = useState(false);
    const [buyStep, setBuyStep] = useState(BuyTicketStep.APPROVE_SWAP);
    const [openBuyStepsModal, setOpenBuyStepsModal] = useState(false);
    const [systemBetDenominator, setSystemBetDenominator] = useLocalStorage(
        LOCAL_STORAGE_KEYS.SYSTEM_BET_DENOMINATOR,
        SYSTEM_BET_MINIMUM_DENOMINATOR
    );
    const [isTotalQuoteIncreased, setIsTotalQuoteIncreased] = useState(false);

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, { enabled: isConnected });

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
    const isThales = isThalesCurrency(selectedCollateral);
    const isStakedThales = selectedCollateral === CRYPTO_CURRENCY_MAP.sTHALES;
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

    const noProofs = useMemo(() => markets.every((market) => !market.proof), [markets]);

    // Used for cancelling the subscription and asynchronous tasks in a useEffect
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isLiveTicket) {
            dispatch(setIsSystemBet(false));
            dispatch(setIsSgp(false));
            acceptOddChanges && acceptOddChanges(false); // reset odds changes
        } else if (isSgp) {
            dispatch(setIsSystemBet(false));
            acceptOddChanges && acceptOddChanges(false); // reset odds changes
        }
    }, [dispatch, acceptOddChanges, isSystemBet, isLiveTicket, isSgp]);

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
            multiplier: isThales || swapToThales ? 10 : 0,
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
        swapToThales,
        userMultipliersQuery.data,
        userMultipliersQuery.isSuccess,
        markets,
        isThales,
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
        { enabled: isConnected }
    );

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected }
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
    const coingeckoThalesMinRecive = useMemo(() => {
        const coingeckoThalesAmount =
            coingeckoRatesQuery.isSuccess && coingeckoRatesQuery.data[CRYPTO_CURRENCY_MAP.THALES as Coins]
                ? (Number(buyInAmount) * coingeckoRatesQuery.data[selectedCollateral]) /
                  coingeckoRatesQuery.data[CRYPTO_CURRENCY_MAP.THALES as Coins]
                : 0;
        return coingeckoThalesAmount * (1 - COINGECKO_SWAP_TO_THALES_QUOTE_SLIPPAGE[networkId]);
    }, [coingeckoRatesQuery, selectedCollateral, buyInAmount, networkId]);

    const selectedCollateralCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[usedCollateralForBuy] : 1;
    const thalesContractCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[THALES_CONTRACT_RATE_KEY] : 1;

    const liveTradingProcessorDataQuery = useLiveTradingProcessorDataQuery({ networkId, client });

    const maxAllowedExecutionDelay = useMemo(
        () =>
            liveTradingProcessorDataQuery.isSuccess && liveTradingProcessorDataQuery.data
                ? liveTradingProcessorDataQuery.data.maxAllowedExecutionDelay + 10
                : 20,
        [liveTradingProcessorDataQuery.isSuccess, liveTradingProcessorDataQuery.data]
    );

    const userDataQuery = useUserDataQuery(walletAddress, { enabled: isConnected });

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

    const isValidSgpBet = useMemo(() => isSgp && markets.length >= SGP_BET_MINIMUM_MARKETS, [isSgp, markets.length]);

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
            quote = isSgp
                ? sgpData?.priceWithSpread
                    ? getAddedPayoutOdds(usedCollateralForBuy, sgpData.priceWithSpread)
                    : 0
                : markets.reduce(
                      (partialQuote, market) =>
                          partialQuote *
                          (market.odd > 0 ? getAddedPayoutOdds(usedCollateralForBuy, market.odd) : market.odd),
                      1
                  );
            const maxSupportedOdds = sportsAmmData?.maxSupportedOdds || 1;
            quote = quote && quote < maxSupportedOdds ? maxSupportedOdds : quote;
        }
        return quote;
    }, [
        isSystemBet,
        markets,
        sportsAmmData?.maxSupportedOdds,
        systemData.systemBetQuote,
        usedCollateralForBuy,
        isSgp,
        sgpData?.priceWithSpread,
    ]);

    const previousTotalQuote = useRef<number>(totalQuote);
    const previousMarkets = useRef<TicketMarket[]>(markets);
    const previousUsedCollateral = useRef<Coins>(usedCollateralForBuy);

    // Check if SGP total quote is changed
    useEffect(() => {
        if (isSgp) {
            const isMarketsUpdated =
                markets.length !== previousMarkets.current.length ||
                markets.some(
                    (market, i) =>
                        market.typeId !== previousMarkets.current[i].typeId ||
                        market.position !== previousMarkets.current[i].position ||
                        market.playerProps.playerId !== previousMarkets.current[i].playerProps.playerId ||
                        market.line !== previousMarkets.current[i].line
                );
            const isQuoteChangedDueThalesBonus =
                (isThalesCurrency(usedCollateralForBuy) || isThalesCurrency(previousUsedCollateral.current)) &&
                isThalesCurrency(usedCollateralForBuy) !== isThalesCurrency(previousUsedCollateral.current);

            if (
                totalQuote &&
                previousTotalQuote.current &&
                totalQuote !== previousTotalQuote.current &&
                !isMarketsUpdated &&
                !isQuoteChangedDueThalesBonus
            ) {
                setOddsChanged && setOddsChanged(true);
                setIsTotalQuoteIncreased(totalQuote < previousTotalQuote.current); // smaller implied odds => higher quote
            } else if (totalQuote === 0) {
                acceptOddChanges && acceptOddChanges(false);
            }
        }
        previousTotalQuote.current = totalQuote;
        previousMarkets.current = markets;
        previousUsedCollateral.current = usedCollateralForBuy;
    }, [isSgp, totalQuote, markets, usedCollateralForBuy, setOddsChanged, acceptOddChanges]);

    const totalBonus = useMemo(() => {
        const bonus = {
            percentage: 0,
            value: 0,
        };
        if (isThales || swapToThales) {
            const { quote, basicQuote } = isSystemBet
                ? isValidSystemBet
                    ? {
                          quote: getSystemBetData(markets, systemBetDenominator, usedCollateralForBuy).systemBetQuote,
                          basicQuote: getSystemBetData(markets, systemBetDenominator, 'USDC' as Coins).systemBetQuote,
                      }
                    : { quote: 1, basicQuote: 1 }
                : isSgp
                ? isValidSgpBet
                    ? {
                          quote: getAddedPayoutOdds(usedCollateralForBuy, sgpData?.priceWithSpread || 0),
                          basicQuote: sgpData?.priceWithSpread || 0,
                      }
                    : { quote: 1, basicQuote: 1 }
                : markets.reduce(
                      (partialQuote, market) => {
                          return {
                              quote:
                                  partialQuote.quote *
                                  (market.odd > 0
                                      ? getAddedPayoutOdds(CRYPTO_CURRENCY_MAP.THALES as Coins, market.odd)
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
        isThales,
        isValidSystemBet,
        markets,
        payout,
        swapToThales,
        systemBetDenominator,
        usedCollateralForBuy,
        isSgp,
        isValidSgpBet,
        sgpData?.priceWithSpread,
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

    const isMaxSgpTotalQuote = useMemo(() => isSgp && isValidSgpBet && totalQuote === sportsAmmData?.maxSupportedOdds, [
        isSgp,
        isValidSgpBet,
        sportsAmmData?.maxSupportedOdds,
        totalQuote,
    ]);
    const isInvalidSgpTotalQuote = useMemo(() => isSgp && isValidSgpBet && totalQuote === 0, [
        isSgp,
        isValidSgpBet,
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

    const ticketLiquidityQuery = useTicketLiquidityQuery(markets, { networkId, client }, { enabled: !noProofs });

    const ticketLiquidity: number | undefined = useMemo(() => {
        if (ticketLiquidityQuery.isSuccess && ticketLiquidityQuery.data !== undefined) {
            let liquidity = ticketLiquidityQuery.data;

            if (isThales || swapToThales) {
                liquidity = Math.floor((liquidity * selectedCollateralCurrencyRate) / thalesContractCurrencyRate);
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
        isThales,
        swapToThales,
        isSystemBet,
        selectedCollateralCurrencyRate,
        thalesContractCurrencyRate,
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
                (isSystemBet && (!isValidSystemBet || isInvalidNumberOfCombination)) ||
                (isSgp && isInvalidSgpTotalQuote)
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
                try {
                    if (isLiveTicket || isSgp) {
                        const [minimumReceivedForBuyInAmount] = await Promise.all([
                            collateralHasLp
                                ? buyInAmountForQuote *
                                  (isDefaultCollateral && !swapToThales ? 1 : selectedCollateralCurrencyRate)
                                : multiCollateralOnOffRampContract?.read.getMinimumReceived([
                                      swapToThales ? thalesCollateralAddress : collateralAddress,
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
                        const tradeData = getTradeData(markets);

                        const [parlayAmmQuote] = await Promise.all([
                            getSportsAMMV2QuoteMethod(
                                swapToThales ? thalesCollateralAddress : collateralAddress,
                                isDefaultCollateral && !swapToThales,
                                sportsAMMV2Contract,
                                tradeData,
                                coinParser(buyInAmountForQuote.toString(), networkId, usedCollateralForBuy),
                                isSystemBet,
                                systemBetDenominator
                            ),
                        ]);

                        !fetchQuoteOnly &&
                            setBuyInAmountInDefaultCollateral(
                                isThales || swapToThales
                                    ? (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) *
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
            isThales,
            swapToThales,
            isDefaultCollateral,
            selectedCollateralCurrencyRate,
            collateralAddress,
            usedCollateralForBuy,
            thalesCollateralAddress,
            systemBetDenominator,
            swappedThalesToReceive,
            buyInAmount,
            isLiveTicket,
            isSgp,
            isInvalidSgpTotalQuote,
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
        } else if (swapToThales && Number(buyInAmount) > 0) {
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
            if (!openBuyStepsModal && !tooltipTextBuyInAmount) {
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
        if (isConnected && swapToThales && buyInAmount) {
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
        swapToThales,
        swapToThalesParams.src,
        isBuying,
        isConnected,
    ]);

    // Check allowance
    useEffect(() => {
        const collateralToAllow = swapToThales
            ? (CRYPTO_CURRENCY_MAP.THALES as Coins)
            : (isLiveTicket || isSgp) && isEth
            ? (CRYPTO_CURRENCY_MAP.WETH as Coins)
            : selectedCollateral;

        const getAllowance = async () => {
            try {
                const parsedTicketPrice = coinParser(
                    (swapToThales ? swappedThalesToReceive : Number(buyInAmount)).toString(),
                    networkId,
                    collateralToAllow
                );

                const collateralIndex =
                    isDefaultCollateral && !swapToThales
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
            (isEth && !(isLiveTicket || isSgp) && !swapToThales) || isFreeBetActive || isStakedThales
                ? setHasAllowance(true)
                : getAllowance();
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
        isSgp,
        isFreeBetActive,
        swapToThales,
        swappedThalesToReceive,
        isBuying,
        isStakedThales,
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
        const rates = isThales || swapToThales ? thalesContractCurrencyRate : selectedCollateralCurrencyRate;
        const amount = sportsAmmData?.minBuyInAmount || 0;
        const minBuyin = convertFromStableToCollateral(usedCollateralForBuy, amount, rates, networkId);

        setMinBuyInAmount(minBuyin);
    }, [
        isThales,
        swapToThales,
        swappedThalesToReceive,
        thalesContractCurrencyRate,
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
            (swapToThales ? swapQuote && swappedThalesToReceive < minBuyInAmount : Number(buyInAmount) < minBuyInAmount)
        ) {
            let minBuyin = minBuyInAmount / (swapToThales ? swapQuote : 1);
            minBuyin =
                swapToThales && isDefaultCollateral && minBuyin < minBuyInAmountInDefaultCollateral
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
        swapToThales,
        swappedThalesToReceive,
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
    ): Promise<{ step: BuyTicketStep; thalesAmount: number }> => {
        let step = initialStep;
        let thalesAmount = swappedThalesToReceive;

        // Validation for min buy-in while modal is open
        if (swappedThalesToReceive && swappedThalesToReceive < minBuyInAmount) {
            setOpenBuyStepsModal(false);
            return { step, thalesAmount };
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
                    ? multipleCollateralBalances.data[CRYPTO_CURRENCY_MAP.THALES as Coins]
                    : 0;
                const swapTxHash = swapRawTransaction ? await sendTransaction(swapRawTransaction) : undefined;

                if (swapTxHash) {
                    step = BuyTicketStep.APPROVE_BUY;
                    setBuyStep(step);

                    await delay(3000); // wait for THALES balance to increase

                    const collateralContractWithSigner = getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        { client: walletClient.data, networkId },
                        getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.THALES as Coins)
                    );

                    const balanceAfter = bigNumberFormatter(
                        await collateralContractWithSigner?.read.balanceOf([walletAddress])
                    );
                    thalesAmount = balanceAfter - balanceBefore;
                    setSwappedThalesToReceive(thalesAmount);
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
                        getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.THALES as Coins)
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

        return { step, thalesAmount };
    };

    const handleSubmit = async () => {
        const networkConfig = {
            client: walletClient.data,
            networkId,
        };

        const sportsAMMV2Contract = getContractInstance(ContractType.SPORTS_AMM_V2, networkConfig);
        const liveTradingProcessorContract = getContractInstance(ContractType.LIVE_TRADING_PROCESSOR, networkConfig);
        const sgpTradingProcessorContract = getContractInstance(ContractType.SGP_TRADING_PROCESSOR, networkConfig);
        const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);
        const stakingThalesBettingProxyContract = getContractInstance(
            ContractType.STAKING_THALES_BETTING_PROXY,
            networkConfig
        );

        // TODO: separate logic for regular and live markets
        if (
            (sportsAMMV2Contract && !isLiveTicket) ||
            (liveTradingProcessorContract && isLiveTicket) ||
            (sgpTradingProcessorContract && isSgp) ||
            (stakingThalesBettingProxyContract && isStakedThales)
        ) {
            setIsBuying(true);
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));

            let step = buyStep;
            let thalesAmount = swappedThalesToReceive;
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
                ({ step, thalesAmount } = await handleBuyWithThalesSteps(step));

                if (step !== BuyTicketStep.BUY) {
                    toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                    setIsBuying(false);
                    return;
                }
            }

            let tradeData: TradeData[] = [];

            try {
                const liveOrSgpTradingProcessorContract = isLiveTicket
                    ? liveTradingProcessorContract
                    : sgpTradingProcessorContract;

                tradeData = getTradeData(markets);

                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;

                const parsedBuyInAmount = coinParser(
                    (swapToThales ? thalesAmount : buyInAmount).toString(),
                    networkId,
                    usedCollateralForBuy
                );
                const parsedTotalQuote = parseEther(floorNumberToDecimals(totalQuote, 18).toString());
                const additionalSlippage = parseEther(isLiveTicket || isSgp ? liveBetSlippage / 100 + '' : '0.02');

                let tx;

                if (isLiveTicket || isSgp) {
                    const liveTradeDataOdds = tradeData[0].odds;
                    const liveTradeDataPosition = tradeData[0].position;
                    const liveTotalQuote = BigInt(liveTradeDataOdds[liveTradeDataPosition]);
                    const sgpTotalQuote = parseEther((sgpData?.priceWithSpread || 0).toString()); // without bonus as it is added on contract

                    if (isEth && !swapToThales) {
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
                                tx = await getTradingProcessorTransaction(
                                    isLiveTicket,
                                    isSgp,
                                    collateralAddress,
                                    liveOrSgpTradingProcessorContract,
                                    tradeData,
                                    parsedBuyInAmount,
                                    isLiveTicket ? liveTotalQuote : sgpTotalQuote,
                                    referralId,
                                    additionalSlippage,
                                    isBiconomy,
                                    false, // isFreeBet
                                    undefined, // freeBetHolderContract
                                    isStakedThales,
                                    stakingThalesBettingProxyContract,
                                    networkId
                                );
                            }
                        }
                    } else {
                        tx = await getTradingProcessorTransaction(
                            isLiveTicket,
                            isSgp,
                            swapToThales ? thalesCollateralAddress : collateralAddress,
                            liveOrSgpTradingProcessorContract,
                            tradeData,
                            parsedBuyInAmount,
                            isLiveTicket ? liveTotalQuote : sgpTotalQuote,
                            referralId,
                            additionalSlippage,
                            isBiconomy,
                            isFreeBetActive,
                            freeBetHolderContract,
                            isStakedThales,
                            stakingThalesBettingProxyContract,
                            networkId
                        );
                    }
                } else {
                    tx = await getSportsAMMV2Transaction(
                        swapToThales ? thalesCollateralAddress : collateralAddress,
                        isDefaultCollateral && !swapToThales,
                        isEth && !swapToThales,
                        networkId,
                        sportsAMMV2Contract,
                        freeBetHolderContract,
                        tradeData,
                        parsedBuyInAmount,
                        parsedTotalQuote,
                        referralId,
                        additionalSlippage,
                        isBiconomy,
                        isFreeBetActive,
                        isStakedThales,
                        stakingThalesBettingProxyContract,
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
                        isLiveTicket
                            ? isFreeBetActive
                                ? PLAUSIBLE_KEYS.freeBetLive
                                : PLAUSIBLE_KEYS.livePositionBuy
                            : isSgp
                            ? PLAUSIBLE_KEYS.sgpBuy
                            : PLAUSIBLE_KEYS.parlayBuy,
                        {
                            props: {
                                value: Number(buyInAmount),
                                collateral: selectedCollateral,
                                networkId,
                            },
                        }
                    );

                    const shareTicketOnClose = () => {
                        if (!keepSelection) dispatch(removeAll());
                        onModalClose();
                        onSuccess && onSuccess();
                    };
                    const shareTicketPaid =
                        !collateralHasLp || (isDefaultCollateral && !swapToThales)
                            ? isLiveTicket || isSgp
                                ? 0 // get from last ticket for live or sgp
                                : Number(buyInAmountInDefaultCollateral)
                            : swapToThales
                            ? swappedThalesToReceive
                            : Number(buyInAmount);

                    if (isLiveTicket || isSgp) {
                        const requestId = getRequestId(txReceipt.logs, isFreeBetActive, isStakedThales, isSgp);
                        if (!requestId) {
                            throw new Error('Request ID not found');
                        }

                        if (liveOrSgpTradingProcessorContract) {
                            toast.update(
                                toastId,
                                getLoadingToastOptions(
                                    t(`market.toast-message.${isSgp ? 'sgp-trade-requested' : 'live-trade-requested'}`)
                                )
                            );
                            await delay(2000);
                            const { isFulfilledTx, isAdapterError } = await processTransaction(
                                networkId,
                                liveOrSgpTradingProcessorContract,
                                requestId,
                                maxAllowedExecutionDelay,
                                toastId,
                                t(`market.toast-message.${isSgp ? 'fulfilling-sgp-trade' : 'fulfilling-live-trade'}`)
                            );

                            if (isAdapterError) {
                                setIsBuying(false);
                                refetchBalances(walletAddress, networkId);
                            } else if (!isFulfilledTx) {
                                setIsBuying(false);
                                refetchBalances(walletAddress, networkId);
                                toast.update(toastId, getErrorToastOptions(t('markets.parlay.odds-changed-error')));
                            } else {
                                refetchBalances(walletAddress, networkId);

                                const modalData = await getShareTicketModalData(
                                    [...markets],
                                    collateralHasLp ? usedCollateralForBuy : defaultCollateral,
                                    shareTicketPaid,
                                    0,
                                    shareTicketOnClose,
                                    true, // isModalForLive
                                    isSgp,
                                    isFreeBetActive,
                                    isStakedThales,
                                    undefined,
                                    networkConfig,
                                    walletAddress
                                );

                                if (modalData) {
                                    setShareTicketModalData(modalData);
                                    setShowShareTicketModal(true);
                                }

                                setBuyStep(BuyTicketStep.COMPLETED);
                                setOpenBuyStepsModal(false);

                                toast.update(toastId, getSuccessToastOptions(t('market.toast-message.buy-success')));
                                setIsBuying(false);
                                setCollateralAmount('');
                            }
                        }
                    } else {
                        refetchBalances(walletAddress, networkId);

                        const systemBetData = isSystemBet
                            ? getSystemBetDataObject(
                                  systemBetDenominator,
                                  numberOfSystemBetCombination,
                                  Number(buyInAmount),
                                  systemData.systemBetMinimumQuote,
                                  payout
                              )
                            : undefined;

                        const modalData = await getShareTicketModalData(
                            [...markets],
                            collateralHasLp ? usedCollateralForBuy : defaultCollateral,
                            shareTicketPaid,
                            payout,
                            shareTicketOnClose,
                            false, // isModalForLive
                            isSgp,
                            isFreeBetActive,
                            isStakedThales,
                            systemBetData
                        );

                        setShareTicketModalData(modalData);
                        setShowShareTicketModal(true);

                        setBuyStep(BuyTicketStep.COMPLETED);
                        setOpenBuyStepsModal(false);

                        toast.update(toastId, getSuccessToastOptions(t('market.toast-message.buy-success')));
                        setIsBuying(false);
                        setCollateralAmount('');
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
                if (!isErrorExcluded(e as Error)) {
                    const data = `BUY error for params:\nnetworkId=${networkId}\nisParticle=${isParticle}\nisSgp=${isSgp}\nisLive=${isLiveTicket}\nliveOdds=${JSON.stringify(
                        tradeData[0]?.odds
                    )}\nlivePosition=${tradeData[0]?.position}\nbuyInAmount=${(swapToThales
                        ? thalesAmount
                        : buyInAmount
                    ).toString()}\ncollateral=${usedCollateralForBuy}\nisSwapToThales=${swapToThales}`;

                    logErrorToDiscord(e as Error, { componentStack: '' }, data);
                }
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
        if (!payout) {
            setSubmitDisabled(true);
            return;
        }

        if (isSystemBet && !isValidSystemBet) {
            setSubmitDisabled(true);
            return;
        }

        if (isSgp && isInvalidSgpTotalQuote) {
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
        isSgp,
        swappedThalesToReceive,
        swapToThales,
        isSystemBet,
        isInvalidSystemTotalQuote,
        isValidSystemBet,
        isInvalidSgpTotalQuote,
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
        if (!swapToThales && !hasAllowance && buyInAmount && Number(buyInAmount) >= minBuyInAmount) {
            if ((isLiveTicket || isSgp) && isEth) {
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

        if (!swapToThales && (isLiveTicket || isSgp) && isEth) {
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
                if (!isDefaultCollateral && !isThales && !swapToThales) {
                    const parlayAmmQuoteForMin = await fetchTicketAmmQuote(minBuyInAmount, true);

                    if (!mountedRef.current || !isSubscribed || !parlayAmmQuoteForMin) return null;

                    if (!parlayAmmQuoteForMin.error) {
                        setMinBuyInAmountInDefaultCollateral(parlayAmmQuoteForMin.buyInAmountInDefaultCollateralNumber);
                    }
                } else {
                    setMinBuyInAmountInDefaultCollateral(
                        isDefaultCollateral
                            ? sportsAmmData?.minBuyInAmount || 0
                            : (swapToThales ? swappedThalesToReceive : minBuyInAmount) * selectedCollateralCurrencyRate
                    );
                }
            }

            if (Number(buyInAmount) > 0 && minBuyInAmountInDefaultCollateral) {
                const parlayAmmQuote = await fetchTicketAmmQuote(
                    swapToThales ? swappedThalesToReceive : Number(buyInAmount),
                    false
                );

                if (!mountedRef.current || !isSubscribed || !parlayAmmQuote) return null;

                if (!parlayAmmQuote.error) {
                    if (isLiveTicket || isSgp) {
                        const buyIn = collateralHasLp
                            ? swapToThales
                                ? swappedThalesToReceive
                                : Number(buyInAmount)
                            : parlayAmmQuote.buyInAmountInDefaultCollateralNumber;
                        setPayout((1 / totalQuote) * buyIn);
                    } else {
                        const payout = coinFormatter(
                            parlayAmmQuote[1],
                            networkId,
                            collateralHasLp
                                ? swapToThales
                                    ? (CRYPTO_CURRENCY_MAP.THALES as Coins)
                                    : selectedCollateral
                                : undefined
                        );
                        setPayout(payout);
                        const amountsToBuy: number[] = (parlayAmmQuote.amountsToBuy || []).map((quote: bigint) =>
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
        isDefaultCollateral,
        isThales,
        selectedCollateralCurrencyRate,
        thalesContractCurrencyRate,
        sportsAmmData?.minBuyInAmount,
        minBuyInAmount,
        minBuyInAmountInDefaultCollateral,
        setMarketsOutOfLiquidity,
        networkId,
        buyInAmountInDefaultCollateral,
        collateralHasLp,
        selectedCollateral,
        totalQuote,
        swappedThalesToReceive,
        swapToThales,
        isLiveTicket,
        isSgp,
    ]);

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;
    const isQuoteTooltipEnabled =
        inputRefVisible &&
        (isInvalidRegularTotalQuote || isInvalidSystemTotalQuote || isInvalidSgpTotalQuote || isMaxSgpTotalQuote);
    const isQuoteTooltipError = isSgp && !!sgpData && !!sgpData.error;

    const getQuoteTooltipText = () => {
        let text = '';

        if (!isQuoteTooltipEnabled) return text;

        if (isSgp && sgpData && sgpData.error) {
            text = sgpData.missingEntries?.length
                ? `${sgpData.error.replace('.', ':')} ${sgpData.missingEntries
                      .map((entry) => `${entry.market} (${entry.name})`)
                      .join()}`
                : sgpData.error;
        }

        if (!text && totalQuote) {
            if (selectedOddsType === OddsType.AMM) {
                text = isSystemBet
                    ? t('markets.parlay.info.system-bet-min-quote', {
                          value: formatMarketOdds(
                              selectedOddsType,
                              (sportsAmmData?.maxSupportedOdds || 0) / numberOfSystemBetCombination
                          ),
                      })
                    : t('markets.parlay.info.min-quote', {
                          value: formatMarketOdds(selectedOddsType, sportsAmmData?.maxSupportedOdds),
                      });
            } else {
                text = isSystemBet
                    ? t('markets.parlay.info.system-bet-max-quote', {
                          value: formatMarketOdds(
                              selectedOddsType,
                              (sportsAmmData?.maxSupportedOdds || 0) / numberOfSystemBetCombination
                          ),
                      })
                    : t('markets.parlay.info.max-quote', {
                          value: formatMarketOdds(selectedOddsType, sportsAmmData?.maxSupportedOdds),
                      });
            }
        }

        return text;
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
    const onTwitterIconClick = async () => {
        const shareTicketPaid =
            !collateralHasLp || (isDefaultCollateral && !swapToThales)
                ? Number(buyInAmountInDefaultCollateral)
                : swapToThales
                ? swappedThalesToReceive
                : Number(buyInAmount);
        const systemBetData = isSystemBet
            ? getSystemBetDataObject(
                  systemBetDenominator,
                  numberOfSystemBetCombination,
                  Number(buyInAmount),
                  systemData.systemBetMinimumQuote,
                  payout
              )
            : undefined;

        // create data copy to avoid modal re-render while opened
        const modalData = await getShareTicketModalData(
            [...markets],
            collateralHasLp ? usedCollateralForBuy : defaultCollateral,
            shareTicketPaid,
            payout,
            onModalClose,
            false, // isModalForLive
            isSgp,
            isFreeBetActive,
            isStakedThales,
            systemBetData
        );

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
                                {t('markets.parlay.validation.system-bet-min-markets-validation', {
                                    minMarkets: SYSTEM_BET_MINIMUM_MARKETS,
                                })}
                            </SystemBetValidation>
                        </RowContainer>
                    )}
                    {isSystemBet && <HorizontalLine />}
                </>
            )}
            {isSgp && !isValidSgpBet && (
                <RowContainer>
                    <SystemBetValidation>
                        {t('markets.parlay.validation.sgp-bet-min-markets-validation', {
                            minMarkets: SGP_BET_MINIMUM_MARKETS,
                        })}
                    </SystemBetValidation>
                </RowContainer>
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
                    {isSgp && isValidSgpBet && !sgpData ? (
                        <LoaderContainer>
                            <SimpleLoader size={20} strokeWidth={4} />
                        </LoaderContainer>
                    ) : (
                        <Tooltip
                            open={isQuoteTooltipEnabled}
                            overlay={getQuoteTooltipText()}
                            isValidation
                            isWarning={!isQuoteTooltipError}
                        >
                            <SummaryValue fontSize={12}>
                                {formatMarketOdds(
                                    selectedOddsType,
                                    isSystemBet ? systemData.systemBetQuotePerCombination : totalQuote
                                )}
                            </SummaryValue>
                        </Tooltip>
                    )}
                    {isSgp && oddsChanged && isTotalQuoteIncreased && <OddChangeUp />}
                    {isSgp && oddsChanged && !isTotalQuoteIncreased && <OddChangeDown />}
                    {!isSystemBet && (
                        <ClearLabel alignRight={true} onClick={() => dispatch(removeAll())}>
                            {t('markets.parlay.clear')}
                            <XButton margin={'0 0 4px 5px'} className={`icon icon--clear`} />
                        </ClearLabel>
                    )}
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
                minAmount={
                    swapToThales && swapQuote
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
            {!isThales && !isFreeBetActive && (
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
            <InfoContainer hasMarginTop={!isThales && !isFreeBetActive && (isLiveTicket || isSgp)}>
                <InfoWrapper>
                    <InfoLabel>{t('markets.parlay.liquidity')}:</InfoLabel>
                    <InfoValue>
                        {ticketLiquidity ? formatCurrencyWithSign(USD_SIGN, ticketLiquidity, 0, true) : '-'}
                    </InfoValue>
                </InfoWrapper>
                {(isLiveTicket || isSgp) && (
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
                        : isDefaultCollateral && !swapToThales
                        ? formatCurrencyWithSign(USD_SIGN, Number(buyInAmount) + gas)
                        : `${formatCurrencyWithKey(
                              usedCollateralForBuy,
                              (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) + gas
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
                                : isDefaultCollateral && !swapToThales
                                ? formatCurrencyWithSign(
                                      USD_SIGN,
                                      (Number(buyInAmount) + gas) / numberOfSystemBetCombination
                                  )
                                : `${formatCurrencyWithKey(
                                      usedCollateralForBuy,
                                      ((swapToThales ? swappedThalesToReceive : Number(buyInAmount)) + gas) /
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
                                : !collateralHasLp || (isDefaultCollateral && !swapToThales)
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
                                : !collateralHasLp || (isDefaultCollateral && !swapToThales)
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
                                                payout -
                                                    (swapToThales ? swappedThalesToReceive : Number(buyInAmount)) -
                                                    gas
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
                    isSgp={shareTicketModalData.isSgp}
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

const LoaderContainer = styled(FlexDivColumn)`
    position: relative;
    max-width: 30px;
    max-height: 30px;
`;

export default Ticket;

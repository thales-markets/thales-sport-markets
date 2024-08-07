import axios from 'axios';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import { ShareTicketModalProps } from 'components/ShareTicketModalV2/ShareTicketModalV2';
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
    HIDE_PARLAY_LEADERBOARD,
    MIN_COLLATERAL_MULTIPLIER,
    PARLAY_LEADERBOARD_MINIMUM_GAMES,
    PARLAY_LEADERBOARD_WEEKLY_START_DATE,
    THALES_CONTRACT_RATE_KEY,
} from 'constants/markets';
import { differenceInDays } from 'date-fns';
import { OddsType } from 'enums/markets';
import { BigNumber, ethers } from 'ethers';
import Slippage from 'pages/Markets/Home/Parlay/components/Slippage';
import ProgressLine from 'pages/Overdrop/components/ProgressLine';
import { Circle, OverdropIcon } from 'pages/Overdrop/components/styled-components';
import useAMMContractsPausedQuery from 'queries/markets/useAMMContractsPausedQuery';
import useLiveTradingProcessorDataQuery from 'queries/markets/useLiveTradingProcessorDataQuery';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useTicketLiquidityQuery from 'queries/markets/useTicketLiquidityQuery';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getLiveBetSlippage,
    getTicketPayment,
    removeAll,
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
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import {
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
} from 'thales-utils';
import { LeaderboardPoints, SportsAmmData, TicketMarket } from 'types/markets';
import { OverdropMultiplier } from 'types/overdrop';
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
import { getLiveTradingProcessorTransaction } from 'utils/liveTradingProcessor';
import { formatMarketOdds } from 'utils/markets';
import { getTradeData } from 'utils/marketsV2';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { formatPoints, getMultiplierIcon, getMultiplierLabel } from 'utils/overdrop';
import { refetchBalances } from 'utils/queryConnector';
import { getReferralId } from 'utils/referral';
import { getSportsAMMV2QuoteMethod, getSportsAMMV2Transaction } from 'utils/sportsAmmV2';
import { getAddedPayoutMultiplier } from 'utils/tickets';
import { getKeepSelectionFromStorage, setKeepSelectionToStorage } from 'utils/ui';
import { getRewardsArray, getRewardsCurrency } from '../../../../../ParlayLeaderboard/ParlayLeaderboard';
import SuggestedAmount from '../SuggestedAmount';
import {
    AmountToBuyContainer,
    Arrow,
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
    OverdropLabel,
    OverdropRowSummary,
    OverdropSummary,
    OverdropSummarySubheader,
    OverdropSummarySubtitle,
    OverdropSummarySubvalue,
    OverdropSummaryTitle,
    OverdropTotal,
    OverdropTotalsRow,
    OverdropTotalsTitle,
    OverdropValue,
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
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;
    const buyInAmount = ticketPayment.amountToBuy;

    const [payout, setPayout] = useState(0);
    const [buyInAmountInDefaultCollateral, setBuyInAmountInDefaultCollateral] = useState<number>(0);
    const [minBuyInAmountInDefaultCollateral, setMinBuyInAmountInDefaultCollateral] = useState<number>(0);
    const [minBuyInAmount, setMinBuyInAmount] = useState<number>(0);
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

    const [gas, setGas] = useState(0);
    const [leaderboardPoints, setLeaderBoardPoints] = useState<LeaderboardPoints>({
        basicPoints: 0,
        points: 0,
        buyinBonus: 0,
        numberOfGamesBonus: 0,
    });
    const [currentLeaderboardRank, setCurrentLeaderboardRank] = useState<number>(0);
    const [slippageDropdownOpen, setSlippageDropdownOpen] = useState<boolean>(false);

    const latestPeriodWeekly = Math.trunc(differenceInDays(new Date(), PARLAY_LEADERBOARD_WEEKLY_START_DATE) / 7);

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, { enabled: isAppReady && isWalletConnected });

    const query = useParlayLeaderboardQuery(networkId, latestPeriodWeekly, {
        enabled: isAppReady && !HIDE_PARLAY_LEADERBOARD,
    });

    const parlaysData = useMemo(() => {
        return query.isSuccess ? query.data : [];
    }, [query.isSuccess, query.data]);

    const rewards = getRewardsArray(networkId);
    const rewardsCurrency = getRewardsCurrency(networkId);

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const isThales = selectedCollateral === CRYPTO_CURRENCY_MAP.THALES;
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
    const collateralHasLp = isLpSupported(selectedCollateral);

    const isMinimumParlayGames = markets.length >= PARLAY_LEADERBOARD_MINIMUM_GAMES;

    // Used for cancelling the subscription and asynchronous tasks in a useEffect
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const overdropMultipliers: OverdropMultiplier[] = useMemo(() => {
        const parlayMultiplier = {
            name: 'parlayMultiplier',
            label: 'Games in parlay',
            multiplier: (markets.length - 1) * 10,
            icon: <>{markets.length - 1}</>,
        };
        const thalesMultiplier = {
            name: 'thalesMultiplier',
            label: 'THALES used',
            multiplier: isThales ? 20 : 0,
            icon: <OverdropIcon className="icon icon--thales-logo" />,
        };
        return [
            ...(userMultipliersQuery.isSuccess
                ? userMultipliersQuery.data.map((multiplier) => ({
                      ...multiplier,
                      label: getMultiplierLabel(multiplier),
                      icon: getMultiplierIcon(multiplier),
                  }))
                : [
                      {
                          name: 'dailyMultiplier',
                          label: 'Days in a row',
                          multiplier: 0,
                          icon: <>0</>,
                      },
                      {
                          name: 'weeklyMultiplier',
                          label: 'Weeks in a row',
                          multiplier: 0,
                          icon: <>0</>,
                      },
                      {
                          name: 'twitterMultiplier',
                          label: 'Twitter share',
                          multiplier: 0,
                          icon: <OverdropIcon className="icon icon--x-twitter" />,
                      },
                  ]),
            parlayMultiplier,
            thalesMultiplier,
        ];
    }, [userMultipliersQuery.data, userMultipliersQuery.isSuccess, markets, isThales]);

    const overdropTotalXP = useMemo(() => {
        if (!buyInAmountInDefaultCollateral) {
            return 0;
        }

        const totalMultiplier = overdropMultipliers.reduce((prev, curr) => prev + curr.multiplier, 0);
        return buyInAmountInDefaultCollateral * (1 + totalMultiplier / 100);
    }, [overdropMultipliers, buyInAmountInDefaultCollateral]);

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

    const multipleCollateralBalancesData = useMemo(() => {
        return multipleCollateralBalances?.isSuccess && multipleCollateralBalances?.data
            ? multipleCollateralBalances.data
            : [];
    }, [multipleCollateralBalances]);

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

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const rewardCurrencyRate = exchangeRates && exchangeRates !== null ? exchangeRates[rewardsCurrency] : 0;
    const selectedCollateralCurrencyRate =
        exchangeRates && exchangeRates !== null ? exchangeRates[selectedCollateral] : 1;
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

    useEffect(() => {
        if (!freeBetBalanceExists) return;

        const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);

        const selectedCollateralItem = balanceList?.find((item) => item.collateralKey == selectedCollateral);

        const isSelectedCollateralBalanceLowerThanMinimumBuyAmount =
            selectedCollateralItem && selectedCollateralItem.balanceDollarValue < 3;

        if (!balanceList) return;
        const maxBalanceItem = getMaxCollateralDollarValue(balanceList);

        if (
            maxBalanceItem &&
            (!ticketPayment.forceChangeCollateral || isSelectedCollateralBalanceLowerThanMinimumBuyAmount)
        ) {
            dispatch(
                setPaymentSelectedCollateralIndex({
                    selectedCollateralIndex: maxBalanceItem.index,
                    networkId: networkId,
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dispatch,
        exchangeRates,
        freeBetBalanceExists,
        freeBetCollateralBalances,
        minBuyInAmount,
        multipleCollateralBalancesData,
        networkId,
        ticketPayment.forceChangeCollateral,
    ]);

    useEffect(() => {
        setMinBuyInAmountInDefaultCollateral(sportsAmmData?.minBuyInAmount || 0);
    }, [sportsAmmData?.minBuyInAmount]);

    const totalQuote = useMemo(() => {
        const quote = markets.reduce(
            (partialQuote, market) =>
                partialQuote * (market.odd > 0 ? market.odd * getAddedPayoutMultiplier(selectedCollateral) : 1),
            1
        );
        const maxSupportedOdds = sportsAmmData?.maxSupportedOdds || 1;
        return quote < maxSupportedOdds ? maxSupportedOdds : quote;
    }, [markets, sportsAmmData?.maxSupportedOdds, selectedCollateral]);

    const totalBonus = useMemo(() => {
        const bonus = {
            percentage: 0,
            value: 0,
        };
        if (isThales) {
            const multiplier = getAddedPayoutMultiplier(selectedCollateral);
            const percentage = Math.pow(1 / multiplier, markets.length);
            bonus.percentage = percentage - 1;
            bonus.value = Number(payout) - Number(payout) / percentage;
        }
        return bonus;
    }, [isThales, selectedCollateral, markets.length, payout]);

    const ticketLiquidityQuery = useTicketLiquidityQuery(markets, networkId, {
        enabled: isAppReady,
    });

    const ticketLiquidity: number | undefined = useMemo(
        () =>
            ticketLiquidityQuery.isSuccess && ticketLiquidityQuery.data !== undefined
                ? isThales
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
                              (isDefaultCollateral
                                  ? 1
                                  : isThales
                                  ? thalesContractCurrencyRate
                                  : selectedCollateralCurrencyRate)
                            : multiCollateralOnOffRampContract?.getMinimumNeeded(
                                  collateralAddress,
                                  coinParser(minBuyInAmountInDefaultCollateral.toString(), networkId)
                              ),
                    ]);

                    setMinBuyInAmount(
                        (collateralHasLp
                            ? minimumNeededForMinUsdAmountValue
                            : coinFormatter(minimumNeededForMinUsdAmountValue, networkId, selectedCollateral)) *
                            (isDefaultCollateral ? 1 : MIN_COLLATERAL_MULTIPLIER)
                    );

                    if (markets[0]?.live) {
                        const [minimumReceivedForBuyInAmount] = await Promise.all([
                            collateralHasLp
                                ? buyInAmountForQuote * (isDefaultCollateral ? 1 : selectedCollateralCurrencyRate)
                                : multiCollateralOnOffRampContract?.getMinimumReceived(
                                      collateralAddress,
                                      coinParser(buyInAmountForQuote.toString(), networkId, selectedCollateral)
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
                                collateralAddress,
                                isDefaultCollateral,
                                sportsAMMV2Contract,
                                tradeData,
                                coinParser(buyInAmountForQuote.toString(), networkId, selectedCollateral)
                            ),
                        ]);

                        setBuyInAmountInDefaultCollateral(
                            isThales
                                ? Number(buyInAmount) * selectedCollateralCurrencyRate
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
            selectedCollateral,
            buyInAmount,
        ]
    );

    useEffect(() => {
        const { sportsAMMV2Contract, sUSDContract, signer, multipleCollateral } = networkConnector;

        if (isFreeBetActive && isWalletConnected) {
            setHasAllowance(true);
            return;
        }
        if (sportsAMMV2Contract && multipleCollateral && signer) {
            const collateralToAllow = isLiveTicket && isEth ? (CRYPTO_CURRENCY_MAP.WETH as Coins) : selectedCollateral;
            const collateralContractWithSigner = isDefaultCollateral
                ? sUSDContract?.connect(signer)
                : multipleCollateral[collateralToAllow]?.connect(signer);

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = coinParser(Number(buyInAmount).toString(), networkId, collateralToAllow);
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
                isEth && !isLiveTicket ? setHasAllowance(true) : getAllowance();
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
    ]);

    const isValidProfit: boolean = useMemo(() => {
        return (
            sportsAmmData?.maxSupportedAmount !== undefined &&
            Number(buyInAmountInDefaultCollateral) / Number(totalQuote) - Number(buyInAmountInDefaultCollateral) >
                sportsAmmData?.maxSupportedAmount
        );
    }, [sportsAmmData?.maxSupportedAmount, buyInAmountInDefaultCollateral, totalQuote]);

    useEffect(() => {
        if (
            (Number(buyInAmount) && finalQuotes.some((quote) => quote === 0)) ||
            (Number(buyInAmountInDefaultCollateral) &&
                ticketLiquidity &&
                Number(buyInAmountInDefaultCollateral) > ticketLiquidity)
        ) {
            setTooltipTextBuyInAmount(t('markets.parlay.validation.availability'));
        } else if (Number(buyInAmount) && Number(buyInAmount) < minBuyInAmount) {
            const decimals = getPrecision(minBuyInAmount);
            setTooltipTextBuyInAmount(
                t('markets.parlay.validation.min-amount', {
                    min: `${formatCurrencyWithKey(
                        selectedCollateral,
                        ceilNumberToDecimals(minBuyInAmount, decimals),
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
            const sportsAMMV2ContractWithSigner = markets[0].live
                ? liveTradingProcessorContract?.connect(signer)
                : sportsAMMV2Contract?.connect(signer);
            const freeBetContractWithSigner = freeBetHolderContract?.connect(signer);
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));

            try {
                const referralId =
                    walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                        ? getReferralId()
                        : null;

                const tradeData = getTradeData(markets);
                const parsedBuyInAmount = coinParser(buyInAmount.toString(), networkId, selectedCollateral);
                const parsedTotalQuote = ethers.utils.parseEther(floorNumberToDecimals(totalQuote, 18).toString());
                const additionalSlippage = ethers.utils.parseEther(
                    tradeData[0].live ? liveBetSlippage / 100 + '' : '0.02'
                );

                let tx;
                if (tradeData[0].live) {
                    const liveTradeDataOdds = tradeData[0].odds;
                    const liveTradeDataPosition = tradeData[0].position;
                    const liveTotalQuote = liveTradeDataOdds[liveTradeDataPosition];

                    if (isEth && multipleCollateral?.WETH) {
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
                            collateralAddress,
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
                        collateralAddress,
                        isDefaultCollateral,
                        isEth,
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
                                !collateralHasLp || isDefaultCollateral
                                    ? Number(buyInAmountInDefaultCollateral)
                                    : Number(buyInAmount),
                            payout: payout,
                            onClose: () => {
                                if (!keepSelection) dispatch(removeAll());
                                onModalClose();
                                onSuccess && onSuccess();
                            },
                            isTicketLost: false,
                            collateral: collateralHasLp ? selectedCollateral : defaultCollateral,
                            isLive: false,
                            applyPayoutMultiplier: true,
                        };
                        setShareTicketModalData(modalData);
                        setShowShareTicketModal(true);

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
                                if (sportsAMMDataContract && sportsAMMV2ManagerContract) {
                                    const numOfActiveTicketsPerUser = await sportsAMMV2ManagerContract.numOfActiveTicketsPerUser(
                                        walletAddress
                                    );
                                    const userTickets = await sportsAMMDataContract.getActiveTicketsDataPerUser(
                                        walletAddress.toLowerCase(),
                                        Number(numOfActiveTicketsPerUser) - 1,
                                        BATCH_SIZE
                                    );
                                    const lastTicket = userTickets.ticketsData[userTickets.ticketsData.length - 1];
                                    const lastTicketPaid =
                                        !collateralHasLp || isDefaultCollateral
                                            ? coinFormatter(lastTicket.buyInAmount, networkId)
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
                                toast.update(toastId, getSuccessToastOptions(t('market.toast-message.buy-success')));
                                setIsBuying(false);
                                setCollateralAmount('');
                            }
                        };
                        toast.update(toastId, getLoadingToastOptions(t('market.toast-message.live-trade-requested')));
                        setTimeout(checkFulfilled, 2000);
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

    useEffect(() => {
        if (isAMMPaused) {
            setSubmitDisabled(true);
            return;
        }

        // Minimum of sUSD
        if (!Number(buyInAmount) || Number(buyInAmount) < minBuyInAmount || isBuying || isAllowing) {
            setSubmitDisabled(true);
            return;
        }

        // Enable Approve if it hasn't allowance
        if (!hasAllowance) {
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
        if (!hasAllowance && buyInAmount && Number(buyInAmount) >= minBuyInAmount) {
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

        if (isLiveTicket && isEth) {
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
                const parlayAmmQuote = await fetchTicketAmmQuote(Number(buyInAmount));

                if (!mountedRef.current || !isSubscribed || !parlayAmmQuote) return null;

                if (!parlayAmmQuote.error) {
                    if (markets[0]?.live) {
                        setPayout(
                            (1 / totalQuote) *
                                Number(collateralHasLp ? buyInAmount : parlayAmmQuote.buyInAmountInDefaultCollateral)
                        );
                    } else {
                        const payout = coinFormatter(
                            parlayAmmQuote.payout,
                            networkId,
                            collateralHasLp ? selectedCollateral : undefined
                        );
                        setPayout(payout);
                        const amountsToBuy: number[] = (parlayAmmQuote.amountsToBuy || []).map((quote: BigNumber) =>
                            coinFormatter(quote, networkId, collateralHasLp ? selectedCollateral : undefined)
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
        Number(buyInAmount) < minBuyInAmount ||
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
                !collateralHasLp || isDefaultCollateral ? Number(buyInAmountInDefaultCollateral) : Number(buyInAmount),
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
            if (!signer) return;
            if (!multipleCollateral) return;
            if (!sportsAMMV2Contract) return;

            const referralId =
                walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase()
                    ? getReferralId()
                    : null;

            const tradeData = getTradeData(markets);
            const parsedTotalQuote = ethers.utils.parseEther(totalQuote.toString());
            const additionalSlippage = ethers.utils.parseEther('0.02');

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

    useEffect(() => {
        if (buyInAmountInDefaultCollateral > 0 && totalQuote > 0 && !HIDE_PARLAY_LEADERBOARD) {
            const buyInPow = Math.pow(buyInAmountInDefaultCollateral, 1 / 2);
            const minBuyInPow = 1;

            const basicPoints = 1 / totalQuote;
            const points = (1 / totalQuote) * (1 + 0.1 * markets.length) * buyInPow;
            const buyinBonus = buyInPow - minBuyInPow;
            const numberOfGamesBonus = 0.1 * markets.length;
            setLeaderBoardPoints({
                basicPoints,
                points,
                buyinBonus,
                numberOfGamesBonus,
            });

            const current = !!parlaysData ? parlaysData.findIndex((data) => data.points < points) : 0;
            if (parlaysData.length === 0) {
                setCurrentLeaderboardRank(1);
            } else {
                if (current === -1) {
                    setCurrentLeaderboardRank(parlaysData.length + 1);
                } else {
                    setCurrentLeaderboardRank(current + 1);
                }
            }
        }
    }, [buyInAmountInDefaultCollateral, totalQuote, markets.length, parlaysData]);

    const getPointsTooltip = () => (
        <TooltipContainer>
            <TooltipInfoContianer>
                <TooltipInfoLabel>{t(`parlay-leaderboard.ticket-info.basic-points-label`)}:</TooltipInfoLabel>
                <TooltipInfo>{formatCurrency(leaderboardPoints.basicPoints)}</TooltipInfo>
            </TooltipInfoContianer>
            <TooltipInfoContianer>
                <TooltipInfoLabel>{t(`parlay-leaderboard.ticket-info.buy-in-bonus-label`)}:</TooltipInfoLabel>
                <TooltipBonusInfo>{`+${formatPercentage(leaderboardPoints.buyinBonus, 0)}`}</TooltipBonusInfo>
            </TooltipInfoContianer>
            <TooltipInfoContianer>
                <TooltipInfoLabel>{t(`parlay-leaderboard.ticket-info.number-of-games-bonus-label`)}:</TooltipInfoLabel>
                <TooltipBonusInfo>{`+${formatPercentage(leaderboardPoints.numberOfGamesBonus, 0)}`}</TooltipBonusInfo>
            </TooltipInfoContianer>
            <TooltipFooter>
                <TooltipInfoContianer>
                    <TooltipInfoLabel>{t(`parlay-leaderboard.ticket-info.total-points-label`)}:</TooltipInfoLabel>
                    <TooltipInfo>{formatCurrency(leaderboardPoints.points)}</TooltipInfo>
                </TooltipInfoContianer>
            </TooltipFooter>
        </TooltipContainer>
    );

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
                {isThales && (
                    <RowContainer>
                        <SummaryLabel>{t('markets.parlay.total-bonus')}:</SummaryLabel>
                        <SummaryValue fontSize={12}>{formatPercentage(totalBonus.percentage)}</SummaryValue>
                        <SummaryValue isCurrency={true} isHidden={!!hidePayout} fontSize={12}>
                            (
                            {formatCurrencyWithSign('+ ' + USD_SIGN, totalBonus.value * selectedCollateralCurrencyRate)}
                            )
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
                                    setIsFreeBetActive(e.target.checked || false);
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
                        : isDefaultCollateral
                        ? formatCurrencyWithSign(USD_SIGN, Number(buyInAmount) + gas)
                        : `${formatCurrencyWithKey(
                              selectedCollateral,
                              Number(buyInAmount) + gas
                          )} (${formatCurrencyWithSign(USD_SIGN, Number(buyInAmountInDefaultCollateral) + gas)})`}
                </SummaryValue>
            </RowSummary>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.payout')}:</SummaryLabel>
                <SummaryValue isInfo={true}>
                    {hidePayout
                        ? '-'
                        : !collateralHasLp || isDefaultCollateral
                        ? formatCurrencyWithSign(USD_SIGN, payout)
                        : `${formatCurrencyWithKey(selectedCollateral, payout)} (${formatCurrencyWithSign(
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
                              collateralHasLp && !isDefaultCollateral
                                  ? formatCurrencyWithKey(selectedCollateral, payout - Number(buyInAmount) - gas)
                                  : formatCurrencyWithSign(
                                        USD_SIGN,
                                        payout - Number(buyInAmountInDefaultCollateral) - gas
                                    )
                          } (${formatPercentage(profitPercentage)})`}
                </SummaryValue>
            </RowSummary>
            {!HIDE_PARLAY_LEADERBOARD && (
                <>
                    <HorizontalLine />
                    <RowSummary>
                        <SummaryLabel>{t(`parlay-leaderboard.ticket-info.title`)}:</SummaryLabel>
                    </RowSummary>
                    <RowSummary>
                        <SummaryLabel>
                            {t(`parlay-leaderboard.ticket-info.points-label`)}
                            <Tooltip
                                overlay={<>{t(`parlay-leaderboard.ticket-info.points-tooltip`)}</>}
                                iconFontSize={14}
                                marginLeft={3}
                            />
                            :
                        </SummaryLabel>
                        <SummaryValue isCollateralInfo={true}>
                            {hidePayout || !isMinimumParlayGames ? (
                                '-'
                            ) : (
                                <>
                                    {`${formatCurrency(leaderboardPoints.basicPoints)}`}
                                    <SummaryValue isInfo={true}>{` + ${formatPercentage(
                                        leaderboardPoints.buyinBonus,
                                        0
                                    )} + ${formatPercentage(leaderboardPoints.numberOfGamesBonus, 0)}`}</SummaryValue>
                                    {` = ${formatCurrency(leaderboardPoints.points)}`}
                                    <Tooltip overlay={getPointsTooltip()} iconFontSize={14} marginLeft={3} />
                                </>
                            )}
                        </SummaryValue>
                    </RowSummary>
                    <RowSummary>
                        <SummaryLabel>
                            {t(`parlay-leaderboard.ticket-info.rank-label`)}
                            <Tooltip
                                overlay={<>{t(`parlay-leaderboard.ticket-info.rank-tooltip`)}</>}
                                iconFontSize={14}
                                marginLeft={3}
                            />
                            :
                        </SummaryLabel>
                        <SummaryValue isCollateralInfo={true}>
                            {hidePayout || !isMinimumParlayGames ? '-' : <>{`${currentLeaderboardRank}.`}</>}
                        </SummaryValue>
                    </RowSummary>
                    <RowSummary>
                        <SummaryLabel>
                            {t(`parlay-leaderboard.ticket-info.rewards-label`)}
                            <Tooltip
                                overlay={<>{t(`parlay-leaderboard.ticket-info.rewards-tooltip`)}</>}
                                iconFontSize={14}
                                marginLeft={3}
                            />
                            :
                        </SummaryLabel>
                        <SummaryValue isCollateralInfo={true}>
                            {hidePayout || !isMinimumParlayGames ? (
                                '-'
                            ) : (
                                <>
                                    {`${
                                        rewards[currentLeaderboardRank - 1] || 0
                                    } ${rewardsCurrency} (${formatCurrencyWithSign(
                                        USD_SIGN,
                                        (rewards[currentLeaderboardRank - 1] || 0) * rewardCurrencyRate,
                                        0
                                    )})`}
                                </>
                            )}
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
            <OverdropRowSummary margin="10px 0 0 0">
                <OverdropRowSummary
                    isClickable
                    onClick={() => {
                        setIsOverdropSummaryOpen(true);
                    }}
                >
                    <OverdropLabel>{t('markets.parlay.overdrop.overdrop-xp')}</OverdropLabel>
                    <OverdropValue>
                        {`~${formatPoints(overdropTotalXP)}`}
                        <Arrow className={'icon icon--caret-up'} />
                    </OverdropValue>
                </OverdropRowSummary>

                {isOverdropSummaryOpen && (
                    <OverdropSummary>
                        <OverdropSummaryTitle>{t('markets.parlay.overdrop.overdrop-xp-overview')}</OverdropSummaryTitle>
                        <OverdropRowSummary margin="0 20px">
                            <OverdropSummarySubtitle>{t('markets.parlay.overdrop.base-xp')}</OverdropSummarySubtitle>
                            <OverdropSummarySubvalue>{`${
                                (formatCurrency(buyInAmountInDefaultCollateral), 0)
                            } XP`}</OverdropSummarySubvalue>
                        </OverdropRowSummary>
                        <OverdropRowSummary margin="20px 20px">
                            <OverdropSummarySubheader>
                                {t('markets.parlay.overdrop.active-boost')}
                            </OverdropSummarySubheader>
                            <OverdropSummarySubheader>
                                {t('markets.parlay.overdrop.bonus-applied')}
                            </OverdropSummarySubheader>
                        </OverdropRowSummary>
                        {overdropMultipliers.map((multiplier) => (
                            <OverdropRowSummary margin="20px 20px" key={multiplier.name}>
                                <FlexDivCentered>
                                    <Circle active={true}>{multiplier.icon}</Circle>
                                    <OverdropSummarySubtitle>{multiplier.label}</OverdropSummarySubtitle>
                                </FlexDivCentered>
                                <OverdropSummarySubvalue>+{multiplier.multiplier}%</OverdropSummarySubvalue>
                            </OverdropRowSummary>
                        ))}
                        <div>
                            <ProgressLine
                                progress={65}
                                currentPoints={7374}
                                nextLevelPoints={8000}
                                level={6}
                                hideLevelLabel
                            />
                        </div>
                        <OverdropTotalsRow>
                            <FlexDivColumnCentered gap={10}>
                                <OverdropTotalsTitle>{t('markets.parlay.overdrop.total-xp-boost')}</OverdropTotalsTitle>
                                <OverdropTotal isBoost>
                                    +{overdropMultipliers.reduce((prev, curr) => prev + curr.multiplier, 0)}%
                                </OverdropTotal>
                            </FlexDivColumnCentered>
                            <FlexDivColumnCentered gap={10}>
                                <OverdropTotalsTitle>
                                    {t('markets.parlay.overdrop.total-xp-earned')}
                                </OverdropTotalsTitle>
                                <OverdropTotal>+{formatPoints(overdropTotalXP)}</OverdropTotal>
                            </FlexDivColumnCentered>
                        </OverdropTotalsRow>
                        <OverdropRowSummary
                            isClickable
                            onClick={() => {
                                setIsOverdropSummaryOpen(false);
                            }}
                        >
                            <OverdropValue>
                                <Arrow className={'icon icon--caret-down'} />
                            </OverdropValue>
                        </OverdropRowSummary>
                    </OverdropSummary>
                )}
            </OverdropRowSummary>
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
        </>
    );
};

const TooltipContainer = styled(FlexDivColumn)``;

const TooltipText = styled.span``;

const TooltipFooter = styled(FlexDivRow)`
    border-top: 1px solid ${(props) => props.theme.background.secondary};
    margin-top: 10px;
    padding-top: 8px;
`;

const TooltipInfoContianer = styled(FlexDiv)``;

const TooltipInfoLabel = styled(TooltipText)`
    margin-right: 4px;
`;

const TooltipInfo = styled(TooltipText)`
    font-weight: 600;
`;

const TooltipBonusInfo = styled(TooltipInfo)`
    color: ${(props) => props.theme.status.win};
`;

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

export default Ticket;

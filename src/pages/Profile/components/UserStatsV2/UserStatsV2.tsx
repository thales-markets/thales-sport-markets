import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERAL_ICONS_CLASS_NAMES, CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { SWAP_APPROVAL_BUFFER } from 'constants/markets';
import { secondsToMilliseconds } from 'date-fns';
import { BuyTicketStep } from 'enums/tickets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useInterval from 'hooks/useInterval';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { setStakingModalMuteEnd } from 'redux/modules/ui';
import { getIsBiconomy, getIsConnectedViaParticle } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import {
    bigNumberFormatter,
    coinParser,
    Coins,
    DEFAULT_CURRENCY_DECIMALS,
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    LONG_CURRENCY_DECIMALS,
} from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import biconomyConnector from 'utils/biconomyWallet';
import {
    getCollateral,
    getCollateralAddress,
    getCollaterals,
    isStableCurrency,
    isThalesCurrency,
    sortCollateralBalances,
} from 'utils/collaterals';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import {
    buildTxForApproveTradeWithRouter,
    buildTxForSwap,
    checkSwapAllowance,
    getQuote,
    getSwapParams,
    sendTransaction,
} from 'utils/swap';
import { delay } from 'utils/timer';
import { Address, getContract } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import InlineLoader from '../../../../components/InlineLoader';
import BuyStepsModal from '../../../Markets/Home/Parlay/components/BuyStepsModal';

type UserStatsProps = {
    setForceOpenStakingModal?: (forceOpenStakingModal: boolean) => void;
};

const UserStats: React.FC<UserStatsProps> = ({ setForceOpenStakingModal }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector(getIsAppReady);

    const isParticle = useSelector(getIsConnectedViaParticle);

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [buyInAmount, setBuyInAmount] = useState<number | string>('');
    const [isBuying, setIsBuying] = useState(false);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState(false);
    const [swappedThalesToReceive, setSwappedThalesToReceive] = useState(0);
    const [swapQuote, setSwapQuote] = useState(0);
    const [hasSwapAllowance, setHasSwapAllowance] = useState(false);
    const [buyStep, setBuyStep] = useState(BuyTicketStep.APPROVE_SWAP);
    const [openBuyStepsModal, setOpenBuyStepsModal] = useState(false);
    const [swapCollateralIndex, setSwapCollateralIndex] = useState(0);

    const swapCollateralArray = useMemo(
        () => getCollaterals(networkId).filter((collateral) => !isThalesCurrency(collateral)),
        [networkId]
    );
    const selectedCollateral = useMemo(() => getCollateral(networkId, swapCollateralIndex, swapCollateralArray), [
        networkId,
        swapCollateralArray,
        swapCollateralIndex,
    ]);
    const isStableCollateral = isStableCurrency(selectedCollateral);
    const collateralAddress = useMemo(() => getCollateralAddress(networkId, swapCollateralIndex, swapCollateralArray), [
        networkId,
        swapCollateralArray,
        swapCollateralIndex,
    ]);
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;

    const userStatsQuery = useUsersStatsV2Query(
        walletAddress?.toLowerCase(),
        { networkId, client },
        { enabled: isConnected }
    );
    const userStats = userStatsQuery.isSuccess && userStatsQuery.data ? userStatsQuery.data : undefined;

    const freeBetBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress?.toLowerCase(),
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const freeBetBalances =
        freeBetBalancesQuery.isSuccess && freeBetBalancesQuery.data ? freeBetBalancesQuery.data : undefined;

    const isFreeBetExists = freeBetBalances && !!Object.values(freeBetBalances).find((balance) => !!balance);

    const exchangeRatesQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const multiCollateralBalancesQuery = useMultipleCollateralBalanceQuery(
        walletAddress?.toLowerCase(),
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const multiCollateralBalances =
        multiCollateralBalancesQuery.isSuccess && multiCollateralBalancesQuery.data
            ? multiCollateralBalancesQuery.data
            : undefined;

    const getUSDForCollateral = useCallback(
        (collateral: Coins, freeBetBalance?: boolean) => {
            if (freeBetBalance)
                return (
                    (freeBetBalances ? freeBetBalances[collateral] : 0) *
                    (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0)
                );
            return (
                (multiCollateralBalances ? multiCollateralBalances[collateral] : 0) *
                (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0)
            );
        },

        [freeBetBalances, exchangeRates, multiCollateralBalances]
    );

    const freeBetCollateralsSorted = useMemo(() => {
        const sortedBalances = sortCollateralBalances(freeBetBalances, exchangeRates, networkId, 'desc');

        return sortedBalances;
    }, [exchangeRates, freeBetBalances, networkId]);

    const multiCollateralsSorted = useMemo(() => {
        const sortedBalances = sortCollateralBalances(multiCollateralBalances, exchangeRates, networkId, 'desc');

        return sortedBalances;
    }, [exchangeRates, multiCollateralBalances, networkId]);

    const thalesBalance = multiCollateralBalances ? multiCollateralBalances[CRYPTO_CURRENCY_MAP.THALES as Coins] : 0;
    const paymentTokenBalance: number = useMemo(() => {
        if (multiCollateralBalances) {
            return multiCollateralBalances[selectedCollateral];
        }
        return 0;
    }, [multiCollateralBalances, selectedCollateral]);

    const isAmountEntered = Number(buyInAmount) > 0;
    const insufficientBalance = Number(buyInAmount) > paymentTokenBalance || !paymentTokenBalance;
    const isButtonDisabled =
        isBuying || !isAmountEntered || insufficientBalance || !isConnected || swappedThalesToReceive === 0;

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    useEffect(() => {
        setIsAmountValid(
            Number(buyInAmount) === 0 || (Number(buyInAmount) > 0 && Number(buyInAmount) <= paymentTokenBalance)
        );
    }, [buyInAmount, paymentTokenBalance]);

    // Clear buyin and errors when network is changed
    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            setBuyInAmount('');
        } else {
            isMounted.current = true;
        }
    }, [dispatch, networkId]);

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
        if (buyInAmount) {
            const getSwapQuote = async () => {
                setIsFetching(true);
                const quote = await getQuote(networkId, swapToThalesParams);

                setSwappedThalesToReceive(quote);
                setSwapQuote(Number(buyInAmount) > 0 ? quote / Number(buyInAmount) : 0);
                setIsFetching(false);
            };

            getSwapQuote();
        } else {
            setSwappedThalesToReceive(0);
            setSwapQuote(0);
        }
    }, [buyInAmount, networkId, swapToThalesParams]);

    // Refresh swap THALES quote on 7s
    useInterval(
        async () => {
            if (!openBuyStepsModal /*&& !tooltipTextBuyInAmount*/) {
                const quote = await getQuote(networkId, swapToThalesParams);
                setSwappedThalesToReceive(quote);
                setSwapQuote(Number(buyInAmount) > 0 ? quote / Number(buyInAmount) : 0);
            }
        },
        buyInAmount ? secondsToMilliseconds(7) : null
    );

    const setMaxAmount = (value: string | number) => {
        const decimals = isStableCollateral ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS;
        setBuyInAmount(floorNumberToDecimals(Number(value), decimals));
    };

    // Reset buy step when collateral is changed
    useEffect(() => {
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
    }, [selectedCollateral]);

    // Check swap allowance
    useEffect(() => {
        if (isConnected && buyInAmount) {
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
    }, [walletAddress, isConnected, buyInAmount, networkId, selectedCollateral, swapToThalesParams.src, isBuying]);

    const handleBuyWithThalesSteps = async (
        initialStep: BuyTicketStep
    ): Promise<{ step: BuyTicketStep; thalesAmount: number }> => {
        let step = initialStep;
        let thalesAmount = swappedThalesToReceive;

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

                const balanceBefore = multiCollateralBalances
                    ? multiCollateralBalances[CRYPTO_CURRENCY_MAP.THALES as Coins]
                    : 0;
                const swapTxHash = swapRawTransaction ? await sendTransaction(swapRawTransaction) : undefined;

                if (swapTxHash) {
                    step = BuyTicketStep.COMPLETED;
                    setBuyStep(step);

                    await delay(3000); // wait for THALES balance to increase

                    const thalesTokenContract = getContract({
                        abi: multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins].abi,
                        address: multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins].addresses[
                            networkId
                        ] as Address,
                        client,
                    }) as ViemContract;

                    const balanceAfter = bigNumberFormatter(await thalesTokenContract?.read.balanceOf([walletAddress]));
                    thalesAmount = balanceAfter - balanceBefore;
                    setSwappedThalesToReceive(thalesAmount);
                }
            } catch (e) {
                console.log('Swap tx failed', e);
            }
        }

        return { step, thalesAmount };
    };

    const handleSubmit = async () => {
        setIsBuying(true);
        const toastId = toast.loading(t('market.toast-message.transaction-pending'));

        let step = buyStep;
        setOpenBuyStepsModal(true);
        ({ step } = await handleBuyWithThalesSteps(step));

        if (step !== BuyTicketStep.COMPLETED) {
            toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            setIsBuying(false);
            return;
        }
        setIsBuying(false);
        setOpenBuyStepsModal(false);
        setBuyInAmount('');
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
        toast.update(toastId, getSuccessToastOptions(t('profile.stats.swap-success')));
    };

    const getButton = (text: string, isDisabled: boolean) => {
        return (
            <Button
                backgroundColor={theme.button.background.quaternary}
                borderColor={theme.button.borderColor.secondary}
                height="24px"
                margin="10px 0 5px 0"
                padding="2px 40px"
                width="fit-content"
                fontSize="16px"
                fontWeight="800"
                lineHeight="16px"
                additionalStyles={additionalButtonStyles}
                onClick={async () => handleSubmit()}
                disabled={isDisabled}
            >
                {text}
            </Button>
        );
    };

    const getSubmitButton = () => {
        if (insufficientBalance) {
            return getButton(t(`common.errors.insufficient-balance`), true);
        }
        if (!isAmountEntered) {
            return getButton(t(`common.errors.enter-amount`), true);
        }

        return getButton(t('profile.stats.get-thales-label'), isButtonDisabled);
    };

    return (
        <>
            <Wrapper>
                <SectionWrapper>
                    <Header>
                        <ProfileIcon className="icon icon--profile3" />
                        {t('profile.stats.profile-data')}
                    </Header>
                    <Section>
                        <Label>{t('profile.stats.total-volume')}</Label>
                        <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.volume)}</Value>
                    </Section>
                    <Section>
                        <Label>{t('profile.stats.trades')}</Label>
                        <Value>{!userStats ? '-' : userStats.trades}</Value>
                    </Section>
                    <Section>
                        <Label>{t('profile.stats.highest-win')}</Label>
                        <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.highestWin)}</Value>
                    </Section>
                    <Section>
                        <Label>{t('profile.stats.lifetime-wins')}</Label>
                        <Value>{!userStats ? '-' : userStats.lifetimeWins}</Value>
                    </Section>
                </SectionWrapper>
                {isFreeBetExists && (
                    <SectionWrapper>
                        <SubHeaderWrapper>
                            <SubHeader>
                                <SubHeaderIcon className="icon icon--gift" />
                                {t('profile.stats.free-bet')}
                            </SubHeader>
                        </SubHeaderWrapper>
                        {freeBetBalances &&
                            Object.keys(freeBetCollateralsSorted).map((currencyKey) => {
                                return freeBetBalances[currencyKey] ? (
                                    <Section key={`${currencyKey}-freebet`}>
                                        <SubLabel>
                                            <CurrencyIcon
                                                className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]}
                                            />
                                            {currencyKey}
                                        </SubLabel>
                                        <SubValue>
                                            {formatCurrencyWithSign(
                                                null,
                                                freeBetBalances ? freeBetBalances[currencyKey] : 0
                                            )}
                                            {!exchangeRates?.[currencyKey] && !isStableCurrency(currencyKey as Coins)
                                                ? '...'
                                                : ` (${formatCurrencyWithSign(
                                                      USD_SIGN,
                                                      getUSDForCollateral(currencyKey as Coins, true)
                                                  )})`}
                                        </SubValue>
                                    </Section>
                                ) : (
                                    <Fragment key={`${currencyKey}-freebet`} />
                                );
                            })}
                    </SectionWrapper>
                )}
                {multiCollateralBalances && (
                    <SectionWrapper>
                        <SubHeaderWrapper>
                            <SubHeader>
                                <SubHeaderIcon className="icon icon--wallet-connected" />
                                {t('profile.stats.wallet')}
                            </SubHeader>
                        </SubHeaderWrapper>
                        {freeBetBalances &&
                            Object.keys(multiCollateralsSorted).map((currencyKey) => {
                                return multiCollateralBalances[currencyKey as Coins] ? (
                                    <Section key={currencyKey}>
                                        <SubLabel>
                                            <CurrencyIcon
                                                className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]}
                                            />
                                            {currencyKey}
                                        </SubLabel>
                                        <SubValue>
                                            {formatCurrencyWithSign(
                                                null,
                                                multiCollateralBalances
                                                    ? multiCollateralBalances[currencyKey as Coins]
                                                    : 0
                                            )}
                                            {!exchangeRates?.[currencyKey] && !isStableCurrency(currencyKey as Coins)
                                                ? '...'
                                                : ` (${formatCurrencyWithSign(
                                                      USD_SIGN,
                                                      getUSDForCollateral(currencyKey as Coins)
                                                  )})`}
                                        </SubValue>
                                    </Section>
                                ) : (
                                    <Fragment key={currencyKey} />
                                );
                            })}
                    </SectionWrapper>
                )}
            </Wrapper>
            <Wrapper>
                <SectionWrapper>
                    <SubHeaderWrapper>
                        <SubHeader>
                            <SubHeaderIcon className="icon icon--wallet-connected" />
                            {t('profile.stats.wallet')}
                        </SubHeader>
                    </SubHeaderWrapper>
                    {freeBetBalances &&
                        Object.keys(multiCollateralsSorted).map((currencyKey) => {
                            return multiCollateralBalances && multiCollateralBalances[currencyKey as Coins] ? (
                                <Section key={currencyKey}>
                                    <SubLabel>
                                        <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]} />
                                        {currencyKey}
                                    </SubLabel>
                                    <SubValue>
                                        {formatCurrencyWithSign(
                                            null,
                                            multiCollateralBalances ? multiCollateralBalances[currencyKey as Coins] : 0
                                        )}
                                        {!exchangeRates?.[currencyKey] && !isStableCurrency(currencyKey as Coins)
                                            ? '...'
                                            : ` (${formatCurrencyWithSign(
                                                  USD_SIGN,
                                                  getUSDForCollateral(currencyKey as Coins)
                                              )})`}
                                    </SubValue>
                                </Section>
                            ) : (
                                <></>
                            );
                        })}
                    <Title>{t('profile.stats.buy-thales-title')}</Title>
                    <InputContainer ref={inputRef}>
                        <NumericInput
                            value={buyInAmount}
                            onChange={(e) => {
                                setBuyInAmount(e.target.value);
                            }}
                            showValidation={inputRefVisible && !isAmountValid}
                            validationMessage={t('common.errors.insufficient-balance-wallet', {
                                currencyKey: selectedCollateral,
                            })}
                            inputFontWeight="600"
                            inputPadding="5px 10px"
                            borderColor={theme.input.borderColor.tertiary}
                            disabled={isBuying}
                            label={t('profile.stats.swap-to-thales-label')}
                            placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                            currencyComponent={
                                <CollateralSelector
                                    collateralArray={swapCollateralArray}
                                    selectedItem={swapCollateralIndex}
                                    onChangeCollateral={(index: number) => {
                                        setBuyInAmount('');
                                        setSwapCollateralIndex(index);
                                    }}
                                    isDetailedView
                                    collateralBalances={multiCollateralBalances}
                                    exchangeRates={exchangeRates}
                                    dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                    preventPaymentCollateralChange
                                />
                            }
                            balance={formatCurrencyWithKey(selectedCollateral, paymentTokenBalance)}
                            onMaxButton={() => setMaxAmount(paymentTokenBalance)}
                        />
                    </InputContainer>
                    <Section>
                        <SubLabel>{t('profile.stats.thales-price-label')}:</SubLabel>
                        <Value>
                            {isFetching ? (
                                <InlineLoader />
                            ) : Number(swapQuote) === 0 ? (
                                '-'
                            ) : (
                                formatCurrencyWithKey(selectedCollateral, 1 / swapQuote)
                            )}
                        </Value>
                    </Section>
                    <Section>
                        <SubLabel>{t('profile.stats.thales-to-receive')}:</SubLabel>
                        <Value>
                            {isFetching ? (
                                <InlineLoader />
                            ) : swappedThalesToReceive === 0 ? (
                                '-'
                            ) : (
                                formatCurrency(swappedThalesToReceive)
                            )}
                        </Value>
                    </Section>
                    {getSubmitButton()}
                </SectionWrapper>
                {openBuyStepsModal && (
                    <BuyStepsModal
                        step={(buyStep as unknown) as BuyTicketStep}
                        isFailed={!isBuying}
                        currencyKey={selectedCollateral}
                        onSubmit={handleSubmit}
                        onClose={() => setOpenBuyStepsModal(false)}
                        onlySwap={true}
                    />
                )}
            </Wrapper>
            {!isParticle && thalesBalance > 1 && (
                <Wrapper>
                    <SectionWrapper>
                        <Title>{t('profile.stats.stake-title')}</Title>
                        <Section>
                            <SubLabel>
                                <CurrencyIcon
                                    className={COLLATERAL_ICONS_CLASS_NAMES[CRYPTO_CURRENCY_MAP.THALES as Coins]}
                                />
                                {CRYPTO_CURRENCY_MAP.THALES}
                            </SubLabel>
                            <SubValue>{formatCurrency(thalesBalance)}</SubValue>
                        </Section>
                        <Button
                            backgroundColor={theme.button.textColor.tertiary}
                            borderColor={theme.button.textColor.tertiary}
                            height="24px"
                            margin="10px 0 5px 0"
                            padding="2px 40px"
                            width="fit-content"
                            fontSize="16px"
                            fontWeight="800"
                            lineHeight="16px"
                            additionalStyles={additionalButtonStyles}
                            onClick={() => {
                                setForceOpenStakingModal ? setForceOpenStakingModal(true) : '';
                                dispatch(setStakingModalMuteEnd(0));
                            }}
                        >
                            {t('profile.stats.stake-label')}
                        </Button>
                        <Description>
                            <Trans
                                i18nKey={'profile.stats.weekly-rewards'}
                                components={{
                                    stakingPageLink: (
                                        <StakingPageLink
                                            href={'https://www.thales.io/token/staking'}
                                            target="_blank"
                                            rel="noreferrer"
                                        />
                                    ),
                                }}
                            />
                        </Description>
                    </SectionWrapper>
                </Wrapper>
            )}
        </>
    );
};

const Header = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.septenary};
    text-transform: uppercase;
    padding: 15px 0;
    justify-content: center;
    align-items: center;
`;

const Description = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    line-height: 15px;
    font-weight: 500;
    text-align: center;
    margin: 10px 0;
`;

const Title = styled(Description)``;

const Wrapper = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.quinary};
    border-radius: 5px;
    width: 100%;
    padding: 10px 15px 15px 15px;
    gap: 4px;
    flex: initial;
    margin-bottom: 8px;
`;

const Section = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Label = styled.span`
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

const SubLabel = styled(Label)`
    font-weight: 400;
    text-transform: none;
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.status.win};
    margin-left: auto;
`;

const SubValue = styled(Value)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const ProfileIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => props.theme.textColor.septenary};
`;

const SubHeaderIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
`;

const SubHeaderWrapper = styled(FlexDivRow)`
    &::after,
    &:before {
        display: inline-block;
        content: '';
        border-top: 2px solid ${(props) => props.theme.borderColor.senary};
        width: 100%;
        margin-top: 40px;
        transform: translateY(-1rem);
    }
`;

const SubHeader = styled(Header)`
    width: 300px;
`;

const CurrencyIcon = styled.i`
    font-size: 20px !important;
    margin: 0 3px 3px 3px;
    font-weight: 400 !important;
    text-transform: none !important;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const SectionWrapper = styled(FlexDivColumnCentered)`
    width: 100%;
`;

const StakingPageLink = styled.a`
    color: ${(props) => props.theme.link.textColor.primary};
    &:hover {
        text-decoration: underline;
    }
`;

const additionalButtonStyles = {
    alignSelf: 'center',
};

const InputContainer = styled(FlexDiv)`
    margin-top: 10px;
    margin-bottom: 5px;
`;

export default UserStats;

import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import Modal from 'components/Modal';
import SimpleLoader from 'components/SimpleLoader';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { SWAP_APPROVAL_BUFFER } from 'constants/markets';
import { ContractType } from 'enums/contract';
import { BuyTicketStep } from 'enums/tickets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { t } from 'i18next';
import BuyStepsModal from 'pages/Markets/Home/Parlay/components/BuyStepsModal';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { CloseIcon, FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { coinParser, Coins, formatCurrency, formatCurrencyWithKey, formatCurrencyWithPrecision } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { convertCollateralToStable, getCollateralAddress, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { checkAllowance } from 'utils/network';
import { sendBiconomyTransaction } from 'utils/smartAccount/biconomy/biconomy';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import {
    buildTxForApproveTradeWithRouter,
    buildTxForSwap,
    getQuote,
    getSwapParams,
    PARASWAP_TRANSFER_PROXY,
    sendTransaction,
} from 'utils/swap';
import { delay } from 'utils/timer';
import { Address } from 'viem';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type SwapModalProps = {
    onClose: () => void;
    preSelectedToken?: number;
};

enum SIDE {
    FROM = 'from',
    TO = 'to',
}

const SwapModal: React.FC<SwapModalProps> = ({ onClose, preSelectedToken }) => {
    const theme = useTheme();
    const networkId = useChainId();
    const { address, isConnected } = useAccount();
    const client = useClient();
    const walletClient = useWalletClient();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [fromToken, setFromToken] = useState<Coins>(
        preSelectedToken ? getCollaterals(networkId)[preSelectedToken] : 'USDC'
    );
    const [fromAmount, setFromAmount] = useState<string | number>('');

    const [toToken, setToToken] = useState<Coins>('OVER');
    const [toAmount, setToAmount] = useState<string | number>('');

    const [activeSide, setActiveSide] = useState<SIDE>(SIDE.FROM);

    const requestId = useRef(0);
    const lastFetched = useRef<{ side: SIDE | null; value: string | null; from: string | null; to: string | null }>({
        side: null,
        value: null,
        from: null,
        to: null,
    });

    const [isBuying, setIsBuying] = useState(false);

    const [buyStep, setBuyStep] = useState(BuyTicketStep.APPROVE_SWAP);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState(false);

    const [swapQuote, setSwapQuote] = useState(0);
    const [hasSwapAllowance, setHasSwapAllowance] = useState(false);
    const [openBuyStepsModal, setOpenBuyStepsModal] = useState(false);

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const multiCollateralBalances =
        multipleCollateralBalancesQuery.isSuccess && multipleCollateralBalancesQuery.data
            ? multipleCollateralBalancesQuery.data
            : undefined;

    const tokenBalance: { fromTokenBalance: number; toTokenBalance: number } = useMemo(() => {
        if (multiCollateralBalances) {
            return {
                fromTokenBalance: multiCollateralBalances[fromToken],
                toTokenBalance: multiCollateralBalances[toToken],
            };
        }
        return {
            fromTokenBalance: 0,
            toTokenBalance: 0,
        };
    }, [multiCollateralBalances, fromToken, toToken]);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const swapParams = useMemo(
        () =>
            getSwapParams(
                networkId,
                walletAddress as Address,
                coinParser(fromAmount.toString(), networkId, fromToken),
                getCollateralAddress(networkId, getCollateralIndex(networkId, fromToken)),
                getCollateralAddress(networkId, getCollateralIndex(networkId, toToken))
            ),
        [fromAmount, fromToken, toToken, networkId, walletAddress]
    );

    useDebouncedEffect(() => {
        const amount = activeSide === SIDE.FROM ? fromAmount : toAmount;

        if (!amount || Number(amount) === 0) {
            setFromAmount((prev) => (activeSide === SIDE.FROM ? prev : ''));
            setToAmount((prev) => (activeSide === SIDE.TO ? prev : ''));

            return;
        }

        if (
            lastFetched.current.side === activeSide &&
            lastFetched.current.value === amount &&
            lastFetched.current.from === fromToken &&
            lastFetched.current.to === toToken
        )
            return;
        lastFetched.current = { side: activeSide, value: '' + amount, from: fromToken, to: toToken };

        const id = ++requestId.current;
        setIsFetching(true);

        (async () => {
            try {
                if (activeSide === SIDE.FROM) {
                    const quote = await getQuote(networkId, swapParams, toToken);
                    if (id !== requestId.current) return; // stale

                    setToAmount(formatCurrencyWithPrecision(quote));
                    setSwapQuote(Number(fromAmount) > 0 ? quote / Number(fromAmount) : 0);
                } else {
                    const quote = await getQuote(
                        networkId,
                        getSwapParams(
                            networkId,
                            walletAddress as Address,
                            coinParser(toAmount.toString(), networkId, toToken),
                            getCollateralAddress(networkId, getCollateralIndex(networkId, toToken)),
                            getCollateralAddress(networkId, getCollateralIndex(networkId, fromToken))
                        ),
                        fromToken
                    );
                    if (id !== requestId.current) return; // stale
                    setFromAmount(quote);
                }
            } finally {
                if (id === requestId.current) setIsFetching(false);
            }
        })();
    }, [activeSide, fromAmount, toAmount, networkId, swapParams, toToken, fromToken]);

    // Check swap allowance
    useEffect(() => {
        if (isConnected && fromAmount) {
            if (fromToken !== 'ETH') {
                const getSwapAllowance = async () => {
                    const collateralContractWithSigner = getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        { client, networkId },
                        getCollateralIndex(networkId, fromToken)
                    );
                    const allowance = await checkAllowance(
                        coinParser(fromAmount.toString(), networkId, fromToken),
                        collateralContractWithSigner,
                        walletAddress,
                        PARASWAP_TRANSFER_PROXY
                    );

                    setHasSwapAllowance(allowance);
                };

                getSwapAllowance();
            }
        }
    }, [walletAddress, isConnected, fromAmount, networkId, fromToken, isBuying, client]);

    // Reset buy step when collateral is changed
    useEffect(() => {
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
    }, [fromToken]);

    useEffect(() => {
        setIsAmountValid(
            Number(fromAmount) === 0 || (Number(fromAmount) > 0 && Number(fromAmount) <= tokenBalance.fromTokenBalance)
        );
    }, [fromAmount, tokenBalance.fromTokenBalance]);

    // Reset buy step when collateral is changed
    useEffect(() => {
        setSwapQuote(0);
    }, [toToken]);

    const handleBuyWithThalesSteps = async (
        initialStep: BuyTicketStep
    ): Promise<{ step: BuyTicketStep; amount: number | string }> => {
        let step = initialStep;
        toAmount;

        if (step <= BuyTicketStep.SWAP) {
            if (!hasSwapAllowance && fromToken !== 'ETH') {
                if (step !== BuyTicketStep.APPROVE_SWAP) {
                    step = BuyTicketStep.APPROVE_SWAP;
                    setBuyStep(BuyTicketStep.APPROVE_SWAP);
                }

                const approveAmount = coinParser(
                    (Number(fromAmount) * (1 + SWAP_APPROVAL_BUFFER)).toString(),
                    networkId,
                    fromToken
                );
                const approveSwapRawTransaction = await buildTxForApproveTradeWithRouter(
                    networkId,
                    getCollateralAddress(networkId, getCollateralIndex(networkId, fromToken)),
                    walletClient.data,
                    approveAmount.toString()
                );

                try {
                    const approveTxHash = isBiconomy
                        ? await sendBiconomyTransaction({
                              networkId,
                              transaction: approveSwapRawTransaction,
                              collateralAddress: getCollateralAddress(
                                  networkId,
                                  getCollateralIndex(networkId, fromToken)
                              ),
                          })
                        : await sendTransaction(approveSwapRawTransaction);

                    if (approveTxHash) {
                        await delay(3000); // wait for PARASAWAP API to read correct approval
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
                const swapRawTransaction = (await buildTxForSwap(networkId, swapParams, walletAddress)).tx;

                // check allowance again
                if (!swapRawTransaction) {
                    await delay(1800);
                    const hasRefreshedAllowance = await checkAllowance(
                        coinParser(fromAmount.toString(), networkId, fromToken),
                        getCollateralAddress(networkId, getCollateralIndex(networkId, fromToken)),
                        walletAddress,
                        PARASWAP_TRANSFER_PROXY
                    );
                    if (!hasRefreshedAllowance) {
                        step = BuyTicketStep.APPROVE_SWAP;
                        setBuyStep(step);
                    }
                }

                const swapTxHash = swapRawTransaction
                    ? isBiconomy
                        ? await sendBiconomyTransaction({
                              networkId,
                              transaction: swapRawTransaction,
                              collateralAddress: getCollateralAddress(
                                  networkId,
                                  getCollateralIndex(networkId, fromToken)
                              ),
                          })
                        : await sendTransaction(swapRawTransaction)
                    : undefined;

                if (swapTxHash) {
                    step = BuyTicketStep.COMPLETED;
                    setBuyStep(step);

                    await delay(3000); // wait for OVER balance to increase
                }
            } catch (e) {
                console.log('Swap tx failed', e);
            }
        }

        return { step, amount: toAmount };
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
        toast.update(
            toastId,
            getSuccessToastOptions(
                t('profile.stats.swap-success', {
                    fromAmount: formatCurrency(fromAmount, 4),
                    fromToken: fromToken,
                    toAmount: formatCurrency(toAmount, 2),
                    toToken: toToken,
                })
            )
        );
        setFromAmount('');
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
    };

    const getButton = (text: string, isDisabled: boolean) => {
        return (
            <Button
                margin="10px 0 0 0"
                width="100%"
                height="44px"
                fontSize="16px"
                backgroundColor={theme.background.quaternary}
                borderRadius="8px"
                borderColor={theme.borderColor.quaternary}
                textColor={theme.textColor.tertiary}
                additionalStyles={{
                    alignSelf: 'center',
                }}
                onClick={async () => handleSubmit()}
                disabled={isDisabled}
            >
                {text}
            </Button>
        );
    };

    const isAmountEntered = Number(fromAmount) > 0;
    const insufficientBalance = Number(fromAmount) > tokenBalance.fromTokenBalance || !tokenBalance.fromTokenBalance;
    const isButtonDisabled = isBuying || !isAmountEntered || insufficientBalance || !isConnected || toAmount === 0;

    const getSubmitButton = () => {
        if (insufficientBalance) {
            return getButton(t(`common.errors.insufficient-balance`), true);
        }
        if (!isAmountEntered) {
            return getButton(t(`common.errors.enter-amount`), true);
        }

        if (isFetching) {
            return getButton(t('profile.swap.fetching'), true);
        }

        return getButton(t('profile.swap.swap', { token: toToken }), isButtonDisabled);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const fromCollaterals = getCollaterals(networkId);

    const quotePrice = useMemo(() => {
        if (swapQuote === 0) {
            return '-';
        }

        return formatCurrencyWithKey(
            USD_SIGN,
            convertCollateralToStable(fromToken, 1 / swapQuote, exchangeRates ? exchangeRates[fromToken] : 0)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [swapQuote]);

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 1000,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                border: 'none',
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Wrapper>
                <FlexDivRow>
                    <Title>
                        <Trans
                            i18nKey="profile.swap.title"
                            components={{
                                icon: <OvertimeIcon className="icon icon--overtime" />,
                            }}
                        />
                    </Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </FlexDivRow>
                <Note>{t('profile.swap.note')}</Note>
                <Inputs>
                    <InputContainer ref={inputRef}>
                        <NumericInput
                            value={fromAmount}
                            onChange={(e) => {
                                setActiveSide(SIDE.FROM);
                                setFromAmount(e.target.value);
                            }}
                            showValidation={inputRefVisible && !isAmountValid}
                            validationMessage={t('common.errors.insufficient-balance-wallet', {
                                currencyKey: fromToken,
                            })}
                            disabled={isBuying}
                            label="from"
                            inputFontWeight="700"
                            height="44px"
                            inputFontSize="16px"
                            background={theme.background.quinary}
                            borderColor={theme.background.quinary}
                            fontWeight="700"
                            color={theme.textColor.primary}
                            width="100%"
                            placeholder={t('common.enter-amount')}
                            currencyComponent={
                                <CollateralSelector
                                    borderColor="none"
                                    collateralArray={fromCollaterals}
                                    selectedItem={fromCollaterals.indexOf(fromToken as any)}
                                    onChangeCollateral={(index: number) => {
                                        if (toToken === fromCollaterals[index]) {
                                            const toTokenLocal = toToken;
                                            setToToken(fromToken);
                                            setFromToken(toTokenLocal);
                                        } else {
                                            setFromAmount('');
                                            setFromToken(fromCollaterals[index]);
                                        }
                                    }}
                                    isDetailedView
                                    collateralBalances={multiCollateralBalances}
                                    exchangeRates={exchangeRates}
                                    dropDownWidth={Number(inputRef.current?.getBoundingClientRect().width) + 'px'}
                                    background={theme.background.quinary}
                                    color={theme.textColor.primary}
                                    topPosition="50px"
                                    hideZeroBalance
                                    rightPosition="-8px"
                                />
                            }
                            balance={formatCurrencyWithKey(fromToken, tokenBalance.fromTokenBalance)}
                            onMaxButton={() => setFromAmount(tokenBalance.fromTokenBalance)}
                        />
                    </InputContainer>
                    <ExchangeIcon
                        onClick={() => {
                            const toTokenLocal = toToken;
                            setToToken(fromToken);
                            setFromToken(toTokenLocal);
                        }}
                        className="icon icon--exchange"
                    />
                    <InputContainer>
                        <NumericInput
                            value={toAmount}
                            onChange={(e) => {
                                setActiveSide(SIDE.TO);
                                setToAmount(e.target.value);
                            }}
                            label="to"
                            inputFontWeight="700"
                            height="44px"
                            inputFontSize="16px"
                            background={theme.background.quinary}
                            borderColor={theme.background.quinary}
                            placeholder={t('common.enter-amount')}
                            fontWeight="700"
                            color={theme.textColor.primary}
                            width="100%"
                            currencyComponent={
                                <CollateralSelector
                                    borderColor="none"
                                    collateralArray={fromCollaterals}
                                    selectedItem={fromCollaterals.indexOf(toToken as any)}
                                    onChangeCollateral={(index: number) => {
                                        if (fromToken === fromCollaterals[index]) {
                                            const toTokenLocal = toToken;
                                            setToToken(fromToken);
                                            setFromToken(toTokenLocal);
                                        } else setToToken(fromCollaterals[index]);
                                    }}
                                    collateralBalances={multiCollateralBalances}
                                    isDetailedView
                                    exchangeRates={exchangeRates}
                                    dropDownWidth={Number(inputRef.current?.getBoundingClientRect().width) + 'px'}
                                    background={theme.background.quinary}
                                    color={theme.textColor.primary}
                                    topPosition="50px"
                                    rightPosition="-8px"
                                />
                            }
                            balance={formatCurrencyWithKey(toToken, tokenBalance.toTokenBalance)}
                        />
                    </InputContainer>
                </Inputs>

                <InfoBox>
                    <Section>
                        <SubLabel>{t('profile.swap.token-price', { token: toToken })}:</SubLabel>
                        {isFetching ? (
                            <LoaderContainer>
                                <SimpleLoader size={16} strokeWidth={6} />
                            </LoaderContainer>
                        ) : (
                            <Value>{quotePrice}</Value>
                        )}
                    </Section>
                    <Section>
                        <SubLabel>{t('profile.swap.token-to-receive', { token: toToken })}:</SubLabel>
                        {isFetching ? (
                            <LoaderContainer>
                                <SimpleLoader size={16} strokeWidth={6} />
                            </LoaderContainer>
                        ) : (
                            <Value>{toAmount === 0 ? '-' : formatCurrency(toAmount)}</Value>
                        )}
                    </Section>
                </InfoBox>
                {getSubmitButton()}
                {openBuyStepsModal && (
                    <BuyStepsModal
                        fromAmount={Number(fromAmount)}
                        toAmount={Number(toAmount)}
                        step={(buyStep as unknown) as BuyTicketStep}
                        isFailed={!isBuying}
                        currencyKey={fromToken}
                        dstToken={toToken}
                        onSubmit={handleSubmit}
                        onClose={() => setOpenBuyStepsModal(false)}
                        onlySwap={true}
                    />
                )}
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 420px;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

const InputContainer = styled(FlexDiv)`
    position: relative;
    width: 100%;

    border-radius: 8px;
    padding: 12px 8px;
    padding-top: 20px;
    background: ${(props) => props.theme.background.quinary};
`;

const InfoBox = styled(FlexDivColumn)<{ disabled?: boolean }>`
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
    padding: 14px;
    gap: 10px;
    width: 100%;
    cursor: pointer;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    margin-top: 28px;
    margin-bottom: 0;
`;

const ExchangeIcon = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    transform: rotate(90deg);
    font-size: 34px;
    margin: auto;
    width: 34px;
    cursor: pointer;
`;

const LoaderContainer = styled.div`
    position: relative;
    width: 16px;
    margin-left: auto;
`;

const Title = styled.h1`
    margin-top: 10px;
    font-size: 25px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    text-transform: uppercase;
`;

const Section = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Label = styled.span`
    display: flex;
    align-items: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

const SubLabel = styled(Label)`
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    text-transform: none;
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.025em;
    margin-left: auto;
    color: ${(props) => props.theme.textColor.secondary};
`;

const OvertimeIcon = styled.i`
    font-size: 130px;
    font-weight: 400;
    line-height: 28px;
    margin-top: -4px;
`;

const Note = styled.div`
    color: ${(props) => props.theme.textColor.secondary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        font-size: 14px;
    }
`;

const Inputs = styled(FlexDivColumn)`
    margin-top: 30px;
    margin-bottom: 40px;
    gap: 16px;
`;

export default SwapModal;

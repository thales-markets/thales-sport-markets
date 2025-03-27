import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import Modal from 'components/Modal';
import SimpleLoader from 'components/SimpleLoader';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { SWAP_APPROVAL_BUFFER } from 'constants/markets';
import { ContractType } from 'enums/contract';
import { BuyTicketStep } from 'enums/tickets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { t } from 'i18next';
import BuyStepsModal from 'pages/Markets/Home/Parlay/components/BuyStepsModal';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { CloseIcon, FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { coinParser, Coins, formatCurrency, formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { sendBiconomyTransaction } from 'utils/biconomy';
import { getCollateralAddress, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { checkAllowance } from 'utils/network';
import {
    buildTxForApproveTradeWithRouter,
    buildTxForSwap,
    getQuote,
    getSwapParams,
    PARASWAP_TRANSFER_PROXY,
    sendTransaction,
} from 'utils/swap';
import { delay } from 'utils/timer';
import useBiconomy from 'utils/useBiconomy';
import { Address } from 'viem';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type FundModalProps = {
    onClose: () => void;
    preSelectedToken?: number;
};

const SwapModal: React.FC<FundModalProps> = ({ onClose, preSelectedToken }) => {
    const theme = useTheme();
    const networkId = useChainId();
    const { address, isConnected } = useAccount();
    const client = useClient();
    const walletClient = useWalletClient();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const [fromToken, setFromToken] = useState<Coins>(
        preSelectedToken ? getCollaterals(networkId)[preSelectedToken] : 'USDC'
    );
    const [fromAmount, setFromAmount] = useState<string | number>('');

    const [toToken] = useState<Coins>('OVER');
    const [toAmount, setToAmount] = useState<string | number>('');

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

    // Set THALES swap receive
    useDebouncedEffect(() => {
        if (fromAmount) {
            const getSwapQuote = async () => {
                setIsFetching(true);
                const quote = await getQuote(networkId, swapParams);

                setToAmount(quote);
                setSwapQuote(Number(fromAmount) > 0 ? quote / Number(fromAmount) : 0);
                setIsFetching(false);
            };

            getSwapQuote();
        } else {
            setToAmount(0);
            setSwapQuote(0);
        }
    }, [fromAmount, networkId, swapParams]);

    // Check swap allowance
    useEffect(() => {
        if (isConnected && fromAmount) {
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
    }, [walletAddress, isConnected, fromAmount, networkId, fromToken, isBuying, client]);

    // Reset buy step when collateral is changed
    useEffect(() => {
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
    }, [fromToken]);

    const handleBuyWithThalesSteps = async (
        initialStep: BuyTicketStep
    ): Promise<{ step: BuyTicketStep; amount: number | string }> => {
        let step = initialStep;
        toAmount;

        if (step <= BuyTicketStep.SWAP) {
            if (!hasSwapAllowance) {
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

                    await delay(3000); // wait for THALES balance to increase
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
        setFromAmount('');
        setBuyStep(BuyTicketStep.APPROVE_SWAP);
        toast.update(
            toastId,
            getSuccessToastOptions(
                t('profile.stats.swap-success', { amount: formatCurrency(toAmount, 4), token: toToken })
            )
        );
    };

    const getButton = (text: string, isDisabled: boolean) => {
        return (
            <Button
                backgroundColor={theme.button.background.quaternary}
                borderColor={theme.button.borderColor.secondary}
                height="48px"
                padding="2px 40px"
                width="100%"
                fontSize="16px"
                fontWeight="700"
                lineHeight="16px"
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

        return getButton(t('profile.swap.swap', { token: toToken }), isButtonDisabled);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    const fromCollaterals = getCollaterals(networkId).filter((coin) => coin !== 'OVER');

    useEffect(() => {
        setIsAmountValid(
            Number(fromAmount) === 0 || (Number(fromAmount) > 0 && Number(fromAmount) <= tokenBalance.fromTokenBalance)
        );
    }, [fromAmount, tokenBalance.fromTokenBalance]);

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
                    <Title>{t('profile.swap.title')}</Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </FlexDivRow>
                <InputContainer ref={inputRef}>
                    <NumericInput
                        value={fromAmount}
                        onChange={(e) => {
                            setFromAmount(e.target.value);
                        }}
                        showValidation={inputRefVisible && !isAmountValid}
                        validationMessage={t('common.errors.insufficient-balance-wallet', {
                            currencyKey: fromToken,
                        })}
                        disabled={isBuying}
                        label="from"
                        inputFontWeight="700"
                        inputPadding="5px 10px"
                        height="44px"
                        inputFontSize="16px"
                        background={theme.textColor.primary}
                        borderColor="none"
                        fontWeight="700"
                        color={theme.textColor.tertiary}
                        placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                        currencyComponent={
                            <CollateralSelector
                                borderColor="none"
                                collateralArray={fromCollaterals}
                                selectedItem={fromCollaterals.indexOf(fromToken as any)}
                                onChangeCollateral={(index: number) => {
                                    setFromAmount('');
                                    setFromToken(fromCollaterals[index]);
                                }}
                                isDetailedView
                                collateralBalances={multiCollateralBalances}
                                exchangeRates={exchangeRates}
                                background={theme.textColor.primary}
                                color={theme.textColor.tertiary}
                                topPosition="50px"
                                hideZeroBalance
                            />
                        }
                        balance={formatCurrencyWithKey(fromToken, tokenBalance.fromTokenBalance)}
                        onMaxButton={() => setFromAmount(tokenBalance.fromTokenBalance)}
                    />
                </InputContainer>
                <NumericInput
                    value={toAmount}
                    onChange={(e) => {
                        setToAmount(Number(e.target.value) === 0 ? '' : Number(e.target.value));
                    }}
                    inputFontWeight="700"
                    inputPadding="5px 10px"
                    height="44px"
                    inputFontSize="16px"
                    background={theme.textColor.primary}
                    borderColor="none"
                    fontWeight="700"
                    color={theme.textColor.tertiary}
                    placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                    currencyComponent={
                        <CollateralSelector
                            borderColor="none"
                            collateralArray={getCollaterals(networkId)}
                            selectedItem={getCollateralIndex(networkId, toToken)}
                            onChangeCollateral={() => {}}
                            isDetailedView
                            collateralBalances={multiCollateralBalances}
                            exchangeRates={exchangeRates}
                            background={theme.textColor.primary}
                            color={theme.textColor.tertiary}
                            topPosition="50px"
                            disabled
                        />
                    }
                    label="To"
                />

                <InfoBox>
                    <Section>
                        <SubLabel>{t('profile.swap.token-price', { token: toToken })}:</SubLabel>
                        {isFetching ? (
                            <LoaderContainer>
                                <SimpleLoader size={16} strokeWidth={6} />
                            </LoaderContainer>
                        ) : (
                            <Value>
                                {Number(swapQuote) === 0 ? '-' : formatCurrencyWithKey(fromToken, 1 / swapQuote)}
                            </Value>
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
    width: 360px;
`;

const InputContainer = styled(FlexDiv)`
    margin-top: 10px;
    margin-bottom: 5px;
`;

const InfoBox = styled(FlexDivColumn)<{ disabled?: boolean }>`
    border: 1px solid ${(props) => props.theme.textColor.secondary};
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

const LoaderContainer = styled.div`
    position: relative;
    width: 16px;
    margin-left: auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
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
    margin-left: auto;
    color: ${(props) => props.theme.textColor.primary};
`;

export default SwapModal;

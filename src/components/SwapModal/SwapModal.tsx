import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { AVAILABLE_TOKENS, ONE_INCH_API_URL, OP_ETH, QUOTE_SUFFIX, SWAP_SUFFIX } from 'constants/tokens';
import TokenDropdown from './TokenDropdown';
import { Token } from 'types/tokens';
import { getIsAppReady } from 'redux/modules/app';
import useTokenBalanceQuery from 'queries/wallet/useTokenBalanceQuery';
import { formatCurrencyWithPrecision } from 'thales-utils';
import { BigNumber, ethers } from 'ethers';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import networkConnector from 'utils/networkConnector';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import useInterval from 'hooks/useInterval';
import { getIsMultiCollateralSupported } from 'utils/network';
import NumericInput from 'components/fields/NumericInput';
import { getDefaultCollateral } from 'utils/collaterals';

type SwapModalProps = {
    onClose: () => void;
};

const SwapModal: React.FC<SwapModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [amount, setAmount] = useState<number | string>('');
    const [outputAmount, setOutputAmount] = useState<number | string>('');

    const availableTokens = AVAILABLE_TOKENS.filter((token: Token) => token.chainId === networkId);
    const defaultSelectedToken = AVAILABLE_TOKENS.filter(
        (token: Token) =>
            token.chainId === networkId &&
            (getIsMultiCollateralSupported(networkId) ? true : token.symbol === getDefaultCollateral(networkId))
    )[0];
    const [selectedToken, setSelectedToken] = useState<Token>(defaultSelectedToken);
    const [tokenBalance, setTokenBalance] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isGettingQuote, setIsGettingQuote] = useState<boolean>(false);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');

    const sourceToken = OP_ETH;

    const isAmountEntered = Number(amount) > 0;
    const insufficientBalance = Number(tokenBalance) < Number(amount) || Number(tokenBalance) === 0;
    const isButtonDisabled =
        !isWalletConnected || !isAmountEntered || insufficientBalance || isSubmitting || isGettingQuote;

    const ethBalanceQuery = useTokenBalanceQuery(sourceToken, walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (ethBalanceQuery.isSuccess && ethBalanceQuery.data !== undefined) {
            setTokenBalance(Number(ethBalanceQuery.data));
        }
    }, [ethBalanceQuery.isSuccess, ethBalanceQuery.data]);

    const paymentTokenBalanceQuery = useTokenBalanceQuery(selectedToken, walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const getQuote = async (isRefresh: boolean) => {
        if (Number(amount) > 0) {
            if (!isRefresh) {
                setIsGettingQuote(true);
            }
            const fetchUrl = `${ONE_INCH_API_URL}${networkId}${QUOTE_SUFFIX}?fromTokenAddress=${
                sourceToken.address
            }&toTokenAddress=${selectedToken.address}&amount=${ethers.utils.parseUnits(
                Number(amount).toString(),
                sourceToken.decimals
            )}`;
            const response = await fetch(fetchUrl);
            const result = JSON.parse(await response.text());
            setOutputAmount(
                formatCurrencyWithPrecision(ethers.utils.formatUnits(result.toTokenAmount, selectedToken.decimals))
            );
            if (!isRefresh) {
                setIsGettingQuote(false);
            }
        } else {
            setOutputAmount('');
        }
    };

    useDebouncedEffect(() => {
        getQuote(false);
    }, [amount, selectedToken]);

    useInterval(async () => {
        getQuote(true);
    }, 5000);

    const handleSubmit = async () => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        setIsSubmitting(true);
        try {
            const fetchUrl = `${ONE_INCH_API_URL}${networkId}${SWAP_SUFFIX}?fromTokenAddress=${
                sourceToken.address
            }&toTokenAddress=${selectedToken.address}&amount=${ethers.utils.parseUnits(
                Number(amount).toString(),
                sourceToken.decimals
            )}&slippage=1&fromAddress=${walletAddress}`;
            const response = await fetch(fetchUrl);
            const result = JSON.parse(await response.text());

            const { signer } = networkConnector;
            if (signer) {
                const transactionData = {
                    data: result.tx.data,
                    from: result.tx.from,
                    to: result.tx.to,
                    value: BigNumber.from(result.tx.value).toHexString(),
                };
                const tx = await signer.sendTransaction(transactionData);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(
                            t('market.toast-message.swap-success', { currencyKey: selectedToken.symbol })
                        )
                    );
                    setIsSubmitting(false);
                }
            }
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            setIsSubmitting(false);
        }
    };

    const getSubmitButton = () => {
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
                >
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (insufficientBalance) {
            return <Button disabled={true}>{t(`common.errors.insufficient-balance`)}</Button>;
        }
        if (!isAmountEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-amount`)}</Button>;
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleSubmit}>
                {!isSubmitting ? t('common.swap.swap-label') : t('common.swap.swap-progress-label')}
            </Button>
        );
    };

    return (
        <Modal title={t('common.swap.title')} onClose={onClose} shouldCloseOnOverlayClick={false}>
            <Container>
                <InputContainer>
                    <NumericInput
                        value={amount}
                        label={t('common.swap.from-label')}
                        balance={t('common.swap.balance-label', {
                            amount: formatCurrencyWithPrecision(tokenBalance),
                        })}
                        disabled={isSubmitting}
                        onChange={(_: any, value: any) => setAmount(value)}
                        currencyLabel={sourceToken.symbol}
                    />
                </InputContainer>
                <InputContainer>
                    <NumericInput
                        value={outputAmount}
                        label={t('common.swap.to-label')}
                        balance={t('common.swap.balance-label', {
                            amount: formatCurrencyWithPrecision(paymentTokenBalance),
                        })}
                        onChange={() => {}}
                        disabled={true}
                        currencyLabel={availableTokens.length === 1 ? availableTokens[0].symbol : undefined}
                        currencyComponent={
                            availableTokens.length > 1 ? (
                                <TokenDropdown
                                    selectedToken={selectedToken}
                                    disabled={isSubmitting}
                                    onSelect={setSelectedToken}
                                />
                            ) : undefined
                        }
                        enableCurrencyComponentOnly
                    />
                </InputContainer>
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 400px;
    margin-top: 50px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const InputContainer = styled(FlexDivCentered)`
    position: relative;
    margin: 10px 0;
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 30px 0 10px 0;
`;

export default SwapModal;

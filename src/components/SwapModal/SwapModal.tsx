import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import onboardConnector from 'utils/onboardConnector';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import SwapNumericInput from 'components/fields/SwapNumericInput';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { ONE_INCH_EXCHANGE_URL, OP_ETH, OP_SUSD, QUOTE_SUFFIX, SWAP_SUFFIX } from 'constants/tokens';
import TokenDropdown from './TokenDropdown';
import { Token } from 'types/tokens';
import { getIsAppReady } from 'redux/modules/app';
import useTokenBalanceQuery from 'queries/wallet/useTokenBalanceQuery';
import { formatCurrencyWithPrecision } from 'utils/formatters/number';
import { PAYMENT_CURRENCY } from 'constants/currency';
import { BigNumber, ethers } from 'ethers';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import tokenContract from 'utils/contracts/paymentTokenContract';
import useSwapApproveSpender from 'queries/wallet/useSwapApproveSpender';
import { toast } from 'react-toastify';
import { MAX_GAS_LIMIT } from 'constants/network';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ApprovalModal from 'components/ApprovalModal';
import useInterval from 'hooks/useInterval';
import usePaymentTokenBalanceQuery from 'queries/wallet/usePaymentTokenBalanceQuery';

type SwapModalProps = {
    onClose: () => void;
};

export const SwapModal: React.FC<SwapModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [amount, setAmount] = useState<number | string>('');
    const [outputAmount, setOutputAmount] = useState<number | string>('');
    const [selectedToken, setSelectedToken] = useState<Token>(OP_ETH);
    const [tokenBalance, setTokenBalance] = useState<number | string>('');
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isGettingQuote, setIsGettingQuote] = useState<boolean>(false);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');

    const isAmountEntered = Number(amount) > 0;
    const insufficientBalance = Number(tokenBalance) < Number(amount) || Number(tokenBalance) === 0;
    const isButtonDisabled =
        !isWalletConnected || !isAmountEntered || insufficientBalance || isSubmitting || isGettingQuote;

    const swapApproveSpenderQuery = useSwapApproveSpender(networkId, { enabled: isAppReady });

    const addressToApprove: string = useMemo(() => {
        if (swapApproveSpenderQuery.isSuccess && swapApproveSpenderQuery.data) {
            return swapApproveSpenderQuery.data as string;
        }
        return '';
    }, [swapApproveSpenderQuery.isSuccess, swapApproveSpenderQuery.data]);

    const tokenBalanceQuery = useTokenBalanceQuery(selectedToken, walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (tokenBalanceQuery.isSuccess && tokenBalanceQuery.data !== undefined) {
            setTokenBalance(Number(tokenBalanceQuery.data));
        }
    }, [tokenBalanceQuery.isSuccess, tokenBalanceQuery.data]);

    const paymentTokenBalanceQuery = usePaymentTokenBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    useEffect(() => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(selectedToken.address, tokenContract?.abi, signer);
            const getAllowance = async () => {
                try {
                    const parsedAmount = ethers.utils.parseEther(Number(amount).toString());
                    const allowance = await checkAllowance(parsedAmount, contract, walletAddress, addressToApprove);
                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected) {
                if (selectedToken.symbol === 'ETH') {
                    setAllowance(true);
                } else {
                    getAllowance();
                }
            }
        }
    }, [walletAddress, isWalletConnected, hasAllowance, amount, selectedToken, isAllowing, addressToApprove]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer } = networkConnector;
        if (signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsAllowing(true);

            try {
                const contract = new ethers.Contract(selectedToken.address, tokenContract?.abi, signer);

                const tx = (await contract.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('market.toast-messsage.approve-success', { token: PAYMENT_CURRENCY }))
                    );
                    setIsAllowing(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsAllowing(false);
            }
        }
    };

    const getQuote = async (isRefresh: boolean) => {
        if (Number(amount) > 0) {
            if (!isRefresh) {
                setIsGettingQuote(true);
            }
            const fetchUrl = `${ONE_INCH_EXCHANGE_URL}${networkId}${QUOTE_SUFFIX}?fromTokenAddress=${
                selectedToken.address
            }&toTokenAddress=${OP_SUSD.address}&amount=${ethers.utils.parseUnits(
                Number(amount).toString(),
                selectedToken.decimals
            )}`;
            const response = await fetch(fetchUrl);
            const result = JSON.parse(await response.text());
            setOutputAmount(
                formatCurrencyWithPrecision(ethers.utils.formatUnits(result.toTokenAmount, OP_SUSD.decimals))
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
        const id = toast.loading(t('market.toast-messsage.transaction-pending'));
        setIsSubmitting(true);
        try {
            const fetchUrl = `${ONE_INCH_EXCHANGE_URL}${networkId}${SWAP_SUFFIX}?fromTokenAddress=${
                selectedToken.address
            }&toTokenAddress=${OP_SUSD.address}&amount=${ethers.utils.parseUnits(
                Number(amount).toString(),
                selectedToken.decimals
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
                        getSuccessToastOptions(t('market.toast-messsage.swap-success', { currencyKey: OP_SUSD.symbol }))
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
                <ModalButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </ModalButton>
            );
        }
        if (insufficientBalance) {
            return <ModalButton disabled={true}>{t(`common.errors.insufficient-balance`)}</ModalButton>;
        }
        if (!isAmountEntered) {
            return <ModalButton disabled={true}>{t(`common.errors.enter-amount`)}</ModalButton>;
        }
        if (!hasAllowance) {
            return (
                <ModalButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: selectedToken.symbol })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: selectedToken.symbol,
                          })}
                </ModalButton>
            );
        }
        return (
            <ModalButton disabled={isButtonDisabled} onClick={handleSubmit}>
                {!isSubmitting ? t('common.swap.swap-label') : t('common.swap.swap-progress-label')}
            </ModalButton>
        );
    };

    return (
        <Modal
            title={t('common.swap.title', { currencyKey: PAYMENT_CURRENCY })}
            onClose={onClose}
            shouldCloseOnOverlayClick={false}
        >
            <Container>
                <InputContainer>
                    <TokenDropdown selectedToken={selectedToken} disabled={isSubmitting} onSelect={setSelectedToken} />
                    <SwapNumericInput
                        value={amount}
                        label={t('common.swap.from-label')}
                        balanceLabel={t('common.swap.balance-label', {
                            amount: formatCurrencyWithPrecision(tokenBalance),
                        })}
                        disabled={isSubmitting}
                        onChange={(_, value) => setAmount(value)}
                    />
                </InputContainer>
                <InputContainer>
                    <TokenDropdown selectedToken={OP_SUSD} disabled={isSubmitting} onSelect={() => {}} readOnly />
                    <SwapNumericInput
                        value={outputAmount}
                        label={t('common.swap.to-label')}
                        balanceLabel={t('common.swap.balance-label', {
                            amount: formatCurrencyWithPrecision(paymentTokenBalance),
                        })}
                        disabled={isSubmitting}
                        onChange={() => {}}
                        readOnly={true}
                        isGettingQuote={isGettingQuote}
                    />
                </InputContainer>
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    tokenSymbol={selectedToken.symbol}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
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
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 30px 0 10px 0;
`;

const ModalButton = styled(Button)``;

export default SwapModal;

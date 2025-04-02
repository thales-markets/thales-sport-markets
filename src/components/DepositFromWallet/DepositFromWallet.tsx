import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import Modal from 'components/Modal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { AmountToBuyContainer } from 'pages/Markets/Home/Parlay/components/styled-components';
import { FormContainer, InputContainer } from 'pages/Profile/components/WithdrawModal/styled-components';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { coinParser, formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateral, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getNetworkNameByNetworkId } from 'utils/network';
import { Address, Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type DepositFromWalletProps = {
    onClose: () => void;
    preSelectedToken?: number;
};

type FormValidation = {
    amount: boolean;
};

const DepositFromWallet: React.FC<DepositFromWalletProps> = ({ onClose, preSelectedToken }) => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();

    const walletAddress = biconomyConnector?.address || '';

    const [selectedToken, setSelectedToken] = useState<number>(preSelectedToken ? preSelectedToken : 0);
    const [amount, setAmount] = useState<string | number>('');
    const theme: ThemeInterface = useTheme();
    const [validation, setValidation] = useState<FormValidation>({ amount: false });

    const inputRef = useRef<HTMLDivElement>(null);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        address as string,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const paymentTokenBalance: number = useMemo(() => {
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[getCollaterals(networkId)[selectedToken]];
        }
        return 0;
    }, [multipleCollateralBalances.data, multipleCollateralBalances.isSuccess, networkId, selectedToken]);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    useEffect(() => {
        let amountValidation = false;

        if (Number(amount) >= 0 && !(Number(amount) > paymentTokenBalance)) {
            amountValidation = true;
        }

        setValidation({ amount: amountValidation });
    }, [amount, paymentTokenBalance]);

    const sendFunds = async () => {
        const token = getCollaterals(networkId)[selectedToken];
        const parsedAmount = coinParser('' + amount, networkId, token);
        const id = toast.loading(t('deposit.toast-messages.pending'));
        let txHash;
        try {
            if (token === 'ETH') {
                const transaction = {
                    to: walletAddress as Address,
                    value: parsedAmount,
                };

                txHash = await walletClient.data?.sendTransaction(transaction);
            } else {
                const collateralContractWithSigner = getContractInstance(
                    ContractType.MULTICOLLATERAL,
                    { client: walletClient.data, networkId },
                    getCollateralIndex(networkId, token)
                );

                txHash = await collateralContractWithSigner?.write.transfer([walletAddress, parsedAmount]);
            }
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash: txHash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t('deposit.toast-messages.success')));
                onClose();
                return;
            } else {
                toast.update(id, getErrorToastOptions(t('deposit.toast-messages.error')));
                return;
            }
        } catch (e) {
            toast.update(id, getErrorToastOptions(t('deposit.toast-messages.error')));
            return;
        }
    };

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 100,
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
                <NetworkWrapper>
                    <NetworkHeader>{t('get-started.fund-account.current-network')}</NetworkHeader>
                    <NetworkSwitcherWrapper>
                        <NetworkSwitcher />
                    </NetworkSwitcherWrapper>
                </NetworkWrapper>
                <FlexDivRow>
                    <Title>
                        <Trans
                            i18nKey="deposit.title"
                            components={{
                                icon: <OvertimeIcon className="icon icon--overtime" />,
                            }}
                        />
                        <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                    </Title>
                </FlexDivRow>
                <WalletContainer>
                    <FieldHeader>{t('deposit.address')}</FieldHeader>
                    <SubTitle>
                        <Trans
                            i18nKey="deposit.subtitle"
                            components={{
                                span: <span />,
                            }}
                            values={{
                                network: getNetworkNameByNetworkId(networkId),
                            }}
                        />
                    </SubTitle>
                    <FormContainer>
                        <InputContainer>
                            <WalletAddress>{walletAddress}</WalletAddress>
                        </InputContainer>

                        <InputContainer ref={inputRef}>
                            <AmountToBuyContainer>
                                <NumericInput
                                    value={amount}
                                    onChange={(_, value) => setAmount(value)}
                                    inputFontWeight="700"
                                    inputPadding="5px 10px"
                                    height="44px"
                                    inputFontSize="16px"
                                    background={theme.background.quinary}
                                    borderColor={theme.background.quinary}
                                    fontWeight="700"
                                    color={theme.textColor.primary}
                                    label={t('deposit.deposit-amount')}
                                    placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                                    currencyComponent={
                                        <CollateralSelector
                                            borderColor="none"
                                            collateralArray={getCollaterals(networkId)}
                                            selectedItem={selectedToken}
                                            onChangeCollateral={(index) => {
                                                setAmount('');
                                                setSelectedToken(index);
                                            }}
                                            isDetailedView
                                            collateralBalances={multipleCollateralBalances.data}
                                            exchangeRates={exchangeRates}
                                            dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                            background={theme.background.quinary}
                                            color={theme.textColor.primary}
                                            topPosition="50px"
                                            hideZeroBalance
                                        />
                                    }
                                    balance={formatCurrencyWithKey(
                                        getCollateral(networkId, selectedToken),
                                        paymentTokenBalance
                                    )}
                                    onMaxButton={() => setAmount(paymentTokenBalance)}
                                />
                            </AmountToBuyContainer>
                        </InputContainer>
                    </FormContainer>
                </WalletContainer>
                <ButtonContainer>
                    <Button
                        backgroundColor={theme.overdrop.borderColor.tertiary}
                        disabled={!validation.amount}
                        borderColor={theme.overdrop.borderColor.tertiary}
                        textColor={theme.button.textColor.primary}
                        height="44px"
                        fontSize="16px"
                        fontWeight="700"
                        borderRadius="8px"
                        onClick={() => sendFunds()}
                    >
                        {t('deposit.button-label-deposit')}
                    </Button>
                </ButtonContainer>
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled.div`
    flex-direction: column;
    display: flex;
`;

const OvertimeIcon = styled.i`
    font-size: 124px;
    font-weight: 400;
    line-height: 28px;
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

const SubTitle = styled.h1`
    position: relative;
    font-weight: 600;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.secondary};
    width: 100%;
    text-align: left;
    margin-top: 6px;
    margin-bottom: 10px;
    line-height: 16px;
    span {
        color: ${(props) => props.theme.warning.textColor.primary};
    }
`;

const FieldHeader = styled.p`
    font-size: 16px;
    font-weight: 700;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    margin-top: 40px;
    gap: 4px;
`;

const ButtonContainer = styled(FlexDivColumnCentered)`
    margin-top: 30px;
`;

const WalletAddress = styled.p`
    background: ${(props) => props.theme.textColor.primary};
    color: ${(props) => props.theme.textColor.senary};
    border-radius: 8px;
    padding: 10px;
    height: 44px;
    display: flex;
    justify-content: start;
    align-items: center;
    opacity: 0.6;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    text-align: left;
    @media (max-width: 575px) {
        font-size: 12px;
    }
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    text-transform: none;
`;

const NetworkWrapper = styled(FlexDivCentered)`
    margin-top: 10px;
    margin-bottom: 16px;
    gap: 2px;
`;

const NetworkHeader = styled(FieldHeader)`
    color: ${(props) => props.theme.textColor.secondary};
`;

const NetworkSwitcherWrapper = styled.div`
    position: relative;
`;

export default DepositFromWallet;

import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import Modal from 'components/Modal';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { coinParser, formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { ThemeInterface } from 'types/ui';
import { getCollateral, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { getQueryStringVal } from 'utils/useQueryParams';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import { AmountToBuyContainer } from 'pages/Markets/Home/Parlay/components/styled-components';
import { FormContainer, InputContainer } from 'pages/Profile/components/WithdrawModal/styled-components';
import biconomyConnector from 'utils/biconomyWallet';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { toast } from 'react-toastify';
import { getContractInstance } from 'utils/contract';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

type DepositFromWalletProps = {
    onClose: () => void;
};

type FormValidation = {
    amount: boolean;
};

const DepositFromWallet: React.FC<DepositFromWalletProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();

    const walletAddress = biconomyConnector?.address || '';

    const [selectedToken, setSelectedToken] = useState<number>(0);
    const [amount, setAmount] = useState<string | number>('');
    const theme: ThemeInterface = useTheme();
    const [validation, setValidation] = useState<FormValidation>({ amount: false });

    const selectedTokenFromUrl = getQueryStringVal('coin-index');

    useEffect(() => {
        setSelectedToken(Number(selectedTokenFromUrl));
    }, [selectedTokenFromUrl]);

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
        const collateralContractWithSigner = getContractInstance(
            ContractType.MULTICOLLATERAL,
            { client: walletClient.data, networkId },
            getCollateralIndex(networkId, token)
        );
        try {
            const txHash = await collateralContractWithSigner?.write.transfer([walletAddress, parsedAmount]);

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
                    zIndex: 1000,
                },
                content: {
                    transform: 'translate(-50%, -50%)',
                    overflow: 'unset',
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
                <Title>
                    <Trans
                        i18nKey="deposit.title"
                        components={{
                            icon: <OvertimeIcon className="icon icon--overtime" />,
                        }}
                    />
                </Title>

                <WalletContainer>
                    <FieldHeader>{t('deposit.address')}</FieldHeader>
                    <SubTitle>{t('deposit.subtitle')}</SubTitle>
                    <FormContainer>
                        <InputContainer>
                            <TextInput
                                value={walletAddress}
                                borderColor="none"
                                height="44px"
                                inputFontSize="16px"
                                background={theme.textColor.primary}
                                fontWeight="700"
                                disabled={true}
                                color={theme.textColor.tertiary}
                            />
                        </InputContainer>

                        <InputContainer ref={inputRef}>
                            <AmountToBuyContainer>
                                <NumericInput
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(Number(e.target.value) === 0 ? '' : Number(e.target.value));
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
                                            selectedItem={selectedToken}
                                            onChangeCollateral={(index) => {
                                                setAmount('');
                                                setSelectedToken(index);
                                            }}
                                            isDetailedView
                                            collateralBalances={multipleCollateralBalances.data}
                                            exchangeRates={exchangeRates}
                                            dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                            background={theme.textColor.primary}
                                            color={theme.textColor.tertiary}
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
                        borderColor="none"
                        textColor={theme.button.textColor.primary}
                        height="48px"
                        fontSize="22px"
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
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    width: 100%;
    text-align: left;
    margin-bottom: 6px;
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

export default DepositFromWallet;

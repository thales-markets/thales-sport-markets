import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import Modal from 'components/Modal';
import { AmountToBuyContainer } from 'pages/Markets/Home/Parlay/components/styled-components';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { CloseIcon, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateral, getCollaterals } from 'utils/collaterals';
import { isAddress } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import WithdrawalConfirmationModal from './components/WithdrawalConfirmationModal';
import { FormContainer, InputContainer } from './styled-components';

type WithdrawModalProps = {
    onClose: () => void;
    preSelectedToken?: number;
};

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, preSelectedToken }) => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const client = useClient();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [selectedToken, setSelectedToken] = useState<number>(preSelectedToken ?? 0);
    const [amount, setAmount] = useState<string | number>('');
    const [showWithdrawalConfirmationModal, setWithdrawalConfirmationModalVisibility] = useState<boolean>(false);
    const theme: ThemeInterface = useTheme();
    const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
    const [validation, setValidation] = useState<FormValidation>({ walletAddress: false, amount: false });

    const inputRef = useRef<HTMLDivElement>(null);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
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
        let walletValidation = false;
        let amountValidation = false;

        if (withdrawalWalletAddress != '' && isAddress(withdrawalWalletAddress)) {
            walletValidation = true;
        }

        if (Number(amount) > 0 && !(Number(amount) > paymentTokenBalance)) {
            amountValidation = true;
        }

        setValidation({ walletAddress: walletValidation, amount: amountValidation });
    }, [amount, paymentTokenBalance, withdrawalWalletAddress]);

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
                padding: '30px 50px',
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Wrapper>
                <FlexDivRow>
                    <Title>
                        <Trans
                            i18nKey="get-started.withdraw.title"
                            components={{
                                icon: <OvertimeIcon className="icon icon--overtime" />,
                            }}
                        />
                    </Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </FlexDivRow>

                <WalletContainer>
                    <FieldHeader>{t('get-started.withdraw.address')}</FieldHeader>
                    <SubTitle>{t('get-started.withdraw.subtitle')}</SubTitle>
                    <FormContainer>
                        <InputContainer>
                            <TextInput
                                value={withdrawalWalletAddress}
                                onChange={(el: { target: { value: React.SetStateAction<string> } }) =>
                                    setWithdrawalWalletAddress(el.target.value)
                                }
                                borderColor="none"
                                placeholder={t('withdraw.paste-address')}
                                showValidation={!validation.walletAddress && !!withdrawalWalletAddress}
                                validationMessage={t('withdraw.validation.wallet-address')}
                                height="44px"
                                inputFontSize="16px"
                                background={theme.textColor.primary}
                                fontWeight="700"
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
                        disabled={!validation.amount || !validation.walletAddress}
                        borderColor="none"
                        textColor={theme.button.textColor.primary}
                        height="48px"
                        fontSize="22px"
                        onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                    >
                        {t('withdraw.button-label-withdraw')}
                    </Button>
                </ButtonContainer>
            </Wrapper>

            {showWithdrawalConfirmationModal && (
                <WithdrawalConfirmationModal
                    amount={Number(amount)}
                    token={getCollaterals(networkId)[selectedToken]}
                    withdrawalAddress={withdrawalWalletAddress}
                    network={networkId}
                    onClose={() => setWithdrawalConfirmationModalVisibility(false)}
                />
            )}
        </Modal>
    );
};

const Wrapper = styled.div`
    flex-direction: column;
    display: flex;
`;

const OvertimeIcon = styled.i`
    font-size: 128px;
    font-weight: 400;
    line-height: 28px;
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
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

export default WithdrawModal;

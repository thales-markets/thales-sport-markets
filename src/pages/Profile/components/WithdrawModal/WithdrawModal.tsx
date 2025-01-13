import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import Modal from 'components/Modal';
import { ButtonContainer } from 'pages/LiquidityPool/styled-components';
import { FormContainer, InputContainer } from 'pages/Profile/components/WithdrawModal/styled-components';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateral, getCollaterals } from 'utils/collaterals';
import { getQueryStringVal } from 'utils/useQueryParams';
import { isAddress } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import WithdrawalConfirmationModal from './components/WithdrawalConfirmationModal';
import { AmountToBuyContainer } from 'pages/Markets/Home/Parlay/components/styled-components';

type WithdrawModalProps = {
    onClose: () => void;
};

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const client = useClient();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [selectedToken, setSelectedToken] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [showWithdrawalConfirmationModal, setWithdrawalConfirmationModalVisibility] = useState<boolean>(false);
    const theme: ThemeInterface = useTheme();
    const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
    const [validation, setValidation] = useState<FormValidation>({ walletAddress: false, amount: false });

    const selectedTokenFromUrl = getQueryStringVal('coin-index');

    useEffect(() => {
        setSelectedToken(Number(selectedTokenFromUrl));
    }, [selectedTokenFromUrl]);

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

        if (amount > 0 && !(amount > paymentTokenBalance)) {
            amountValidation = true;
        }

        setValidation({ walletAddress: walletValidation, amount: amountValidation });
    }, [amount, paymentTokenBalance, withdrawalWalletAddress]);

    // const handleChangeCollateral = (index: number) => {
    //     setSelectedToken(index);
    //     setSelectedTokenFromQuery(index.toString());
    // };

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
                <Title>
                    <Trans
                        i18nKey="get-started.withdraw.title"
                        components={{
                            icon: <OvertimeIcon className="icon icon--overtime" />,
                        }}
                    />
                </Title>

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
                                placeholder={t('withdraw.paste-address')}
                                showValidation={!validation.walletAddress && !!withdrawalWalletAddress}
                                validationMessage={t('withdraw.validation.wallet-address')}
                                height="44px"
                                inputFontSize="16px"
                                background={theme.background.quaternary}
                                fontWeight="700"
                                color={theme.textColor.tertiary}
                            />
                        </InputContainer>

                        <InputContainer ref={inputRef}>
                            <AmountToBuyContainer>
                                <NumericInput
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(Number(e.target.value));
                                    }}
                                    inputFontWeight="700"
                                    inputPadding="5px 10px"
                                    height="44px"
                                    inputFontSize="16px"
                                    background={theme.background.quaternary}
                                    fontWeight="700"
                                    color={theme.textColor.tertiary}
                                    placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                                    currencyComponent={
                                        <CollateralSelector
                                            collateralArray={getCollaterals(networkId)}
                                            selectedItem={selectedToken}
                                            onChangeCollateral={() => {
                                                setAmount(0);
                                            }}
                                            isDetailedView
                                            collateralBalances={multipleCollateralBalances.data}
                                            exchangeRates={exchangeRates}
                                            dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
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

                        <ButtonContainer>
                            <Button
                                backgroundColor={theme.button.background.quaternary}
                                disabled={!validation.amount || !validation.walletAddress}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.secondary}
                                padding={'5px 60px'}
                                fontSize={'22px'}
                                onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                            >
                                {t('withdraw.button-label-withdraw')}
                            </Button>
                        </ButtonContainer>
                    </FormContainer>
                </WalletContainer>
            </Wrapper>

            {showWithdrawalConfirmationModal && (
                <WithdrawalConfirmationModal
                    amount={amount}
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
    max-width: 800px;
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
    margin-bottom: 20px;
`;

const FieldHeader = styled.p`
    font-size: 16px;
    font-weight: 700;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    margin-top: 30px;
    gap: 4px;
`;

export default WithdrawModal;

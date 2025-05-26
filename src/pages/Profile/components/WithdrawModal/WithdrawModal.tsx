import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import Modal from 'components/Modal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import { AmountToBuyContainer } from 'pages/Markets/Home/Parlay/components/styled-components';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { CloseIcon, FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { getCollateral, getCollaterals } from 'utils/collaterals';
import { getNetworkNameByNetworkId } from 'utils/network';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
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
    const walletAddress = (isBiconomy ? smartAccountConnector.biconomyAddress : address) || '';

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

                    <SubTitle>
                        <Trans
                            i18nKey="get-started.withdraw.subtitle"
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
                                background={theme.background.quinary}
                                borderColor={theme.background.quinary}
                                fontWeight="700"
                                color={theme.textColor.primary}
                            />
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
                                    label={t('get-started.withdraw.withdraw-amount')}
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
                                    onMaxButton={() => setAmount(paymentTokenBalance * 0.99999999)} // Avoid rounding issues with bigFormatter
                                />
                            </AmountToBuyContainer>
                        </InputContainer>
                    </FormContainer>
                </WalletContainer>
                <ButtonContainer>
                    <Button
                        backgroundColor={theme.overdrop.borderColor.tertiary}
                        disabled={!validation.walletAddress || !validation.amount}
                        borderColor={theme.overdrop.borderColor.tertiary}
                        textColor={theme.button.textColor.primary}
                        height="44px"
                        fontSize="16px"
                        fontWeight="700"
                        borderRadius="8px"
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
    @media (max-width: 512px) {
        font-size: 100px;
        line-height: 20px;
    }

    @media (max-width: 412px) {
        font-size: 96px;
        line-height: 18px;
    }
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
    @media (max-width: 512px) {
        font-size: 20px;
        white-space: pre;
        gap: 2px;
    }
    @media (max-width: 412px) {
        font-size: 18px;
        line-height: 18px;
    }
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

export default WithdrawModal;

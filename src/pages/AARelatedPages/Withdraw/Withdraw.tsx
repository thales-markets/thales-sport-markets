import BalanceDetails from 'pages/AARelatedPages/Deposit/components/BalanceDetails';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
    BalanceSection,
    FormContainer,
    InputContainer,
    InputLabel,
    PrimaryHeading,
    WarningContainer,
    WarningIcon,
    Wrapper,
} from '../styled-components';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { t } from 'i18next';
import { getCollaterals } from 'utils/collaterals';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId, getWalletAddress, getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import { getNetworkNameByNetworkId } from 'utils/network';
import { FlexDiv } from 'styles/common';
import WithdrawalConfirmationModal from './components/WithdrawalConfirmationModal';
import { ethers } from 'ethers';
import TextInput from 'components/fields/TextInput';
import Button from 'components/Button';

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

const Withdraw: React.FC = () => {
    const theme: ThemeInterface = useTheme();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [selectedToken, setSelectedToken] = useState<number>(0);
    const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [showWithdrawalConfirmationModal, setWithdrawalConfirmationModalVisibility] = useState<boolean>(false);
    const [validation, setValidation] = useState<FormValidation>({ walletAddress: false, amount: false });

    const inputRef = useRef<HTMLDivElement>(null);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const paymentTokenBalance: number = useMemo(() => {
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[getCollaterals(networkId, true)[selectedToken]];
        }
        return 0;
    }, [multipleCollateralBalances.data, multipleCollateralBalances.isSuccess, networkId, selectedToken]);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    useEffect(() => {
        let walletValidation = false;
        let amountValidation = false;

        if (withdrawalWalletAddress != '' && ethers.utils.isAddress(withdrawalWalletAddress)) {
            walletValidation = true;
        }

        if (amount > 0 && !(amount > paymentTokenBalance)) {
            amountValidation = true;
        }

        setValidation({ walletAddress: walletValidation, amount: amountValidation });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, paymentTokenBalance, withdrawalWalletAddress]);

    return (
        <>
            <Wrapper>
                <FormContainer>
                    <PrimaryHeading>{t('withdraw.heading-withdraw')}</PrimaryHeading>
                    <InputLabel>{t('deposit.select-token')}</InputLabel>
                    <InputContainer ref={inputRef}>
                        <NumericInput
                            value={getCollaterals(networkId, true)[selectedToken]}
                            onChange={(e) => {
                                console.log(e);
                            }}
                            inputFontSize="18px"
                            inputFontWeight="700"
                            inputPadding="5px 10px"
                            borderColor={theme.input.borderColor.tertiary}
                            disabled={false}
                            readonly={true}
                            inputType="text"
                            currencyComponent={
                                <CollateralSelector
                                    collateralArray={getCollaterals(networkId, true)}
                                    selectedItem={selectedToken}
                                    onChangeCollateral={(index) => setSelectedToken(index)}
                                    disabled={false}
                                    isDetailedView
                                    collateralBalances={[multipleCollateralBalances.data]}
                                    exchangeRates={exchangeRates}
                                    dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                    hideCollateralNameOnInput={true}
                                />
                            }
                            balance={formatCurrencyWithKey(
                                getCollaterals(networkId, true)[selectedToken],
                                paymentTokenBalance
                            )}
                            enableCurrencyComponentOnly={true}
                        />
                    </InputContainer>
                    <InputLabel marginTop="20px">
                        {t('withdraw.address-input-label', {
                            token: selectedToken,
                            network: getNetworkNameByNetworkId(networkId),
                        })}
                    </InputLabel>
                    <InputContainer>
                        <TextInput
                            value={withdrawalWalletAddress}
                            onChange={(el: { target: { value: React.SetStateAction<string> } }) =>
                                setWithdrawalWalletAddress(el.target.value)
                            }
                            placeholder={t('withdraw.paste-address')}
                            showValidation={!validation.walletAddress && !!withdrawalWalletAddress}
                            validationMessage={t('withdraw.validation.wallet-address')}
                        />
                    </InputContainer>
                    <InputLabel marginTop="20px">{t('withdraw.amount')}</InputLabel>
                    <InputContainer>
                        <NumericInput
                            value={amount}
                            onChange={(el) => setAmount(Number(el.target.value))}
                            placeholder={t('withdraw.paste-address')}
                            onMaxButton={() => setAmount(paymentTokenBalance)}
                            currencyLabel={getCollaterals(networkId, true)[selectedToken]}
                            showValidation={!validation.amount && amount > 0}
                            validationMessage={t('withdraw.validation.amount')}
                        />
                    </InputContainer>
                    <WarningContainer>
                        <WarningIcon className={'icon icon--warning'} />
                        {t('deposit.send', {
                            token: getCollaterals(networkId, true)[selectedToken],
                            network: getNetworkNameByNetworkId(networkId),
                        })}
                    </WarningContainer>
                    <ButtonContainer>
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            disabled={!validation.amount || !validation.walletAddress}
                            textColor={theme.button.textColor.primary}
                            borderColor={theme.button.borderColor.secondary}
                            padding={'8px 80px'}
                            onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                        >
                            {t('withdraw.button-label-withdraw')}
                        </Button>
                    </ButtonContainer>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                </BalanceSection>
            </Wrapper>
            {showWithdrawalConfirmationModal && (
                <WithdrawalConfirmationModal
                    amount={amount}
                    token={getCollaterals(networkId, true)[selectedToken]}
                    withdrawalAddress={withdrawalWalletAddress}
                    network={getNetworkNameByNetworkId(networkId)}
                    onClose={() => setWithdrawalConfirmationModalVisibility(false)}
                />
            )}
        </>
    );
};

const ButtonContainer = styled(FlexDiv)`
    width: 100%;
    padding: 40px 0px;
    align-items: center;
    justify-content: center;
`;

export default Withdraw;

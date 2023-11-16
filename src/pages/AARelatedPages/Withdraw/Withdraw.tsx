import BalanceDetails from 'pages/AARelatedPages/Deposit/components/BalanceDetails';
import React, { useRef, useState, useMemo } from 'react';
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
                        <NumericInput
                            value={withdrawalWalletAddress}
                            onChange={(el) => setWithdrawalWalletAddress(el.target.value)}
                            placeholder={t('withdraw.paste-address')}
                            inputType="text"
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
                        <Button onClick={() => setWithdrawalConfirmationModalVisibility(true)}>
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

const Button = styled(FlexDiv)`
    cursor: pointer;
    padding: 8px 80px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.button.background.quaternary};
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    border-radius: 5px;
`;

export default Withdraw;

import BalanceDetails from 'pages/AARelatedPages/Deposit/components/BalanceDetails';
import React, { useRef, useState, useMemo } from 'react';
import { BalanceSection, FormContainer, InputContainer, InputLabel, Wrapper } from '../styled-components';
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
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';

const Withdraw: React.FC = () => {
    const theme: ThemeInterface = useTheme();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [selectedToken, setSelectedToken] = useState<number>(0);

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
        <Wrapper>
            <FormContainer>
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
                                hideBalance={true}
                            />
                        }
                        balance={formatCurrencyWithKey(
                            getCollaterals(networkId, true)[selectedToken],
                            paymentTokenBalance
                        )}
                        enableCurrencyComponentOnly={true}
                    />
                </InputContainer>
            </FormContainer>
            <BalanceSection>
                <BalanceDetails />
            </BalanceSection>
        </Wrapper>
    );
};

export default Withdraw;

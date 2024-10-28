import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    ALTCOIN_CONVERSION_BUFFER_PERCENTAGE,
    SUSD_CONVERSION_BUFFER_PERCENTAGE,
    THALES_CONTRACT_RATE_KEY,
} from 'constants/markets';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import {
    COLLATERAL_DECIMALS,
    DEFAULT_CURRENCY_DECIMALS,
    LONG_CURRENCY_DECIMALS,
    ceilNumberToDecimals,
    formatCurrencyWithKey,
} from 'thales-utils';
import { getCollateral, getDefaultCollateral, isStableCurrency, isThalesCurrency } from 'utils/collaterals';
import { useChainId } from 'wagmi';

const AMOUNTS = [3, 10, 20, 50, 100];

type SuggestedAmountProps = {
    collateralIndex: number;
    changeAmount: (value: number | string) => void;
    exchangeRates: Rates | null;
    insertedAmount: number | string;
    minAmount?: number;
};

const SuggestedAmount: React.FC<SuggestedAmountProps> = ({
    collateralIndex,
    changeAmount,
    exchangeRates,
    insertedAmount,
    minAmount,
}) => {
    const networkId = useChainId();

    const collateral = useMemo(() => getCollateral(networkId, collateralIndex), [networkId, collateralIndex]);
    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const isStableCollateral = isStableCurrency(collateral);
    const decimals = isStableCollateral ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS;
    const isThales = isThalesCurrency(collateral);

    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[isThales ? THALES_CONTRACT_RATE_KEY : collateral];

            if (collateral == defaultCollateral) {
                return value;
            } else {
                const priceFeedBuffer =
                    1 -
                    (collateral === CRYPTO_CURRENCY_MAP.sUSD
                        ? SUSD_CONVERSION_BUFFER_PERCENTAGE
                        : ALTCOIN_CONVERSION_BUFFER_PERCENTAGE);
                return rate
                    ? ceilNumberToDecimals(
                          Math.ceil((value / (rate * priceFeedBuffer)) * 10 ** COLLATERAL_DECIMALS[collateral]) /
                              10 ** COLLATERAL_DECIMALS[collateral],
                          decimals
                      )
                    : 0;
            }
        },
        [collateral, decimals, defaultCollateral, exchangeRates, isThales]
    );

    return (
        <Container>
            {AMOUNTS.map((amount, index) => {
                const convertedAmount = convertFromStable(amount);
                const buyAmount = minAmount && index === 0 && minAmount > convertedAmount ? minAmount : convertedAmount;

                return (
                    <AmountContainer
                        key={`amount-${index}`}
                        active={insertedAmount == buyAmount}
                        onClick={() => {
                            changeAmount(buyAmount);
                        }}
                    >
                        {formatCurrencyWithKey(USD_SIGN, amount, 1, true)}
                    </AmountContainer>
                );
            })}
        </Container>
    );
};

const Container = styled(FlexDiv)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 8px 0px;
    gap: 13px;
`;

const AmountContainer = styled(FlexDiv)<{ active?: boolean }>`
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    text-transform: capitalize;
    border-radius: 5px;
    color: ${(props) => (props.active ? props.theme.button.textColor.quinary : props.theme.button.textColor.secondary)};
    background-color: ${(props) =>
        props.active ? props.theme.button.background.quaternary : props.theme.button.background.senary};
    cursor: pointer;
    height: 25px;
    width: 100%;
`;

export default SuggestedAmount;

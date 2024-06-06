import { USD_SIGN } from 'constants/currency';
import { ALTCOIN_CONVERSION_BUFFER_PERCENTAGE } from 'constants/markets';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { COLLATERAL_DECIMALS, formatCurrencyWithKey } from 'thales-utils';
import { getCollateral, isStableCurrency } from 'utils/collaterals';

const AMOUNTS = [3, 10, 20, 50, 100];

type SuggestedAmountProps = {
    collateralIndex: number;
    changeAmount: (value: number | string) => void;
    exchangeRates: Rates | null;
    insertedAmount: number | string;
};

const SuggestedAmount: React.FC<SuggestedAmountProps> = ({
    collateralIndex,
    changeAmount,
    exchangeRates,
    insertedAmount,
}) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const collateral = getCollateral(networkId, collateralIndex);

    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[collateral];
            if (isStableCurrency(collateral)) {
                return value;
            } else {
                const priceFeedBuffer = 1 - ALTCOIN_CONVERSION_BUFFER_PERCENTAGE;
                return rate
                    ? Math.ceil((value / (rate * priceFeedBuffer)) * 10 ** COLLATERAL_DECIMALS[collateral]) /
                          10 ** COLLATERAL_DECIMALS[collateral]
                    : 0;
            }
        },
        [collateral, exchangeRates]
    );

    return (
        <Container>
            {AMOUNTS.map((amount, index) => {
                const buyAmount = convertFromStable(amount);

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

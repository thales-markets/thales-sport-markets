import { USD_SIGN } from 'constants/currency';
import { THALES_CONTRACT_RATE_KEY } from 'constants/markets';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { convertFromStableToCollateral, getCollateral, isThalesCurrency } from 'utils/collaterals';
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
    const isThales = isThalesCurrency(collateral);

    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[isThales ? THALES_CONTRACT_RATE_KEY : collateral] || 0;

            return convertFromStableToCollateral(collateral, value, rate, networkId);
        },
        [collateral, networkId, exchangeRates, isThales]
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

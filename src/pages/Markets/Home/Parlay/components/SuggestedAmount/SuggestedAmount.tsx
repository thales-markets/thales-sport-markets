import { STABLE_COINS, USD_SIGN } from 'constants/currency';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { floorNumberToDecimals, formatCurrencyWithKey } from 'thales-utils';
import { getCollateral } from 'utils/collaterals';

const AMOUNTS = [5, 10, 20, 50, 100];

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
    const isStableCollateral = !!STABLE_COINS.find((stable) => stable == collateral);

    return (
        <Container>
            {AMOUNTS.map((amount, index) => {
                const buyAmount = isStableCollateral
                    ? floorNumberToDecimals(amount)
                    : exchangeRates
                    ? floorNumberToDecimals(amount / exchangeRates[collateral], 4)
                    : floorNumberToDecimals(amount);

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
`;

const AmountContainer = styled(FlexDiv)<{ active?: boolean }>`
    align-items: center;
    justify-content: center;
    margin: 0 2px;
    font-size: 18px;
    font-weight: 700;
    text-transform: capitalize;
    border-radius: 5px;
    color: ${(props) =>
        props?.active ? props.theme.button.textColor.quinary : props.theme.button.textColor.quaternary};
    background-color: ${(props) =>
        props?.active ? props.theme.button.background.quaternary : props.theme.button.background.secondary};
    border: ${(props) => `1px ${props.theme.button.borderColor.secondary} solid`};
    cursor: pointer;
    padding: 3px 0px;
    width: 20%;
`;

export default SuggestedAmount;

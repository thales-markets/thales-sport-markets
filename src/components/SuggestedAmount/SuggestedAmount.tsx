import { USD_SIGN } from 'constants/currency';
import { OVER_CONTRACT_RATE_KEY } from 'constants/markets';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import {
    ceilNumberToDecimals,
    DEFAULT_CURRENCY_DECIMALS,
    formatCurrencyWithKey,
    LONG_CURRENCY_DECIMALS,
} from 'thales-utils';
import { Rates } from 'types/collateral';
import { convertFromStableToCollateral, getCollateral, isOverCurrency, isStableCurrency } from 'utils/collaterals';
import { useChainId } from 'wagmi';

type SuggestedAmountProps = {
    amounts: number[];
    collateralIndex: number;
    changeAmount: (value: number | string) => void;
    exchangeRates?: Rates | null;
    insertedAmount: number | string;
    minAmount?: number;
    buttonHeight?: string;
    buttonColor?: string;
    margin?: string;
    amountSymbol?: string;
};

const SuggestedAmount: React.FC<SuggestedAmountProps> = ({
    amounts,
    collateralIndex,
    changeAmount,
    exchangeRates,
    insertedAmount,
    minAmount,
    buttonHeight,
    buttonColor,
    margin,
    amountSymbol,
}) => {
    const networkId = useChainId();

    const [amountIndexClickedTimesMap, setAmountIndexClickedTimesMap] = useState(
        new Map(amounts.map((_, i) => [i, 0]))
    );
    const [isAmountClicked, setIsAmountClicked] = useState(false);

    const collateral = useMemo(() => getCollateral(networkId, collateralIndex), [networkId, collateralIndex]);
    const isOver = isOverCurrency(collateral);

    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[isOver ? OVER_CONTRACT_RATE_KEY : collateral] || 0;
            return convertFromStableToCollateral(collateral, value, rate, networkId);
        },
        [collateral, networkId, exchangeRates, isOver]
    );

    // Reset clicked times for all amounts
    const prevInsertedAmount = useRef<number>(Number(insertedAmount));
    useEffect(() => {
        const isInsertedAmountChanged = prevInsertedAmount.current !== Number(insertedAmount);
        if (isInsertedAmountChanged && !isAmountClicked) {
            const updatedMap = new Map(amountIndexClickedTimesMap);
            // reset all amounts clicks
            updatedMap.forEach((_, index, theMap) => theMap.set(index, 0));
            setAmountIndexClickedTimesMap(updatedMap);
        }
        prevInsertedAmount.current = Number(insertedAmount);
        setIsAmountClicked(false);
    }, [insertedAmount, isAmountClicked, amountIndexClickedTimesMap]);

    const onAmountClickHandler = (amountIndex: number, buyAmount: number) => {
        setIsAmountClicked(true);
        const updatedMap = new Map(amountIndexClickedTimesMap);
        // reset clicks for all other amounts except for current index
        updatedMap.forEach((clickedTimes, index, theMap) => {
            index === amountIndex ? clickedTimes : theMap.set(index, 0);
        });

        const increasedAmountClicks = (updatedMap.get(amountIndex) || 0) + 1;
        updatedMap.set(amountIndex, increasedAmountClicks);
        setAmountIndexClickedTimesMap(updatedMap);

        const decimals = isStableCurrency(collateral) ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS;
        const changedAmount = ceilNumberToDecimals(increasedAmountClicks * buyAmount, decimals);
        changeAmount(changedAmount);
    };

    const isAnyAmountClicked = Array.from(amountIndexClickedTimesMap.values()).some((n) => n > 0);

    return (
        <Container $margin={margin}>
            {amounts.map((amount, index) => {
                const convertedAmount = convertFromStable(amount);
                const buyAmount = minAmount && index === 0 && minAmount > convertedAmount ? minAmount : convertedAmount;

                const isCurrentAmountClicked = (amountIndexClickedTimesMap.get(index) || 0) > 0;
                const isAmountMatchedWithInsertedAmount =
                    Number(insertedAmount) > 0 && Number(insertedAmount) === buyAmount;
                if (!isAnyAmountClicked && isAmountMatchedWithInsertedAmount) {
                    const updatedMap = new Map(amountIndexClickedTimesMap);
                    updatedMap.set(index, 1);
                    setAmountIndexClickedTimesMap(updatedMap);
                }
                const isActive = isCurrentAmountClicked || (!isAnyAmountClicked && isAmountMatchedWithInsertedAmount);

                return (
                    <AmountContainer
                        key={`amount-${index}`}
                        active={isActive}
                        onClick={() => onAmountClickHandler(index, buyAmount)}
                        height={buttonHeight}
                        buttonColor={buttonColor}
                    >
                        {`${isCurrentAmountClicked ? '+' : ''} ${
                            amountSymbol ? amount + amountSymbol : formatCurrencyWithKey(USD_SIGN, amount, 1, true)
                        }`}
                    </AmountContainer>
                );
            })}
        </Container>
    );
};

const Container = styled(FlexDiv)<{ $margin?: string }>`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    ${(props) => (props.$margin ? `margin: ${props.$margin};` : '')}
    gap: 13px;
`;

const AmountContainer = styled(FlexDiv)<{ active?: boolean; height?: string; buttonColor?: string }>`
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    text-transform: capitalize;
    border-radius: 5px;
    color: ${(props) => (props.active ? props.theme.button.textColor.quinary : props.theme.button.textColor.secondary)};
    background-color: ${(props) =>
        props.active
            ? props.theme.button.background.quaternary
            : props.buttonColor || props.theme.button.background.senary};
    cursor: pointer;
    height: ${(props) => props.height || '25px'};
    width: 100%;
    user-select: none;
`;

export default SuggestedAmount;

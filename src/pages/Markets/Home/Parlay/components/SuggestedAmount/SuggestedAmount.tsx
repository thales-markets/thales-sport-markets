import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    ALTCOIN_CONVERSION_BUFFER_PERCENTAGE,
    SUSD_CONVERSION_BUFFER_PERCENTAGE,
    THALES_CONTRACT_RATE_KEY,
} from 'constants/markets';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import {
    COLLATERAL_DECIMALS,
    DEFAULT_CURRENCY_DECIMALS,
    LONG_CURRENCY_DECIMALS,
    ceilNumberToDecimals,
    coinParser,
    formatCurrencyWithKey,
} from 'thales-utils';
import { getCollateral, getCollateralAddress, getDefaultCollateral, isStableCurrency } from 'utils/collaterals';
import { getQuote, getSwapParams } from 'utils/swap';
import { Address } from 'viem';

const AMOUNTS = [3, 10, 20, 50, 100];

type SuggestedAmountProps = {
    collateralIndex: number;
    changeAmount: (value: number | string) => void;
    exchangeRates: Rates | null;
    insertedAmount: number | string;
    useThalesCollateral: boolean;
};

const SuggestedAmount: React.FC<SuggestedAmountProps> = ({
    collateralIndex,
    changeAmount,
    exchangeRates,
    insertedAmount,
    useThalesCollateral,
}) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [conversioRateUsingSwap, setConversioRateUsingSwap] = useState(0);

    const collateral = useMemo(() => getCollateral(networkId, collateralIndex), [networkId, collateralIndex]);
    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const isStableCollateral = isStableCurrency(collateral);
    const decimals = isStableCollateral ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS;
    const isThales = collateral === CRYPTO_CURRENCY_MAP.THALES;

    const collateralAddress = useMemo(() => getCollateralAddress(networkId, collateralIndex), [
        networkId,
        collateralIndex,
    ]);

    const swapOneToThalesParams = useMemo(
        () =>
            getSwapParams(
                networkId,
                walletAddress as Address,
                coinParser('1', networkId, collateral),
                collateralAddress as Address
            ),
        [collateralAddress, networkId, collateral, walletAddress]
    );

    // Get rate when using swap to THALES
    useEffect(() => {
        const getSwapQuoteForOneCoin = async () => {
            if (useThalesCollateral) {
                if (!conversioRateUsingSwap) {
                    const quoteForOne = await getQuote(networkId, swapOneToThalesParams);

                    setConversioRateUsingSwap(
                        quoteForOne && exchangeRates ? quoteForOne * exchangeRates[THALES_CONTRACT_RATE_KEY] : 0
                    );
                }
            } else {
                setConversioRateUsingSwap(0);
            }
        };

        getSwapQuoteForOneCoin();
    }, [useThalesCollateral, networkId, swapOneToThalesParams, exchangeRates, conversioRateUsingSwap]);

    const convertFromStable = useCallback(
        (value: number) => {
            const rate = conversioRateUsingSwap
                ? conversioRateUsingSwap
                : exchangeRates?.[isThales ? THALES_CONTRACT_RATE_KEY : collateral];

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
        [collateral, decimals, defaultCollateral, exchangeRates, isThales, conversioRateUsingSwap]
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

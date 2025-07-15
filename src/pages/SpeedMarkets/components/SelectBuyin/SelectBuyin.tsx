import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import SuggestedAmount from 'components/SuggestedAmount';
import { USD_SIGN } from 'constants/currency';
import { BICONOMY_MAX_FEE_PERCENTAGE } from 'constants/speedMarkets';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { SpeedPositions } from 'enums/speedMarkets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getTicketPayment } from 'redux/modules/ticket';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import {
    DEFAULT_CURRENCY_DECIMALS,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    LONG_CURRENCY_DECIMALS,
    truncToDecimals,
} from 'thales-utils';
import { AmmSpeedMarketsLimits } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import {
    convertCollateralToStable,
    convertFromStableToCollateral,
    getCollateral,
    getCollaterals,
    getDefaultCollateral,
    isStableCurrency,
} from 'utils/collaterals';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const BUYIN_AMOUNTS = [5, 10, 50, 100, 500];

type SelectBuyinProps = {
    selectedAsset: string;
    buyinAmount: number | string;
    setBuyinAmount: Dispatch<SetStateAction<string | number>>;
    buyinGasFee: number;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    setHasError: Dispatch<boolean>;
};

const SelectBuyin: React.FC<SelectBuyinProps> = ({
    selectedAsset,
    buyinAmount,
    setBuyinAmount,
    buyinGasFee,
    ammSpeedMarketsLimits,
    setHasError,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector(getIsBiconomy);
    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [isFreeBetActive, setIsFreeBetActive] = useState(false);
    const [errorMessageKey, setErrorMessageKey] = useState('');

    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates = exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected }
    );

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        { enabled: isConnected }
    );

    const freeBetCollateralBalances =
        freeBetCollateralBalancesQuery?.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery.data
            : undefined;

    const freeBetBalanceExists = freeBetCollateralBalances
        ? !!Object.values(freeBetCollateralBalances).find((balance) => balance)
        : false;

    // Set free bet if user has free bet balance
    useEffect(() => {
        if (freeBetBalanceExists) {
            setIsFreeBetActive(true);
        }
    }, [freeBetBalanceExists]);

    const paymentTokenBalance: number = useMemo(() => {
        if (isFreeBetActive && freeBetBalanceExists && freeBetCollateralBalances) {
            return freeBetCollateralBalances[selectedCollateral];
        }
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[selectedCollateral];
        }
        return 0;
    }, [
        freeBetBalanceExists,
        freeBetCollateralBalances,
        isFreeBetActive,
        multipleCollateralBalances.data,
        multipleCollateralBalances.isSuccess,
        selectedCollateral,
    ]);

    const minBuyinAmount = useMemo(() => ammSpeedMarketsLimits?.minBuyinAmount || 0, [
        ammSpeedMarketsLimits?.minBuyinAmount,
    ]);
    const maxBuyinAmount = useMemo(() => ammSpeedMarketsLimits?.maxBuyinAmount || 0, [
        ammSpeedMarketsLimits?.maxBuyinAmount,
    ]);

    const convertToStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertCollateralToStable(selectedCollateral, value, rate);
        },
        [selectedCollateral, exchangeRates]
    );
    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertFromStableToCollateral(selectedCollateral, value, rate, networkId);
        },
        [selectedCollateral, exchangeRates, networkId]
    );

    // Input field validations
    useDebouncedEffect(() => {
        let errorMessageKey = '';

        if (buyinAmount !== '') {
            const buyinAmountWithGas = isBiconomy ? Number(buyinAmount) + buyinGasFee : Number(buyinAmount);
            if ((isConnected && buyinAmountWithGas > paymentTokenBalance) || paymentTokenBalance === 0) {
                errorMessageKey = 'common.errors.insufficient-balance-wallet';
            }
        }
        if (buyinAmount !== '') {
            if (Number(buyinAmount) < convertFromStable(minBuyinAmount)) {
                errorMessageKey = 'speed-markets.errors.min-buyin';
            } else if (Number(buyinAmount) > convertFromStable(maxBuyinAmount)) {
                errorMessageKey = 'speed-markets.errors.max-buyin';
            }
        }

        if (errorMessageKey) {
            setHasError(true);
        } else {
            setHasError(false);
        }
        setErrorMessageKey(errorMessageKey);
    }, [
        minBuyinAmount,
        maxBuyinAmount,
        buyinAmount,
        paymentTokenBalance,
        isConnected,
        convertToStable,
        networkId,
        setHasError,
        buyinGasFee,
    ]);

    const onMaxClick = () => {
        const maxWalletAmount = isConnected
            ? Number(
                  truncToDecimals(
                      isBiconomy ? paymentTokenBalance * (1 - BICONOMY_MAX_FEE_PERCENTAGE) : paymentTokenBalance,
                      isStableCurrency(selectedCollateral) ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS
                  )
              )
            : Number.POSITIVE_INFINITY;

        const riskPerAsset = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
            (data) => data.currency === selectedAsset
        )[0];
        const maxLiquidity = riskPerAsset !== undefined ? riskPerAsset.max - riskPerAsset.current : Infinity;

        const riskPerAssetAndDirection = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
            (data) => data.currency === selectedAsset && data.position === SpeedPositions.UP
        )[0];
        const maxLiquidityPerDirection =
            riskPerAssetAndDirection !== undefined
                ? riskPerAssetAndDirection.max - riskPerAssetAndDirection.current
                : Infinity;

        const maxLimitAmount = Math.min(maxBuyinAmount, maxLiquidity, maxLiquidityPerDirection);
        const maxPaidAmount =
            maxLimitAmount < convertToStable(maxWalletAmount) ? convertFromStable(maxLimitAmount) : maxWalletAmount;

        setBuyinAmount(maxPaidAmount);
    };

    const inputRef = useRef<HTMLDivElement>(null);
    const inputRefVisible = !!inputRef?.current?.getBoundingClientRect().width;

    return (
        <>
            <SuggestedAmount
                amounts={BUYIN_AMOUNTS}
                insertedAmount={buyinAmount}
                exchangeRates={exchangeRates}
                collateralIndex={selectedCollateralIndex}
                changeAmount={(value) => setBuyinAmount(value)}
                buttonHeight="32px"
                buttonColor={theme.speedMarkets.button.background.primary}
            />
            <InputContainer ref={inputRef}>
                <AmountToBuyContainer>
                    <NumericInput
                        value={buyinAmount}
                        onChange={(e) => setBuyinAmount(e.target.value)}
                        showValidation={inputRefVisible && !!errorMessageKey}
                        validationMessage={t(errorMessageKey, {
                            currencyKey: selectedCollateral,
                            minAmount: `${formatCurrencyWithKey(
                                selectedCollateral,
                                convertFromStable(minBuyinAmount),
                                isStableCurrency(selectedCollateral)
                                    ? DEFAULT_CURRENCY_DECIMALS
                                    : LONG_CURRENCY_DECIMALS
                            )}${isDefaultCollateral ? '' : ` (${formatCurrencyWithSign(USD_SIGN, minBuyinAmount)})`}`,
                            maxAmount: `${formatCurrencyWithKey(
                                selectedCollateral,
                                convertFromStable(maxBuyinAmount),
                                isStableCurrency(selectedCollateral)
                                    ? DEFAULT_CURRENCY_DECIMALS
                                    : LONG_CURRENCY_DECIMALS
                            )}${isDefaultCollateral ? '' : ` (${formatCurrencyWithSign(USD_SIGN, maxBuyinAmount)})`}`,
                        })}
                        placeholder={t('common.enter-amount')}
                        currencyComponent={
                            <CollateralSelector
                                collateralArray={getCollaterals(networkId)}
                                selectedItem={selectedCollateralIndex}
                                onChangeCollateral={() => setBuyinAmount('')}
                                isDetailedView
                                collateralBalances={
                                    isFreeBetActive ? freeBetCollateralBalances : multipleCollateralBalances.data
                                }
                                exchangeRates={exchangeRates}
                                dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                dropDownMaxHeight={getCollaterals(networkId).length > 6 ? '220px' : undefined}
                            />
                        }
                        onMaxButton={onMaxClick}
                        inputFontWeight="600"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                        margin="0"
                        validationZIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                    />
                </AmountToBuyContainer>
            </InputContainer>
        </>
    );
};

const InputContainer = styled(FlexDiv)``;

const AmountToBuyContainer = styled.div`
    position: relative;
    width: 100%;
`;

export default SelectBuyin;

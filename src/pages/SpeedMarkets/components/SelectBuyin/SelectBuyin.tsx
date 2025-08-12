import CollateralSelector from 'components/CollateralSelector';
import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import SuggestedAmount from 'components/SuggestedAmount';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { OVER_CONTRACT_RATE_KEY } from 'constants/markets';
import { BICONOMY_MAX_FEE_PERCENTAGE } from 'constants/speedMarkets';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { SpeedPositions } from 'enums/speedMarkets';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    getIsFreeBetDisabledByUser,
    getTicketPayment,
    setIsFreeBetDisabledByUser,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivStart } from 'styles/common';
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
    getCollateralText,
    getDefaultCollateral,
    getMaxCollateralDollarValue,
    isOverCurrency,
    isStableCurrency,
    mapMultiCollateralBalances,
} from 'utils/collaterals';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const BUYIN_AMOUNTS = [3, 10, 50, 100, 500];

type SelectBuyinProps = {
    selectedAsset: string;
    buyinAmount: number | string;
    setBuyinAmount: Dispatch<SetStateAction<string | number>>;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    setHasError: Dispatch<boolean>;
    isFreeBetActive: boolean;
    setIsFreeBetActive: Dispatch<boolean>;
};

const SelectBuyin: React.FC<SelectBuyinProps> = ({
    selectedAsset,
    buyinAmount,
    setBuyinAmount,
    ammSpeedMarketsLimits,
    setHasError,
    isFreeBetActive,
    setIsFreeBetActive,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();

    const isBiconomy = useSelector(getIsBiconomy);
    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;
    const isFreeBetDisabledByUser = useSelector(getIsFreeBetDisabledByUser);

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);
    const [checkFreeBetBalance, setCheckFreeBetBalance] = useState(false);
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
        freeBetCollateralBalancesQuery.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery.data.balances
            : undefined;
    const freeBetCollateralValidity =
        freeBetCollateralBalancesQuery.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery.data.validity
            : undefined;

    const freeBetBalanceExists = freeBetCollateralBalances
        ? !!Object.values(freeBetCollateralBalances).find((balance) => balance)
        : false;

    // Set free bet if user has free bet balance
    useEffect(() => {
        if (freeBetBalanceExists) {
            setIsFreeBetActive(true);
        }
    }, [freeBetBalanceExists, setIsFreeBetActive]);

    const resetFreeBet = useCallback(() => {
        setIsFreeBetInitialized(false);
        setIsFreeBetActive(false);
        setCheckFreeBetBalance(false);
    }, [setIsFreeBetActive]);

    // Reset free bet
    useEffect(() => {
        resetFreeBet();
    }, [walletAddress, resetFreeBet]);

    // Select initially Free Bet if exists at least min for buy
    useEffect(() => {
        if (!freeBetBalanceExists) {
            resetFreeBet();
        } else if (!isFreeBetDisabledByUser && !isFreeBetInitialized && Math.min(...BUYIN_AMOUNTS)) {
            const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);
            if (!balanceList) return;

            const selectedCollateralItem = balanceList?.find((item) => item.collateralKey == selectedCollateral);

            const isSelectedCollateralBalanceLowerThanMin =
                selectedCollateralItem && selectedCollateralItem.balanceDollarValue < Math.min(...BUYIN_AMOUNTS);

            if (isSelectedCollateralBalanceLowerThanMin) {
                setIsFreeBetActive(false);
            } else if (!isFreeBetActive) {
                setIsFreeBetActive(true);
            }
            setCheckFreeBetBalance(true);
            setIsFreeBetInitialized(true);
        }
    }, [
        resetFreeBet,
        freeBetCollateralBalances,
        exchangeRates,
        networkId,
        selectedCollateral,
        freeBetBalanceExists,
        isFreeBetActive,
        isFreeBetInitialized,
        isFreeBetDisabledByUser,
        setIsFreeBetActive,
    ]);

    // Select max balance collateral for Free Bet
    useEffect(() => {
        if (checkFreeBetBalance && Math.min(...BUYIN_AMOUNTS)) {
            const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);
            if (!balanceList) return;

            const selectedCollateralItem = balanceList?.find((item) => item.collateralKey == selectedCollateral);

            const isSelectedCollateralBalanceLowerThanMin =
                selectedCollateralItem && selectedCollateralItem.balanceDollarValue < Math.min(...BUYIN_AMOUNTS);

            const maxBalanceItem = getMaxCollateralDollarValue(balanceList);
            const isMaxBalanceLowerThanMin =
                maxBalanceItem && maxBalanceItem.balanceDollarValue < Math.min(...BUYIN_AMOUNTS);

            if (
                maxBalanceItem &&
                !isMaxBalanceLowerThanMin &&
                selectedCollateral !== maxBalanceItem.collateralKey &&
                (!ticketPayment.forceChangeCollateral || isSelectedCollateralBalanceLowerThanMin)
            ) {
                dispatch(
                    setPaymentSelectedCollateralIndex({
                        selectedCollateralIndex: maxBalanceItem.index,
                        networkId,
                    })
                );
                if (!isFreeBetDisabledByUser) {
                    setIsFreeBetActive(true);
                }
            }
            setCheckFreeBetBalance(false);
        }
    }, [
        dispatch,
        exchangeRates,
        isFreeBetActive,
        freeBetCollateralBalances,
        freeBetBalanceExists,
        selectedCollateral,
        networkId,
        ticketPayment.forceChangeCollateral,
        checkFreeBetBalance,
        isFreeBetDisabledByUser,
        setIsFreeBetActive,
    ]);

    const paymentTokenBalance: number = useMemo(() => {
        if (isFreeBetActive && freeBetBalanceExists && freeBetCollateralBalances) {
            return freeBetCollateralBalances[selectedCollateral] || 0;
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
            const rate =
                exchangeRates?.[isOverCurrency(selectedCollateral) ? OVER_CONTRACT_RATE_KEY : selectedCollateral] || 0;
            return convertFromStableToCollateral(selectedCollateral, value, rate, networkId);
        },
        [selectedCollateral, exchangeRates, networkId]
    );

    // Input field validations
    useDebouncedEffect(() => {
        let errorMessageKey = '';
        if (isFreeBetActive && paymentTokenBalance > 0 && freeBetCollateralValidity) {
            const isFreeBetCollateralValid = freeBetCollateralValidity[selectedCollateral];
            if (!isFreeBetCollateralValid) {
                errorMessageKey = 'common.errors.free-bet-invalid';
            }
        }

        if (!errorMessageKey && buyinAmount !== '') {
            if (Number(buyinAmount) < convertFromStable(minBuyinAmount)) {
                errorMessageKey = 'speed-markets.errors.min-buyin';
            } else if (Number(buyinAmount) > convertFromStable(maxBuyinAmount)) {
                errorMessageKey = 'speed-markets.errors.max-buyin';
            }
        }
        if (!errorMessageKey && buyinAmount !== '') {
            if ((isConnected && Number(buyinAmount) > paymentTokenBalance) || paymentTokenBalance === 0) {
                errorMessageKey = 'common.errors.insufficient-balance-wallet';
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
                    {freeBetBalanceExists && (
                        <FreeBetRow>
                            <FreeBetIcon className="icon icon--gift" />
                            <FreeBetLabel>
                                {t('markets.parlay.use-free-bet')}
                                <Tooltip
                                    overlay={<>{t('profile.free-bet.claim-btn')}</>}
                                    mouseEnterDelay={0.3}
                                    iconFontSize={14}
                                    iconColor={theme.textColor.septenary}
                                    marginLeft={3}
                                    zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                                />
                                :
                            </FreeBetLabel>
                            <CheckboxContainer>
                                <Checkbox
                                    disabled={false}
                                    checked={isFreeBetActive}
                                    value={isFreeBetActive.toString()}
                                    onChange={(e: any) => {
                                        const isChecked = e.target.checked || false;
                                        setIsFreeBetActive(isChecked);
                                        dispatch(setIsFreeBetDisabledByUser(!isChecked));
                                        if (isChecked) {
                                            setCheckFreeBetBalance(true);
                                        }
                                    }}
                                />
                            </CheckboxContainer>
                        </FreeBetRow>
                    )}
                    <NumericInput
                        value={buyinAmount}
                        onChange={(e) => setBuyinAmount(e.target.value)}
                        showValidation={inputRefVisible && !!errorMessageKey}
                        validationPlacement={freeBetBalanceExists ? 'bottom' : undefined}
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
                                dropDownMaxHeight={getCollaterals(networkId).length > 4 ? '160px' : undefined}
                            />
                        }
                        balance={formatCurrencyWithKey(getCollateralText(selectedCollateral), paymentTokenBalance)}
                        label={freeBetBalanceExists ? undefined : t('common.buy-in')}
                        labelColor={theme.input.textColor.secondary}
                        onMaxButton={onMaxClick}
                        inputFontWeight="600"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                        margin="0"
                        validationZIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                        preventAutoFocus
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

const FreeBetRow = styled(FlexDivStart)`
    align-items: center;
    height: 15px;
    margin-bottom: 6px;
`;

const FreeBetLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 15px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const CheckboxContainer = styled.div`
    margin-left: 8px;
    label {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 12px;
        line-height: 13px;
        font-weight: 600;
        letter-spacing: 0.035em;
        text-transform: uppercase;
        padding-top: 16px;
        padding-left: 16px;
        input:checked ~ .checkmark {
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        }
    }
    .checkmark {
        height: 15px;
        width: 15px;
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        :after {
            left: 3px;
            width: 3px;
            height: 8px;
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
            border-width: 0 2px 2px 0;
        }
    }
`;

const FreeBetIcon = styled.i`
    font-size: 13px;
    text-transform: none;
    margin-right: 3px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export default SelectBuyin;

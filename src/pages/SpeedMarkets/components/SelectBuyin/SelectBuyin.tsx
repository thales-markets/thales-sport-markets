import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import SuggestedAmount from 'components/SuggestedAmount';
import { BICONOMY_MAX_FEE_PERCENTAGE } from 'constants/speedMarkets';
import { SpeedPositions } from 'enums/speedMarkets';
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
import { truncToDecimals } from 'thales-utils';
import { AmmSpeedMarketsLimits } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import {
    convertCollateralToStable,
    convertFromStableToCollateral,
    getCollateral,
    getCollaterals,
    isStableCurrency,
} from 'utils/collaterals';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const BUYIN_AMOUNTS = [5, 10, 50, 100, 500];

type SelectBuyinProps = {
    selectedAsset: string;
    buyinAmount: number | string;
    setBuyinAmount: Dispatch<SetStateAction<string | number>>;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    isAllowing: boolean;
    isBuying: boolean;
};

const SelectBuyin: React.FC<SelectBuyinProps> = ({
    selectedAsset,
    buyinAmount,
    setBuyinAmount,
    ammSpeedMarketsLimits,
    isAllowing,
    isBuying,
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

    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);

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

    const onMaxClick = () => {
        const maxWalletAmount = isConnected
            ? Number(
                  truncToDecimals(
                      isBiconomy ? paymentTokenBalance * (1 - BICONOMY_MAX_FEE_PERCENTAGE) : paymentTokenBalance,
                      isStableCurrency(selectedCollateral) ? 2 : 18
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
                        showValidation={
                            inputRefVisible && false /* TODO: !!tooltipTextBuyInAmount && !openApprovalModal */
                        }
                        validationMessage={'' /* TODO: tooltipTextBuyInAmount */}
                        disabled={isAllowing || isBuying}
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
                            />
                        }
                        balance={'' /* TODO: formatCurrencyWithKey(selectedCollateral, paymentTokenBalance) */}
                        onMaxButton={onMaxClick}
                        inputFontWeight="600"
                        inputPadding="5px 10px"
                        borderColor={theme.input.borderColor.tertiary}
                        margin="0"
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
    // margin-top: 21px; // use if balance is displayed
`;

export default SelectBuyin;

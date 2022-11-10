import { COLLATERALS_INDEX, COLLATERAL_INDEX_TO_COLLATERAL } from 'constants/currency';
import { COLLATERALS } from 'constants/markets';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrency } from 'utils/formatters/number';
import { BalanceLabel, BalanceValue, BalanceWrapper, RowSummary, SummaryLabel } from '../styled-components';
import CollateralSelector from '../CollateralSelector';

type PaymentProps = {
    defaultSelectedStableIndex?: COLLATERALS_INDEX;
    defaultIsVoucherSelected?: boolean;
    onChangeCollateral?: (index: number) => void;
    setIsVoucherSelectedProp?: (selected: boolean) => void;
};

const Payment: React.FC<PaymentProps> = ({
    defaultSelectedStableIndex,
    defaultIsVoucherSelected,
    onChangeCollateral,
    setIsVoucherSelectedProp,
}) => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [selectedStableIndex, setSelectedStableIndex] = useState<COLLATERALS_INDEX>(
        defaultSelectedStableIndex !== undefined ? defaultSelectedStableIndex : COLLATERALS_INDEX.sUSD
    );
    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(!!defaultIsVoucherSelected);

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
        refetchInterval: 5000,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            if (defaultIsVoucherSelected === undefined || defaultIsVoucherSelected) {
                setIsVoucherSelected(true);
            }
            return overtimeVoucherQuery.data;
        }
        setIsVoucherSelected(false);
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data, defaultIsVoucherSelected]);

    const paymentTokenBalance: number = useMemo(() => {
        if (overtimeVoucher && isVoucherSelected) {
            return overtimeVoucher.remainingAmount;
        }
        if (multipleStableBalances.data && multipleStableBalances.isSuccess) {
            return multipleStableBalances.data[COLLATERALS[selectedStableIndex]];
        }
        return 0;
    }, [
        multipleStableBalances.data,
        multipleStableBalances.isSuccess,
        selectedStableIndex,
        overtimeVoucher,
        isVoucherSelected,
    ]);

    const handleSetIsVoucherSelected = (isSelected: boolean) => {
        setIsVoucherSelectedProp && setIsVoucherSelectedProp(isSelected);
        setIsVoucherSelected(isSelected);
    };

    return (
        <>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.pay-with')}:</SummaryLabel>
                <BalanceWrapper>
                    <BalanceLabel bold={true} originalText={true}>
                        {(COLLATERAL_INDEX_TO_COLLATERAL as any)[selectedStableIndex]}
                    </BalanceLabel>
                    <BalanceLabel marginLeft={'5px'}>{t('markets.parlay.available')}:</BalanceLabel>
                    <BalanceValue>{formatCurrency(paymentTokenBalance, 2)}</BalanceValue>
                </BalanceWrapper>
            </RowSummary>
            <CollateralSelector
                collateralArray={COLLATERALS}
                selectedItem={selectedStableIndex}
                onChangeCollateral={(index) => {
                    setSelectedStableIndex(index);
                    onChangeCollateral && onChangeCollateral(index);
                }}
                overtimeVoucher={overtimeVoucher}
                isVoucherSelected={isVoucherSelected}
                setIsVoucherSelected={handleSetIsVoucherSelected}
            />
        </>
    );
};

export default Payment;

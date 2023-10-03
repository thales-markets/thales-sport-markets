import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrency } from 'utils/formatters/number';
import { BalanceLabel, BalanceValue, BalanceWrapper, RowSummary, SummaryLabel } from '../styled-components';
import CollateralSelector from '../CollateralSelector';
import { getDefaultCollateralIndexForNetworkId, getIsMultiCollateralSupported } from 'utils/network';
import { getCollateral, getCollaterals, getDefaultCollateral } from 'utils/collaterals';

type PaymentProps = {
    defaultSelectedStableIndex?: number;
    defaultIsVoucherSelected?: boolean;
    showCollateralSelector?: boolean;
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

    const [selectedStableIndex, setSelectedStableIndex] = useState(
        defaultSelectedStableIndex !== undefined
            ? defaultSelectedStableIndex
            : getDefaultCollateralIndexForNetworkId(networkId)
    );

    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(!!defaultIsVoucherSelected);

    useEffect(() => {
        if (defaultSelectedStableIndex !== undefined) {
            setSelectedStableIndex(defaultSelectedStableIndex);
        }
    }, [defaultSelectedStableIndex]);

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
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
            return multipleStableBalances.data[getCollateral(networkId, selectedStableIndex)];
        }
        return 0;
    }, [
        networkId,
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

    const collateralKey = isVoucherSelected
        ? getDefaultCollateral(networkId)
        : getCollateral(networkId, selectedStableIndex);

    const showMultiCollateral = overtimeVoucher !== undefined || getIsMultiCollateralSupported(networkId);

    return (
        <>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.pay-with')}:</SummaryLabel>
                <BalanceWrapper>
                    <BalanceLabel bold={true} originalText={true}>
                        {collateralKey}
                    </BalanceLabel>
                    <BalanceLabel marginLeft={'5px'}>{t('markets.parlay.available')}:</BalanceLabel>
                    <BalanceValue>{formatCurrency(paymentTokenBalance, 2)}</BalanceValue>
                </BalanceWrapper>
            </RowSummary>
            {showMultiCollateral && (
                <CollateralSelector
                    collateralArray={getCollaterals(networkId)}
                    selectedItem={selectedStableIndex}
                    onChangeCollateral={(index) => {
                        setSelectedStableIndex(index);
                        onChangeCollateral && onChangeCollateral(index);
                    }}
                    overtimeVoucher={overtimeVoucher}
                    isVoucherSelected={isVoucherSelected}
                    setIsVoucherSelected={handleSetIsVoucherSelected}
                />
            )}
        </>
    );
};

export default Payment;

import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrency } from 'utils/formatters/number';
import { BalanceLabel, BalanceValue, BalanceWrapper, RowSummary, SummaryLabel } from '../styled-components';
import CollateralSelector from '../CollateralSelector';
import { getIsMultiCollateralSupported } from 'utils/network';
import { getCollateral, getCollaterals, getDefaultCollateral } from 'utils/collaterals';
import { getParlayPayment } from '../../../../../../redux/modules/parlay';

const Payment: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const parlayPayment = useSelector(getParlayPayment);

    const isVoucherSelected = parlayPayment.isVoucherSelected;
    const selectedStableIndex = parlayPayment.selectedStableIndex;

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    const paymentTokenBalance: number = useMemo(() => {
        if (overtimeVoucher && isVoucherSelected) {
            return overtimeVoucher.remainingAmount;
        }
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[getCollateral(networkId, selectedStableIndex)];
        }
        return 0;
    }, [
        networkId,
        multipleCollateralBalances.data,
        multipleCollateralBalances.isSuccess,
        selectedStableIndex,
        overtimeVoucher,
        isVoucherSelected,
    ]);

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
                <CollateralSelector collateralArray={getCollaterals(networkId)} overtimeVoucher={overtimeVoucher} />
            )}
        </>
    );
};

export default Payment;

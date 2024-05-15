import Checkbox from 'components/fields/Checkbox';
import { USD_SIGN } from 'constants/currency';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import {
    getTicketPayment,
    setPaymentIsVoucherAvailable,
    setPaymentIsVoucherSelected,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrencyWithSign } from 'thales-utils';
import { CheckboxContainer, RowContainer, RowSummary, SummaryLabel, SummaryValue } from '../styled-components';

type VoucherProps = {
    disabled?: boolean;
};

const Voucher: React.FC<VoucherProps> = ({ disabled }) => {
    const { t } = useTranslation();

    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const ticketPayment = useSelector(getTicketPayment);
    const isVoucherSelected = ticketPayment.isVoucherSelected;
    const isVoucherAvailable = ticketPayment.isVoucherAvailable;

    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    useEffect(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            dispatch(setPaymentIsVoucherAvailable(true));
            dispatch(setPaymentIsVoucherSelected(true));
            dispatch(setPaymentSelectedCollateralIndex({ selectedCollateralIndex: 0, networkId: networkId }));
        } else {
            dispatch(setPaymentIsVoucherAvailable(false));
            dispatch(setPaymentIsVoucherSelected(false));
        }
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data, dispatch, networkId]);

    return (
        <>
            {isVoucherAvailable && (
                <RowSummary>
                    <RowContainer>
                        <SummaryLabel>{t('markets.parlay.pay-with-voucher')}:</SummaryLabel>
                        <SummaryValue fontSize={12}>
                            {formatCurrencyWithSign(USD_SIGN, overtimeVoucher?.remainingAmount || 0, 2)}
                        </SummaryValue>
                        <CheckboxContainer>
                            <Checkbox
                                disabled={disabled}
                                checked={isVoucherSelected}
                                value={isVoucherSelected.toString()}
                                onChange={(e: any) => {
                                    dispatch(setPaymentIsVoucherSelected(e.target.checked || false));
                                    dispatch(
                                        setPaymentSelectedCollateralIndex({
                                            selectedCollateralIndex: 0,
                                            networkId: networkId,
                                        })
                                    );
                                }}
                            />
                        </CheckboxContainer>
                    </RowContainer>
                </RowSummary>
            )}
        </>
    );
};

export default Voucher;

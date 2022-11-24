import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { PAYMENT_CURRENCY } from 'constants/currency';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import Tooltip from 'components/Tooltip';
import OvertimeVoucherPopup from 'components/OvertimeVoucherPopup';
import ConnectButton from 'components/ConnectButton';

const WalletInfo: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    return (
        <Container hasVoucher={!!overtimeVoucher} isMobile={isMobile}>
            <FlexDivColumn>
                <ConnectButton />
                {overtimeVoucher && (
                    <Tooltip
                        overlay={
                            <OvertimeVoucherPopup
                                title={t('common.voucher.overtime-voucher')}
                                imageSrc={overtimeVoucher.image}
                                text={`${t('common.voucher.remaining-amount')}: ${formatCurrencyWithKey(
                                    PAYMENT_CURRENCY,
                                    overtimeVoucher.remainingAmount
                                )}`}
                            />
                        }
                        component={
                            <VoucherContainer>
                                <Wallet>
                                    <VoucherInfo>{t('common.voucher.voucher')}:</VoucherInfo>
                                </Wallet>
                                <VoucherBalance>
                                    <Info>{formatCurrency(overtimeVoucher.remainingAmount, 2)}</Info>
                                    <Currency>{PAYMENT_CURRENCY}</Currency>
                                </VoucherBalance>
                            </VoucherContainer>
                        }
                        overlayClassName="overtime-voucher-overlay"
                    />
                )}
            </FlexDivColumn>
        </Container>
    );
};

const Container = styled(FlexDivCentered)<{ hasVoucher: boolean; isMobile?: boolean }>`
    border: ${(props) => (props.isMobile ? '1px solid ' + props.theme.borderColor.primary : ' ')};
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
    position: relative;
    justify-content: end;
    min-width: fit-content;
    margin-bottom: ${(props) => (props.hasVoucher ? '-28px' : '0px')};
    @media (max-width: 767px) {
        min-width: auto;
        margin-bottom: ${(props) => (props.hasVoucher ? '-10px' : '0px')};
    }
`;

const Wallet = styled(FlexDivRowCentered)`
    padding-right: 10px;
    width: 95px;
    text-align: center;
`;

const Info = styled.span`
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    line-height: 17px;
`;

const Currency = styled(Info)`
    font-weight: bold;
    margin-left: 4px;
`;

export const VoucherImage = styled.img`
    height: 150px;
`;

const VoucherContainer = styled(FlexDivRowCentered)`
    height: 28px;
    margin: 0 10px;
    cursor: pointer;
    border-top: 1px solid ${(props) => props.theme.borderColor.secondary};
`;

const VoucherInfo = styled(Info)`
    text-transform: uppercase;
    padding-left: 10px;
`;

const VoucherBalance = styled(FlexDivRowCentered)`
    padding-left: 10px;
    padding-right: 10px;
`;

export default WalletInfo;

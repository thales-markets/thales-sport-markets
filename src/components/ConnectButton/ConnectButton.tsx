import React, { useMemo } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRowCentered } from '../../styles/common';
import { PAYMENT_CURRENCY } from '../../constants/currency';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from '../../utils/formatters/string';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from '../../redux/modules/wallet';
import { useSelector } from 'react-redux';
import useSUSDWalletBalance from '../../queries/wallet/usesUSDWalletBalance';
import { formatCurrency } from '../../utils/formatters/number';
import { getIsAppReady } from '../../redux/modules/app';
import useOvertimeVoucherQuery from '../../queries/wallet/useOvertimeVoucherQuery';

const ConnectButton: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const sUSDBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const sUSDBalance = useMemo(() => {
        if (sUSDBalanceQuery.data) {
            return formatCurrency(sUSDBalanceQuery?.data, 2);
        }
        return 0;
    }, [sUSDBalanceQuery.data]);

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
        <RainbowConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                const connected = mounted && account && chain;

                return (
                    <div
                        {...(!mounted && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        <WalletContainer hasVoucher={!!overtimeVoucher}>
                            {(() => {
                                if (!connected) {
                                    return <Info onClick={openConnectModal}>Connect Wallet</Info>;
                                }

                                return (
                                    <FlexDivRowCentered onClick={openAccountModal}>
                                        <Wallet className="wallet-info">
                                            <Info>{truncateAddress(walletAddress)}</Info>
                                        </Wallet>
                                        <Wallet className="wallet-info-hover">
                                            <Info>{t('common.wallet.wallet-options')}</Info>
                                        </Wallet>
                                        <Balance hasVoucher={!!overtimeVoucher}>
                                            <Info>{sUSDBalance}</Info>
                                            <Currency>{PAYMENT_CURRENCY}</Currency>
                                        </Balance>
                                    </FlexDivRowCentered>
                                );
                            })()}
                        </WalletContainer>
                    </div>
                );
            }}
        </RainbowConnectButton.Custom>
    );
};

const WalletContainer = styled(FlexDivRowCentered)<{ hasVoucher: boolean }>`
    height: 28px;
    padding: 0 20px;
    cursor: pointer;
    .wallet-info-hover {
        display: none;
    }
    :hover {
        background: ${(props) => props.theme.background.tertiary};
        color: ${(props) => props.theme.textColor.primary};
        i {
            :before {
                color: ${(props) => props.theme.button.textColor.primary};
            }
        }
        .wallet-info {
            display: none;
        }
        .wallet-info-hover {
            display: inline;
            width: fit-content;
        }
    }
    border-radius: ${(props) => (props.hasVoucher ? '5px 5px 0px 0px' : '5px')};
    overflow: hidden;
`;

const Wallet = styled(FlexDivRowCentered)`
    padding-right: 10px;
    min-width: 95px;
    text-align: center;
`;

const Balance = styled(FlexDivRowCentered)<{ hasVoucher: boolean }>`
    border-left: 1px solid ${(props) => (props.hasVoucher ? 'transparent' : props.theme.borderColor.secondary)};
    padding-left: 10px;
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

export default ConnectButton;

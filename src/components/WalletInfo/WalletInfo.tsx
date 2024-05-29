import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import ConnectWalletModal from 'components/ConnectWalletModal';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import {
    getIsConnectedViaParticle,
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    getWalletConnectModalVisibility,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { formatCurrency, truncateAddress } from 'thales-utils';

import NetworkSwitcher from 'components/NetworkSwitcher';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { getDefaultCollateral } from 'utils/collaterals';

const WalletInfo: React.FC = ({}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));

    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    const stableCointBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const stableCoinBalance = useMemo(() => {
        return stableCointBalanceQuery?.data || 0;
    }, [stableCointBalanceQuery.data]);

    const walletBalance = overtimeVoucher ? overtimeVoucher.remainingAmount : stableCoinBalance;

    return (
        <Container walletConnected={isWalletConnected}>
            <FlexDivColumn>
                <RainbowConnectButton.Custom>
                    {({ openAccountModal }) => {
                        return (
                            <Wrapper displayPadding={isWalletConnected}>
                                {isWalletConnected && (
                                    <WalletAddressInfo
                                        isWalletConnected={isWalletConnected}
                                        isClickable={true}
                                        onClick={
                                            !isConnectedViaParticle
                                                ? () => openAccountModal()
                                                : () => window.open(PARTICLE_WALLET, '_blank')
                                        }
                                    >
                                        <Text className="wallet-info">
                                            {isWalletConnected
                                                ? truncateAddress(walletAddress, 5, 5)
                                                : t('common.wallet.connect-your-wallet')}
                                        </Text>
                                    </WalletAddressInfo>
                                )}
                                {isWalletConnected &&
                                    (overtimeVoucher ? (
                                        <WalletBalanceInfo>
                                            <VoucherText>{t('common.voucher.voucher')}:</VoucherText>
                                            <Text>{formatCurrency(walletBalance, 2)}</Text>
                                            <Currency>{getDefaultCollateral(networkId)}</Currency>
                                        </WalletBalanceInfo>
                                    ) : (
                                        <WalletBalanceInfo>
                                            <Text>{formatCurrency(walletBalance, 2)}</Text>
                                            <Currency>{getDefaultCollateral(networkId)}</Currency>
                                        </WalletBalanceInfo>
                                    ))}
                                <NetworkSwitcher />
                            </Wrapper>
                        );
                    }}
                </RainbowConnectButton.Custom>
            </FlexDivColumn>
            {connectWalletModalVisibility && (
                <ConnectWalletModal
                    isOpen={connectWalletModalVisibility}
                    onClose={() => {
                        dispatch(
                            setWalletConnectModalVisibility({
                                visibility: false,
                            })
                        );
                    }}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivCentered)<{ walletConnected?: boolean }>`
    width: ${(props) => (props.walletConnected ? '100%' : 'auto')};
    color: ${(props) => props.theme.textColor.secondary};
    border-radius: 5px;
    position: relative;
    justify-content: end;
    min-width: fit-content;
    @media (max-width: 767px) {
        min-width: auto;
    }
`;

const Wrapper = styled.div<{ displayPadding?: boolean }>`
    display: flex;
    border-radius: 20px;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    height: 28px;
    justify-content: space-between;
    align-items: center;
    padding-left: ${(props) => (props.displayPadding ? '10px' : '')};
    & > div {
        flex: 0.4;
    }
    & > div:last-child {
        flex: 0.2;
    }
`;

const WalletAddressInfo = styled.div<{ isWalletConnected: boolean; isClickable?: boolean }>`
    justify-content: center;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
    min-width: 77px;
    height: 100%;
    align-items: center;
    display: flex;

    .wallet-info-hover {
        display: none;
    }
    :hover {
        .wallet-info-hover {
            display: inline;
            width: fit-content;
        }
    }

    @media (max-width: 950px) {
        border-right: none;
        padding-right: 0;
    }
`;

const WalletBalanceInfo = styled.div`
    justify-content: center;
    border-left: 2px solid ${(props) => props.theme.borderColor.primary};
    padding-left: 7px;
    padding-right: 6px;
    height: 70%;
    align-items: center;
    display: flex;
`;

const Text = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 10.8px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const VoucherText = styled(Text)`
    text-transform: uppercase;
    padding-right: 2px;
`;

const Currency = styled(Text)`
    font-weight: bold;
    margin-left: 2px;
`;

const PARTICLE_WALLET = 'https://wallet.particle.network/';

export default WalletInfo;

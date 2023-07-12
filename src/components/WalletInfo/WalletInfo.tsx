import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress, switchToNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { truncateAddress } from 'utils/formatters/string';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import OutsideClickHandler from 'react-outside-click-handler';
import { hasEthereumInjected } from 'utils/network';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import { formatCurrency } from 'utils/formatters/number';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { Network } from 'enums/network';
import { NETWORK_SWITCHER_SUPPORTED_NETWORKS, SUPPORTED_NETWORKS_DESCRIPTIONS } from 'constants/network';
import { useSwitchNetwork } from 'wagmi';
import { getDefaultCollateral } from 'utils/collaterals';

const WalletInfo: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { switchNetwork } = useSwitchNetwork();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [dropDownOpen, setDropDownOpen] = useState(false);

    const stableCointBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const stableCoinBalance = useMemo(() => {
        return stableCointBalanceQuery?.data || 0;
    }, [stableCointBalanceQuery.data]);

    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            return overtimeVoucherQuery.data;
        }
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    const walletBalance = overtimeVoucher ? overtimeVoucher.remainingAmount : stableCoinBalance;

    // currently not supported network synchronization between browser without integrated wallet and wallet app on mobile
    const hideNetworkSwitcher =
        isMobile &&
        !window.ethereum?.isMetaMask &&
        !window.ethereum?.isBraveWallet &&
        !window.ethereum?.isCoinbaseWallet &&
        !window.ethereum?.isTrust;

    return (
        <Container>
            <FlexDivColumn>
                <RainbowConnectButton.Custom>
                    {({ openConnectModal, openAccountModal }) => {
                        return (
                            <Wrapper>
                                <WalletAddressInfo
                                    isWalletConnected={isWalletConnected}
                                    isClickable={true}
                                    onClick={isWalletConnected ? openAccountModal : openConnectModal}
                                >
                                    <Text className="wallet-info">
                                        {isWalletConnected
                                            ? truncateAddress(walletAddress, 5, 5)
                                            : t('common.wallet.connect-your-wallet')}
                                    </Text>
                                    {isWalletConnected && (
                                        <Text className="wallet-info-hover">{t('common.wallet.wallet-options')}</Text>
                                    )}
                                </WalletAddressInfo>
                                {!isMobile &&
                                    isWalletConnected &&
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
                                <OutsideClickHandler onOutsideClick={() => setDropDownOpen(false)}>
                                    <NetworkIconWrapper onClick={() => setDropDownOpen(!dropDownOpen)}>
                                        <NetworkIcon
                                            className={`icon ${
                                                networkId === Network.ArbitrumOne ? 'icon--arb' : 'icon--op'
                                            }`}
                                        />
                                        {!hideNetworkSwitcher && <DownIcon className={`icon icon--arrow-down`} />}
                                    </NetworkIconWrapper>
                                    {dropDownOpen && !hideNetworkSwitcher && (
                                        <NetworkDropDown>
                                            {NETWORK_SWITCHER_SUPPORTED_NETWORKS.map((network) => (
                                                <NetworkWrapper
                                                    key={network.shortChainName}
                                                    onClick={async () => {
                                                        if (networkId !== network.networkId) {
                                                            if (hasEthereumInjected()) {
                                                                try {
                                                                    await (window.ethereum as any).request({
                                                                        method: 'wallet_switchEthereumChain',
                                                                        params: [{ chainId: network.chainId }],
                                                                    });
                                                                    switchNetwork?.(network.networkId);
                                                                    // Trigger App.js init
                                                                    // do not use updateNetworkSettings(networkId) as it will trigger queries before provider is initialized in App.js
                                                                    dispatch(
                                                                        switchToNetworkId({
                                                                            networkId: network.networkId as Network,
                                                                        })
                                                                    );
                                                                } catch (switchError: any) {
                                                                    if (switchError.code === 4902) {
                                                                        try {
                                                                            await (window.ethereum as any).request({
                                                                                method: 'wallet_addEthereumChain',
                                                                                params: [
                                                                                    SUPPORTED_NETWORKS_DESCRIPTIONS[
                                                                                        +network.chainId
                                                                                    ],
                                                                                ],
                                                                            });
                                                                            await (window.ethereum as any).request({
                                                                                method: 'wallet_switchEthereumChain',
                                                                                params: [{ chainId: network.chainId }],
                                                                            });
                                                                        } catch (addError) {
                                                                            console.log(addError);
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                switchNetwork?.(network.networkId);
                                                                // Trigger App.js init
                                                                // do not use updateNetworkSettings(networkId) as it will trigger queries before provider is initialized in App.js
                                                                dispatch(
                                                                    switchToNetworkId({
                                                                        networkId: network.networkId as Network,
                                                                    })
                                                                );
                                                            }
                                                        }

                                                        setDropDownOpen(false);
                                                    }}
                                                >
                                                    <NetworkIcon className={network.iconClassName} />
                                                    <NetworkText>
                                                        {networkId === network.networkId && (
                                                            <NetworkSelectedIndicator />
                                                        )}
                                                        {network.shortChainName}
                                                    </NetworkText>
                                                </NetworkWrapper>
                                            ))}
                                        </NetworkDropDown>
                                    )}
                                </OutsideClickHandler>
                            </Wrapper>
                        );
                    }}
                </RainbowConnectButton.Custom>
            </FlexDivColumn>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 5px;
    position: relative;
    justify-content: end;
    min-width: fit-content;
    @media (max-width: 767px) {
        min-width: auto;
    }
`;

const Wrapper = styled.div`
    display: flex;
    border-radius: 20px;
    border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    min-width: 160px;
    height: 28px;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
`;

const WalletAddressInfo = styled.div<{ isWalletConnected: boolean; isClickable?: boolean }>`
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
    min-width: 77px;
    height: 100%;
    align-items: center;
    display: flex;

    .wallet-info-hover {
        display: none;
    }
    :hover {
        .wallet-info {
            ${(props) => (props.isWalletConnected ? ' display: none;' : '')}
        }
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
    border-left: 2px solid ${(props) => props.theme.borderColor.quaternary};
    padding-left: 7px;
    padding-right: 6px;
    height: 70%;
    align-items: center;
    display: flex;
`;

const NetworkIconWrapper = styled.div`
    background: ${(props) => props.theme.background.quaternary};
    height: 28px;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    gap: 4px;
    align-items: center;
    max-width: 65px;
    min-width: 65px;
    cursor: pointer;
    margin-right: -1px;
`;

const Text = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 10.8px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const VoucherText = styled(Text)`
    text-transform: uppercase;
    padding-right: 2px;
`;

const Currency = styled(Text)`
    font-weight: bold;
    margin-left: 2px;
`;

const NetworkText = styled.span`
    position: relative;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 10.8px;
    line-height: 13px;
    cursor: pointer;
    color: ${(props) => props.theme.button.textColor.primary};
    text-align: left;
`;

const NetworkIcon = styled.i`
    font-size: 24px;
    color: ${(props) => props.theme.button.textColor.primary};
    &.icon--arb {
        position: relative;
        left: -2px;
    }
`;
const DownIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.button.textColor.primary};
`;

const NetworkDropDown = styled.div`
    z-index: 1000;
    position: absolute;
    top: 30px;
    left: 0px;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background: ${(props) => props.theme.background.quaternary};
    width: 100%;
    min-width: 160px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
`;

const NetworkWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    width: 100%;
`;

const NetworkSelectedIndicator = styled.div`
    position: absolute;
    background: ${(props) => props.theme.background.primary};
    border-radius: 20px;
    width: 6px;
    height: 6px;
    left: -45px;
    top: 3px;
`;

export default WalletInfo;

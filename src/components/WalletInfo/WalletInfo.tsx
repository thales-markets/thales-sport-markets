import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import ConnectWalletModal from 'components/ConnectWalletModal';
import { DEFAULT_NETWORK, SUPPORTED_NETWORKS_PARAMS } from 'constants/network';
import { Network } from 'enums/network';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    getWalletConnectModalVisibility,
    setWalletConnectModalVisibility,
    switchToNetworkId,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { getDefaultCollateral } from 'utils/collaterals';
import { formatCurrency } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import { changeNetwork } from 'utils/network';
import { useSwitchNetwork } from 'wagmi';

type WalletInfoProps = {
    onCloseMobile?: () => void;
};

const WalletInfo: React.FC<WalletInfoProps> = ({ onCloseMobile }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { switchNetwork } = useSwitchNetwork();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));

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

    const selectedNetwork = useMemo(
        () => SUPPORTED_NETWORKS_PARAMS[networkId] || SUPPORTED_NETWORKS_PARAMS[DEFAULT_NETWORK.networkId],
        [networkId]
    );

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
                    {({ openAccountModal }) => {
                        return (
                            <Wrapper displayPadding={isWalletConnected}>
                                {isWalletConnected && (
                                    <WalletAddressInfo
                                        isWalletConnected={isWalletConnected}
                                        isClickable={true}
                                        onClick={
                                            isWalletConnected
                                                ? openAccountModal
                                                : () => {
                                                      dispatch(
                                                          setWalletConnectModalVisibility({
                                                              visibility: !connectWalletModalVisibility,
                                                          })
                                                      );
                                                      onCloseMobile ? onCloseMobile() : '';
                                                  }
                                        }
                                    >
                                        <Text className="wallet-info">
                                            {isWalletConnected
                                                ? truncateAddress(walletAddress, 5, 5)
                                                : t('common.wallet.connect-your-wallet')}
                                        </Text>
                                    </WalletAddressInfo>
                                )}
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
                                        <NetworkIcon className={selectedNetwork.iconClassName} />
                                        {!hideNetworkSwitcher && <DownIcon className={`icon icon--arrow-down`} />}
                                    </NetworkIconWrapper>
                                    {dropDownOpen && !hideNetworkSwitcher && (
                                        <NetworkDropDown>
                                            {Object.keys(SUPPORTED_NETWORKS_PARAMS)
                                                .map((key) => {
                                                    return {
                                                        id: Number(key),
                                                        ...SUPPORTED_NETWORKS_PARAMS[Number(key)],
                                                    };
                                                })
                                                .sort((a, b) => a.order - b.order)
                                                .map((network, index) => (
                                                    <NetworkWrapper
                                                        key={index}
                                                        onClick={async () => {
                                                            setDropDownOpen(false);
                                                            await changeNetwork(network, () => {
                                                                switchNetwork?.(network.id);
                                                                // Trigger App.js init
                                                                // do not use updateNetworkSettings(networkId) as it will trigger queries before provider in App.js is initialized
                                                                dispatch(
                                                                    switchToNetworkId({
                                                                        networkId: Number(network.id) as Network,
                                                                    })
                                                                );
                                                            });
                                                        }}
                                                    >
                                                        <NetworkIcon className={network.iconClassName} />
                                                        <NetworkText>
                                                            {networkId === network.id && <NetworkSelectedIndicator />}
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
            <ConnectWalletModal
                isOpen={connectWalletModalVisibility}
                onClose={() =>
                    dispatch(
                        setWalletConnectModalVisibility({
                            visibility: !connectWalletModalVisibility,
                        })
                    )
                }
            />
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

const Wrapper = styled.div<{ displayPadding?: boolean }>`
    display: flex;
    border-radius: 20px;
    border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    height: 28px;
    justify-content: space-between;
    align-items: center;
    padding-left: ${(props) => (props.displayPadding ? '10px' : '')};
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
`;

const DownIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.button.textColor.primary};
`;

const NetworkDropDown = styled.div`
    z-index: 1000;
    position: absolute;
    top: 30px;
    right: 0px;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background: ${(props) => props.theme.background.quaternary};
    width: 130px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
`;

const NetworkWrapper = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    width: 100%;
    margin-left: 32px;
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

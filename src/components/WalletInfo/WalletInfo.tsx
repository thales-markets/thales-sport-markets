import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress, updateNetworkSettings } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { truncateAddress } from 'utils/formatters/string';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import OutsideClickHandler from 'react-outside-click-handler';
import { hasEthereumInjected } from 'utils/network';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import { getDefaultColleteralForNetwork } from 'utils/collaterals';
import OvertimeVoucherPopup from 'components/OvertimeVoucherPopup';
import Tooltip from 'components/Tooltip';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

const WalletInfo: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [dropDownOpen, setDropDownOpen] = useState(false);
    const dispatch = useDispatch();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

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

    return (
        <Container>
            <FlexDivColumn>
                <RainbowConnectButton.Custom>
                    {({ openConnectModal, openAccountModal, mounted }) => {
                        return (
                            <div
                                {...(!mounted && {
                                    'aria-hidden': true,
                                    style: {
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        position: 'relative',
                                    },
                                })}
                            >
                                <Wrapper>
                                    <WalletAddressInfo>
                                        <Text
                                            isClickable={true}
                                            onClick={isWalletConnected ? openAccountModal : openConnectModal}
                                        >
                                            {isWalletConnected
                                                ? truncateAddress(walletAddress, 5, 5)
                                                : t('common.wallet.connect-your-wallet')}
                                        </Text>
                                    </WalletAddressInfo>
                                    {!isMobile &&
                                        (overtimeVoucher ? (
                                            <Tooltip
                                                overlay={
                                                    <OvertimeVoucherPopup
                                                        title={t('common.voucher.overtime-voucher')}
                                                        imageSrc={overtimeVoucher.image}
                                                        text={`${t(
                                                            'common.voucher.remaining-amount'
                                                        )}: ${formatCurrencyWithKey(
                                                            getDefaultColleteralForNetwork(networkId),
                                                            overtimeVoucher.remainingAmount
                                                        )}`}
                                                    />
                                                }
                                                component={
                                                    <WalletBalanceInfo>
                                                        <VoucherText>{t('common.voucher.voucher')}:</VoucherText>
                                                        <Text>{formatCurrency(walletBalance, 2)}</Text>
                                                        <Currency>{getDefaultColleteralForNetwork(networkId)}</Currency>
                                                    </WalletBalanceInfo>
                                                }
                                                overlayClassName="overtime-voucher-overlay"
                                            />
                                        ) : (
                                            <WalletBalanceInfo>
                                                <Text>{formatCurrency(walletBalance, 2)}</Text>
                                                <Currency>{getDefaultColleteralForNetwork(networkId)}</Currency>
                                            </WalletBalanceInfo>
                                        ))}
                                    <NetworkIconWrapper onClick={setDropDownOpen.bind(this, !dropDownOpen)}>
                                        <NetworkIcon
                                            className={`icon ${networkId === 42161 ? 'icon--arb' : 'icon--op'}`}
                                        />
                                        <DownIcon className={`icon icon--arrow-down`} />
                                    </NetworkIconWrapper>
                                </Wrapper>
                                {dropDownOpen && (
                                    <OutsideClickHandler onOutsideClick={() => setDropDownOpen(false)}>
                                        <NetworkDropDown>
                                            <NetworkWrapper
                                                onClick={async () => {
                                                    setDropDownOpen(false);
                                                }}
                                            >
                                                <NetworkIcon
                                                    className={`icon ${networkId === 42161 ? 'icon--arb' : 'icon--op'}`}
                                                />
                                                <NetworkText>
                                                    {networkId === 42161 ? 'Arbitrum' : 'Optimism'}
                                                </NetworkText>
                                            </NetworkWrapper>
                                            <NetworkWrapper
                                                onClick={async () => {
                                                    if (hasEthereumInjected()) {
                                                        await (window.ethereum as any).request({
                                                            method: 'wallet_switchEthereumChain',
                                                            params: [
                                                                { chainId: networkId !== 42161 ? '0xa4b1' : '0xa' },
                                                            ],
                                                        });
                                                    } else {
                                                        dispatch(
                                                            updateNetworkSettings({
                                                                networkId: networkId !== 42161 ? 42161 : 10,
                                                            })
                                                        );
                                                    }

                                                    setDropDownOpen(false);
                                                }}
                                            >
                                                <NetworkIcon
                                                    className={`icon ${networkId !== 42161 ? 'icon--arb' : 'icon--op'}`}
                                                />
                                                <NetworkText>
                                                    {networkId !== 42161 ? 'Arbitrum' : 'Optimism'}
                                                </NetworkText>
                                            </NetworkWrapper>
                                        </NetworkDropDown>
                                    </OutsideClickHandler>
                                )}
                            </div>
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
    border: 2px solid #39caf8;
    min-width: 160px;
    height: 28px;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
`;

const WalletAddressInfo = styled.div`
    border-right: 2px solid #39caf7;
    padding-right: 4px;
    @media (max-width: 950px) {
        border-right: none;
        padding-right: none;
    }
`;

const WalletBalanceInfo = styled.div`
    padding-left: 5px;
    padding-right: 6px;
`;

const NetworkIconWrapper = styled.div`
    background: #39caf7;
    height: 28px;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    gap: 4px;
    align-items: center;
    max-width: 65px;
    min-width: 65px;
    cursor: pointer;
`;

const Text = styled.span<{ isClickable?: boolean }>`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 10.8px;
    line-height: 13px;
    color: #39caf7;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
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
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 10.8px;
    line-height: 13px;
    cursor: pointer;
    color: #1a1c2b;
    text-align: left;
`;

const NetworkIcon = styled.i`
    font-size: 24px;
    color: #1a1c2b;
    &.icon--arb {
        position: relative;
        left: -2px;
    }
`;
const DownIcon = styled.i`
    font-size: 12px;
    color: #1a1c2b;
`;

const NetworkDropDown = styled.div`
    z-index: 1000;
    position: absolute;
    top: 30px;
    left: 0px;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background: #39caf8;
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
`;

export default WalletInfo;

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import ConnectWalletModal from 'components/ConnectWalletModal';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import {
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
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { getTicketPayment } from 'redux/modules/ticket';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { getCollateral } from 'utils/collaterals';

const WalletInfo: React.FC = ({}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));
    const ticketPayment = useSelector(getTicketPayment);

    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const multiCollateralBalances =
        multipleCollateralBalancesQuery?.isSuccess && multipleCollateralBalancesQuery?.data
            ? multipleCollateralBalancesQuery.data
            : undefined;

    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);

    const selectedCollateralBalance = multiCollateralBalances ? multiCollateralBalances[selectedCollateral] : 0;

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const freeBetCollateralBalances =
        freeBetCollateralBalancesQuery?.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery?.data
            : undefined;

    const isFreeBetExistsInWallet =
        freeBetCollateralBalances &&
        Object.keys(freeBetCollateralBalances).find((key) => freeBetCollateralBalances[key] > 0)
            ? true
            : false;

    const selectedCollateralBalanceFreeBet = freeBetCollateralBalances
        ? freeBetCollateralBalances[selectedCollateral]
        : 0;

    const walletBalance = isFreeBetExistsInWallet ? selectedCollateralBalanceFreeBet : selectedCollateralBalance;

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
                                        onClick={openAccountModal}
                                    >
                                        <Text className="wallet-info">
                                            {isWalletConnected
                                                ? truncateAddress(walletAddress, 5, 5)
                                                : t('common.wallet.connect-your-wallet')}
                                        </Text>
                                    </WalletAddressInfo>
                                )}
                                {isWalletConnected && (
                                    <WalletBalanceInfo>
                                        {isFreeBetExistsInWallet && <FreeBetIcon className="icon icon--gift" />}
                                        <Text>{formatCurrency(walletBalance, 2)}</Text>
                                        <Currency>{getCollateral(networkId, selectedCollateralIndex)}</Currency>
                                    </WalletBalanceInfo>
                                )}
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
        padding-right: 7px;
    }
`;

const WalletBalanceInfo = styled.div`
    justify-content: center;
    border-left: 2px solid ${(props) => props.theme.borderColor.primary};
    padding-left: 7px;
    padding-right: 7px;
    height: 70%;
    align-items: center;
    display: flex;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 10.8px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const Currency = styled(Text)`
    font-weight: bold;
    margin-left: 2px;
`;

const FreeBetIcon = styled.i`
    font-size: 13px;
    margin-left: 5px;
    font-family: OvertimeIconsV2 !important;
    text-transform: none !important;
    margin-right: 3px;
    color: ${(props) => props.theme.textColor.quaternary} !important;
`;

export default WalletInfo;

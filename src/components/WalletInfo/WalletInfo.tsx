import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import ConnectWalletModal from 'components/ConnectWalletModal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import { COLLATERALS } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsFreeBetDisabledByUser, getTicketPayment, setPaymentSelectedCollateralIndex } from 'redux/modules/ticket';
import { getIsBiconomy, getWalletConnectModalVisibility, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { formatCurrencyWithKey, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateral, getMaxCollateralDollarValue, mapMultiCollateralBalances } from 'utils/collaterals';
import { useAccount, useChainId, useClient } from 'wagmi';

const MIN_BUYIN_DOLLAR = 3;

const WalletInfo: React.FC = ({}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));
    const ticketPayment = useSelector(getTicketPayment);
    const isFreeBetDisabledByUser = useSelector(getIsFreeBetDisabledByUser);

    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);
    const [freeBetBalance, setFreeBetBalance] = useState(0);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates = exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const multiCollateralBalances =
        multipleCollateralBalancesQuery?.isSuccess && multipleCollateralBalancesQuery?.data
            ? multipleCollateralBalancesQuery.data
            : undefined;

    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);

    const selectedCollateralBalance = multiCollateralBalances ? multiCollateralBalances[selectedCollateral] : 0;

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const freeBetCollateralBalances =
        freeBetCollateralBalancesQuery?.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery?.data
            : undefined;

    const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);
    const maxBalanceItem = balanceList ? getMaxCollateralDollarValue(balanceList) : undefined;
    const isFreeBet =
        !isFreeBetDisabledByUser && maxBalanceItem && maxBalanceItem.balanceDollarValue >= MIN_BUYIN_DOLLAR;

    // Invalidate default selectedCollateralIndex
    useEffect(() => {
        const maxCollateralIndex = COLLATERALS[networkId].length - 1;
        if (selectedCollateralIndex > maxCollateralIndex) {
            dispatch(
                setPaymentSelectedCollateralIndex({
                    selectedCollateralIndex: maxCollateralIndex,
                    networkId,
                })
            );
        }
    }, [dispatch, networkId, selectedCollateralIndex]);

    // Refresh free bet on wallet change
    useEffect(() => {
        setIsFreeBetInitialized(false);
    }, [walletAddress, networkId]);

    // Initialize free bet collateral
    useEffect(() => {
        if (isFreeBet && !isFreeBetInitialized && maxBalanceItem.balanceDollarValue >= MIN_BUYIN_DOLLAR) {
            dispatch(
                setPaymentSelectedCollateralIndex({
                    selectedCollateralIndex: maxBalanceItem.index,
                    networkId,
                })
            );
            setIsFreeBetInitialized(true);
            setFreeBetBalance(maxBalanceItem.balance);
        } else {
            setFreeBetBalance(balanceList?.find((b) => b.collateralKey === selectedCollateral)?.balance || 0);
        }
    }, [
        dispatch,
        networkId,
        isFreeBet,
        maxBalanceItem,
        selectedCollateralIndex,
        isFreeBetInitialized,
        balanceList,
        selectedCollateral,
    ]);

    return (
        <Container walletConnected={isConnected}>
            <FlexDivColumn>
                <RainbowConnectButton.Custom>
                    {({ openAccountModal }) => {
                        return (
                            <Wrapper displayPadding={isConnected}>
                                {isConnected && (
                                    <WalletAddressInfo
                                        isConnected={isConnected}
                                        isClickable={true}
                                        onClick={openAccountModal}
                                    >
                                        <Text className="wallet-info">
                                            {isConnected
                                                ? truncateAddress(walletAddress, 5, 5)
                                                : t('common.wallet.connect-your-wallet')}
                                        </Text>
                                    </WalletAddressInfo>
                                )}
                                {isConnected && (
                                    <WalletBalanceInfo>
                                        {isFreeBet && <FreeBetIcon className="icon icon--gift" />}
                                        <Text>
                                            {formatCurrencyWithKey(
                                                selectedCollateral,
                                                isFreeBet ? freeBetBalance : selectedCollateralBalance
                                            )}
                                        </Text>
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
    border: 1px solid ${(props) => props.theme.christmasTheme.borderColor.primary};
    height: 28px;
    justify-content: space-between;
    align-items: center;
    padding-left: ${(props) => (props.displayPadding ? '10px' : '')};
    & > div {
        flex: 0.6;
    }
    & > div:last-child {
        flex: 0.2;
    }
`;

const WalletAddressInfo = styled.div<{ isConnected: boolean; isClickable?: boolean }>`
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
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
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

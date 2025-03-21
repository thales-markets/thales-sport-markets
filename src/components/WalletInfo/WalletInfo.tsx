import ConnectWalletModal from 'components/ConnectWalletModal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import OutsideClickHandler from 'components/OutsideClick';
import { COLLATERALS, USD_SIGN } from 'constants/currency';
import ProfileItem from 'layouts/DappLayout/DappHeader/components/ProfileItem';
import ProfileDropdown from 'layouts/DappLayout/DappHeader/components/ProfileItem/components/ProfileDropdown';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTicketPayment, setPaymentSelectedCollateralIndex } from 'redux/modules/ticket';
import { getIsBiconomy, getWalletConnectModalVisibility, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { RootState } from 'types/redux';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import { getDefaultCollateralIndexForNetworkId } from 'utils/network';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const WalletInfo: React.FC = ({}) => {
    const dispatch = useDispatch();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const theme = useTheme();
    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));
    const ticketPayment = useSelector(getTicketPayment);

    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

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

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multiCollateralBalances && balanceList) {
                getCollaterals(networkId).forEach((token) => {
                    total += multiCollateralBalances[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
                balanceList.forEach((data) => (total += data.balanceDollarValue));
            }

            return total ? formatCurrencyWithKey(USD_SIGN, total, 2) : '0$';
        } catch (e) {
            return '0$';
        }
    }, [exchangeRates, multiCollateralBalances, networkId, balanceList]);

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

    // Refresh free bet on wallet and network change
    useEffect(() => {
        setIsFreeBetInitialized(false);
    }, [walletAddress, networkId]);

    // Initialize default collateral from LS
    useEffect(() => {
        if (!isFreeBetInitialized) {
            dispatch(
                setPaymentSelectedCollateralIndex({
                    selectedCollateralIndex: getDefaultCollateralIndexForNetworkId(networkId),
                    networkId,
                })
            );
        }
    }, [dispatch, networkId, isFreeBetInitialized]);

    return (
        <Container walletConnected={isConnected} gap={8}>
            <OutsideClickHandler onOutsideClick={setShowDropdown.bind(this, !showDropdown)}>
                <WalletWrapper>
                    {isConnected && (
                        <Button onClick={setShowDropdown.bind(this, !showDropdown)}>
                            <WalletAddressInfo isConnected={isConnected} isClickable={true}>
                                <ProfileItem color={theme.button.textColor.primary} avatarSize={18} />
                            </WalletAddressInfo>

                            <WalletBalanceInfo>
                                <Text>{totalBalanceValue}</Text>
                            </WalletBalanceInfo>
                        </Button>
                    )}
                    {showDropdown && <ProfileDropdown />}
                </WalletWrapper>
            </OutsideClickHandler>

            <NetworkSwitcher />
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
    font-size: 12px;
    white-space: pre;
    line-height: 12px;
    color: ${(props) => props.theme.button.textColor.primary};
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 30px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};
    background-color: ${(props) => props.theme.connectWalletModal.hover};
    color: ${(props) => props.theme.button.textColor.primary};
    font-size: 14px;
    font-weight: 600;

    text-transform: uppercase;
    cursor: pointer;

    white-space: pre;
    padding: 3px 10px;
    @media (max-width: 575px) {
        font-size: 12px;
        padding: 3px 12px;
    }
`;

const WalletWrapper = styled.div`
    min-width: 200px;
`;

export default WalletInfo;

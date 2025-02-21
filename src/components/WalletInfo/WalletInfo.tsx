import ConnectWalletModal from 'components/ConnectWalletModal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import { COLLATERALS, USD_SIGN } from 'constants/currency';
import ProfileItem from 'layouts/DappLayout/DappHeader/components/ProfileItem';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTicketPayment, setPaymentSelectedCollateralIndex } from 'redux/modules/ticket';
import { getIsBiconomy, getWalletConnectModalVisibility, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import { getDefaultCollateralIndexForNetworkId } from 'utils/network';
import { useAccount, useChainId, useClient } from 'wagmi';

const WalletInfo: React.FC = ({}) => {
    const dispatch = useDispatch();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));
    const ticketPayment = useSelector(getTicketPayment);

    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);

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

            return total ? formatCurrencyWithKey(USD_SIGN, total, 2) : 'N/A';
        } catch (e) {
            return 'N/A';
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
        <Container walletConnected={isConnected}>
            <FlexDivColumn>
                <Wrapper displayPadding={isConnected}>
                    {isConnected && (
                        <WalletAddressInfo isConnected={isConnected} isClickable={true}>
                            <ProfileItem avatarSize={16} />
                        </WalletAddressInfo>
                    )}
                    {isConnected && (
                        <WalletBalanceInfo>
                            <Text>{totalBalanceValue}</Text>
                        </WalletBalanceInfo>
                    )}
                    <NetworkSwitcher />
                </Wrapper>
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
    border-radius: 8px;
    border: 1px solid ${(props) => (!props.displayPadding ? 'none' : props.theme.borderColor.primary)};
    height: 30px;
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
    font-size: 12px;
    white-space: pre;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default WalletInfo;

import FundModal from 'components/FundOvertimeAccountModal';
import SwapModal from 'components/SwapModal/SwapModal';
import Tooltip from 'components/Tooltip';
import { COLLATERAL_ICONS, USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumnCentered,
    FlexDivColumnStart,
    FlexDivEnd,
    FlexDivSpaceBetween,
} from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign, localStore } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import AssetBalance from '../AssetBalance/AssetBalance';
import WithdrawModal from '../WithdrawModal';

const OverToken = COLLATERAL_ICONS['OVER'];

const Account: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const [showFundModal, setShowFundModal] = useState<boolean>(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
    const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

    const [withdrawalToken, setWithdrawalToken] = useState(0);
    const [convertToken, setConvertToken] = useState(0);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

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
            if (exchangeRates && multipleCollateralBalances.data && balanceList) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
                balanceList.forEach((data) => (total += data.balanceDollarValue));
            }

            return total ? formatCurrencyWithSign(USD_SIGN, total, 2) : 'N/A';
        } catch (e) {
            return 'N/A';
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, balanceList]);

    const userTicketsQuery = useUserTicketsQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const userTicketsByStatus = useMemo(() => {
        if (exchangeRates && userTicketsQuery.isSuccess) {
            const userTickets = userTicketsQuery.isSuccess && userTicketsQuery.data ? userTicketsQuery.data : [];
            let [tickets, potentialWin] = [0, 0];

            userTickets.forEach((ticket) => {
                if (ticket.isOpen) {
                    console.log(ticket);
                    tickets++;
                    potentialWin +=
                        ticket.payout * (exchangeRates[ticket.collateral] ? exchangeRates[ticket.collateral] : 1);
                }
            });

            const data = {
                tickets,
                potentialWin,
            };
            return data;
        }

        return {
            tickets: 0,
            potentialWin: 0,
        };
    }, [userTicketsQuery.isSuccess, userTicketsQuery.data, exchangeRates]);

    const OverBalance = useMemo(() => {
        if (multipleCollateralBalances.data && exchangeRates) {
            return {
                balance: multipleCollateralBalances.data['THALES'],
                value: multipleCollateralBalances.data['THALES'] * exchangeRates['THALES'],
            };
        }

        return {
            balance: 0,
            value: 0,
        };
    }, [multipleCollateralBalances.data, exchangeRates]);

    return (
        <div>
            <Header>
                <FlexDivColumnStart gap={4}>
                    <Label>Portfolio Balance</Label>
                    <Value>{totalBalanceValue}</Value>
                </FlexDivColumnStart>
                <FlexDivEnd gap={20}>
                    <FlexDivColumnStart gap={4}>
                        <GrayLabel>Active Tickets</GrayLabel>
                        <YellowValue>
                            {userTicketsByStatus.tickets} <ParlayIcon />
                        </YellowValue>
                    </FlexDivColumnStart>
                    <FlexDivColumnStart gap={4}>
                        <GrayLabel>Potential Win</GrayLabel>
                        <YellowValue>
                            {formatCurrencyWithSign(USD_SIGN, userTicketsByStatus.potentialWin, 2)}
                        </YellowValue>
                    </FlexDivColumnStart>
                </FlexDivEnd>
            </Header>
            <Container>
                <OverBalanceWrapper>
                    <FlexDivColumnCentered gap={4}>
                        <Tooltip overlay={t('profile.account-summary.best-odds')}>
                            <FlexDivSpaceBetween>
                                <Label2>
                                    {OverBalance.balance === 0
                                        ? `N/A`
                                        : formatCurrencyWithKey('', OverBalance.balance, 2)}
                                    <OverTokenIcon />
                                </Label2>
                                <Value2>{formatCurrencyWithSign(USD_SIGN, OverBalance.value, 2)}</Value2>
                            </FlexDivSpaceBetween>
                        </Tooltip>
                    </FlexDivColumnCentered>
                </OverBalanceWrapper>

                <ButtonContainer>
                    <Button onClick={() => setShowSwapModal(true)}>{t('profile.account-summary.swap')}</Button>
                    <Button onClick={() => setShowFundModal(true)}>{t('profile.account-summary.deposit')}</Button>
                    <Button onClick={() => setShowWithdrawModal(true)}>{t('profile.account-summary.withdraw')}</Button>
                </ButtonContainer>
            </Container>

            <AssetBalance
                setConvertToken={setConvertToken}
                setShowFundModal={setShowFundModal}
                setShowSwapModal={setShowSwapModal}
                setShowWithdrawModal={setShowWithdrawModal}
                setWithdrawalToken={setWithdrawalToken}
            />

            <SkipText
                onClick={() => {
                    if (isBiconomy) {
                        dispatch(setIsBiconomy(false));
                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                    } else {
                        dispatch(setIsBiconomy(true));
                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                    }
                }}
            >
                {isBiconomy ? t('profile.account-summary.use-eoa') : t('profile.account-summary.use-smart')}
            </SkipText>
            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
            {showWithdrawModal && (
                <WithdrawModal preSelectedToken={withdrawalToken} onClose={() => setShowWithdrawModal(false)} />
            )}
            {showSwapModal && <SwapModal preSelectedToken={convertToken} onClose={() => setShowSwapModal(false)} />}
        </div>
    );
};

const Header = styled(FlexDivSpaceBetween)`
    margin-bottom: 18px;
`;

const Container = styled(FlexDivSpaceBetween)`
    @media (max-width: 800px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
`;

const ButtonContainer = styled(FlexDivCentered)`
    gap: 16px;
    @media (max-width: 800px) {
        justify-content: flex-start;
        width: 100%;
        gap: 6px;
    }
`;

const AlignedParagraph = styled.p`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SkipText = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    margin-top: 30px;
    cursor: pointer;
`;

const Label = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 500;
    white-space: pre;
`;

const Value = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 24px;
    font-weight: 700;
    white-space: pre;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const GrayLabel = styled(Label)`
    color: ${(props) => props.theme.button.textColor.senary};
`;

const YellowValue = styled(Value)`
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const ParlayIcon = styled.i.attrs({ className: 'icon icon--parlay' })`
    font-size: 16px;
`;

const Label2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 28px;
    font-weight: 500;
    white-space: pre;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const OverTokenIcon = styled(OverToken)`
    margin-left: 2px;
    width: 40px;
    height: 30px;
    @media (max-width: 575px) {
        width: 30px;
        height: 20px;
    }
`;

const Value2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 28px;
    font-weight: 700;
    white-space: pre;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const OverBalanceWrapper = styled(FlexDivSpaceBetween)`
    width: 100%;
    margin-right: 20px;
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 42px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};

    font-size: 14px;
    font-weight: 600;

    text-transform: uppercase;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => props.theme.connectWalletModal.hover};
        color: ${(props) => props.theme.button.textColor.primary};
    }
    white-space: pre;
    padding: 3px 24px;
    @media (max-width: 575px) {
        font-size: 12px;
        padding: 3px 12px;
    }
`;

export default Account;

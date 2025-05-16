import SwapModal from 'components/SwapModal';
import { USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnStart, FlexDivEnd, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import AssetBalance from '../AssetBalance';

const Account: React.FC = () => {
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

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

            return total ? formatCurrencyWithSign(USD_SIGN, total, 2) : '$0';
        } catch (e) {
            return '$0';
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

    const overBalance = useMemo(() => {
        if (multipleCollateralBalances.data && exchangeRates) {
            return {
                balance: multipleCollateralBalances.data['OVER'],
                value: multipleCollateralBalances.data['OVER'] * exchangeRates['OVER'],
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
                    <Label>{t('profile.account-summary.balance')}</Label>
                    <Value>{totalBalanceValue}</Value>
                </FlexDivColumnStart>
                <FlexDivEnd gap={20}>
                    <FlexDivColumnStart gap={4}>
                        <GrayLabel>{t('profile.account-summary.active-tickets')}</GrayLabel>
                        <YellowValue>
                            {userTicketsByStatus.tickets} <ParlayIcon />
                        </YellowValue>
                    </FlexDivColumnStart>
                    <FlexDivColumnStart gap={4}>
                        <GrayLabel>{t('profile.account-summary.potential-win')}</GrayLabel>
                        <YellowValue>
                            {formatCurrencyWithSign(USD_SIGN, userTicketsByStatus.potentialWin, 2)}
                        </YellowValue>
                    </FlexDivColumnStart>
                </FlexDivEnd>
            </Header>

            <Container>
                <OverWrapper gap={40}>
                    <FlexDivColumnStart gap={4}>
                        <Label2>
                            <OverIcon /> {t('profile.account-summary.over')}
                        </Label2>
                        <TokenDesc>{t('profile.account-summary.token')}</TokenDesc>
                    </FlexDivColumnStart>
                    <TokenBalanceWrapper gap={4}>
                        <TokenBalance>
                            {overBalance.balance === 0 ? `N/A` : formatCurrencyWithKey('', overBalance.balance, 2)}
                        </TokenBalance>
                        <Value2>{formatCurrencyWithSign(USD_SIGN, overBalance.value, 2)}</Value2>
                    </TokenBalanceWrapper>
                </OverWrapper>
                <Button onClick={() => setShowSwapModal(true)}>{t('profile.account-summary.swap')}</Button>
            </Container>

            <AssetBalance />
            {showSwapModal && <SwapModal onClose={() => setShowSwapModal(false)} />}
        </div>
    );
};

const Header = styled(FlexDivSpaceBetween)`
    margin-bottom: 18px;
    background: ${(props) => props.theme.background.quinary};
    padding: 14px;
    border-radius: 8px;
`;

const Container = styled(FlexDivSpaceBetween)`
    padding: 0 14px;
    @media (max-width: 800px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
`;

const AlignedParagraph = styled.p`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Label = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 500;
    white-space: pre;
    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        font-size: 12px;
    }
`;

const Value = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 24px;
    font-weight: 700;
    white-space: pre;
    @media (max-width: 575px) {
        font-size: 20px;
    }
    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        font-size: 16px;
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
    font-size: 20px;
    line-height: 30px;
    font-weight: 500;
    white-space: pre;
`;

const OverIcon = styled.i.attrs({ className: 'icon icon--logo' })`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 30px;
    line-height: 30px;
    @media (max-width: 575px) {
        font-size: 30px;
        line-height: 20px;
    }
`;

const TokenBalance = styled(Label2)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 20px;
    line-height: 30px;
    font-weight: 500;
    white-space: pre;
`;

const Value2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 20px;
    font-weight: 600;
    white-space: pre;
`;

const TokenDesc = styled(AlignedParagraph)`
    font-size: 14px;
    line-height: 16px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.secondary};
    white-space: pre;
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 214px;
    height: 31px;

    background-color: ${(props) => props.theme.connectWalletModal.hover};
    color: ${(props) => props.theme.button.textColor.primary};

    font-size: 14px;
    font-weight: 600;

    text-transform: uppercase;
    cursor: pointer;
    &:hover {
    }
    white-space: pre;
    padding: 3px 24px;
    @media (max-width: 575px) {
        font-size: 12px;
        padding: 3px 12px;
    }
    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        width: 100%;
    }
`;

const OverWrapper = styled(FlexDivStart)`
    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        justify-content: space-between;
        width: 100%;
    }
`;

const TokenBalanceWrapper = styled(FlexDivColumnStart)`
    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        align-items: flex-end;
    }
`;

export default Account;

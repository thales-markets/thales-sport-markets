import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivColumnStart, FlexDivEnd, FlexDivSpaceBetween } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import AssetBalance from '../AssetBalance/AssetBalance';

const Account: React.FC = () => {
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

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
                <OverBalanceWrapper>
                    <FlexDivColumnCentered gap={4}>
                        <Tooltip overlay={t('profile.account-summary.best-odds')}>
                            <FlexDivSpaceBetween>
                                <Label2>
                                    {overBalance.balance === 0
                                        ? `N/A`
                                        : formatCurrencyWithKey('', overBalance.balance, 2)}
                                    <OverTokenIcon />
                                </Label2>
                                <Value2>{formatCurrencyWithSign(USD_SIGN, overBalance.value, 2)}</Value2>
                            </FlexDivSpaceBetween>
                        </Tooltip>
                    </FlexDivColumnCentered>
                </OverBalanceWrapper>
            </Container>

            <AssetBalance />
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

const OverTokenIcon = styled.i.attrs({ className: 'currency-icon currency-icon--over' })`
    color: ${(props) => props.theme.textColor.secondary};
    margin-left: 2px;
    font-size: 30px;
    line-height: 30px;
    @media (max-width: 575px) {
        font-size: 30px;
        line-height: 20px;
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

export default Account;

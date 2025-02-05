import Button from 'components/Button';
import FundModal from 'components/FundOvertimeAccountModal';
import SwapModal from 'components/SwapModal/SwapModal';
import { COLLATERAL_ICONS, OVER_SIGH, USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import queryString from 'query-string';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import {
    Colors,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivColumnStart,
    FlexDivEnd,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign, localStore } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import { claimFreeBet } from 'utils/freeBet';
import { useAccount, useChainId, useClient } from 'wagmi';
import WithdrawModal from '../WithdrawModal';
import Toggle from 'components/Toggle';
import DepositIcon from 'assets/images/svgs/deposit.svg?react';
import WithdrawIcon from 'assets/images/svgs/withdraw.svg?react';
import ConvertIcon from 'assets/images/svgs/convert.svg?react';

const OverToken = COLLATERAL_ICONS['OVER'];

const Account: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const queryParams: { freeBet?: string } = queryString.parse(location.search);
    const [freeBet, setFreeBet] = useLocalStorage<string | undefined>(
        LOCAL_STORAGE_KEYS.FREE_BET_ID,
        queryParams.freeBet
    );
    const history = useHistory();

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [showFundModal, setShowFundModal] = useState<boolean>(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
    const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

    const [showZeroBalance, setShowZeroBalance] = useState<boolean>(false);

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

    const usersAssets = useMemo(() => {
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                const result: Array<{
                    asset: string;
                    balance: number;
                    value: number;
                }> = [];
                getCollaterals(networkId).forEach((token) => {
                    result.push({
                        asset: token,
                        balance: multipleCollateralBalances.data[token],
                        value:
                            multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1),
                    });
                });
                return result
                    .sort((a, b) => {
                        return b.value - a.value;
                    })
                    .filter((tokenData) => {
                        if (tokenData.value === 0 && !showZeroBalance) return false;
                        return true;
                    });
            }
        } catch (e) {
            return [];
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, showZeroBalance]);

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
                balance: multipleCollateralBalances.data['OVER'],
                value: multipleCollateralBalances.data['OVER'] * exchangeRates['OVER'],
            };
        }

        return {
            balance: 0,
            value: 0,
        };
    }, [multipleCollateralBalances.data, exchangeRates]);

    const onClaimFreeBet = useCallback(() => claimFreeBet(walletAddress, freeBet, networkId, setFreeBet, history), [
        walletAddress,
        freeBet,
        setFreeBet,
        history,
        networkId,
    ]);

    return (
        <div>
            <Header>
                <FlexDivColumnStart gap={4}>
                    <Label>Portfolio Balance</Label>
                    <Value>{totalBalanceValue}</Value>
                </FlexDivColumnStart>
                <FlexDivColumn>
                    {!!freeBet && (
                        <Button
                            onClick={onClaimFreeBet}
                            borderColor="none"
                            height="42px"
                            width="160px"
                            lineHeight="16px"
                            padding="0"
                            backgroundColor={Colors.BLUE}
                        >
                            {t('profile.account-summary.claim-free-bet')}
                        </Button>
                    )}
                </FlexDivColumn>
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
            <FlexDivSpaceBetween>
                <FlexDivStart>
                    <FlexDivCentered>
                        <OverToken />
                    </FlexDivCentered>
                    <FlexDivColumnCentered gap={4}>
                        <FlexDivSpaceBetween>
                            <Label2> {formatCurrencyWithKey(OVER_SIGH, OverBalance.balance, 2)}</Label2>
                            <Value2>{formatCurrencyWithSign(USD_SIGN, OverBalance.value, 2)}</Value2>
                        </FlexDivSpaceBetween>
                        <FlexDivCentered>
                            <YellowValue2>{t('profile.account-summary.best-odds')}</YellowValue2>
                        </FlexDivCentered>
                    </FlexDivColumnCentered>
                </FlexDivStart>
                <FlexDivSpaceBetween>
                    <ButtonContainer>
                        <Button
                            onClick={() => setShowFundModal(true)}
                            borderColor="none"
                            height="42px"
                            width="120px"
                            lineHeight="16px"
                            backgroundColor={Colors.BLUE}
                        >
                            {t('profile.account-summary.deposit')}
                        </Button>
                        <Button
                            onClick={() => setShowSwapModal(true)}
                            borderColor="none"
                            height="42px"
                            width="120px"
                            lineHeight="16px"
                            backgroundColor={Colors.WHITE}
                        >
                            {t('profile.account-summary.swap')}
                        </Button>
                        <Button
                            onClick={() => setShowWithdrawModal(true)}
                            borderColor="none"
                            height="42px"
                            width="120px"
                            lineHeight="16px"
                            backgroundColor={Colors.YELLOW}
                        >
                            {t('profile.account-summary.withdraw')}
                        </Button>
                    </ButtonContainer>
                </FlexDivSpaceBetween>
            </FlexDivSpaceBetween>

            <GridContainer>
                <TableHeader>Assets</TableHeader>
                <TableHeader2>Amount</TableHeader2>
                <TableHeader2>Value(USD)</TableHeader2>
                <ZeroBalanceWrapper>
                    <TableHeader2>Show zero balance</TableHeader2>
                    <Toggle active={showZeroBalance} handleClick={() => setShowZeroBalance(!showZeroBalance)} />
                </ZeroBalanceWrapper>

                {usersAssets?.map((assetData, index) => {
                    const Icon = COLLATERAL_ICONS[assetData.asset];
                    const StyledIcon = styled(Icon)`
                        height: 24px;
                        width: 30px;
                    `;
                    return (
                        <AssetContainer key={index}>
                            <AssetWrapper>
                                {<StyledIcon />} {assetData.asset}
                            </AssetWrapper>
                            <Label2>{formatCurrencyWithKey('', assetData.balance)}</Label2>
                            <Label2>{formatCurrencyWithKey(USD_SIGN, assetData.value, 2)}</Label2>
                            <Deposit>
                                Deposit <DepositIcon />
                            </Deposit>
                            <Convert>
                                Convert <ConvertIcon />
                            </Convert>
                            <Withdraw>
                                Withdraw <WithdrawIcon />
                            </Withdraw>
                        </AssetContainer>
                    );
                })}
            </GridContainer>

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
            {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
            {showSwapModal && <SwapModal onClose={() => setShowSwapModal(false)} />}
        </div>
    );
};

const Header = styled(FlexDivSpaceBetween)`
    margin-bottom: 28px;
`;

const ButtonContainer = styled(FlexDivCentered)`
    gap: 18px;
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

const GrayLabel = styled(Label)`
    color: ${(props) => props.theme.button.textColor.senary};
`;

const Value = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 24px;
    font-weight: 700;
    white-space: pre;
`;

const YellowValue = styled(Value)`
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const ParlayIcon = styled.i.attrs({ className: 'icon icon--parlay' })`
    font-size: 16px;
`;

const Label2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;
`;

const AssetWrapper = styled(Label2)`
    justify-content: flex-start;
    gap: 8px;
`;

const Value2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 16px;
    font-weight: 700;
    white-space: pre;
`;

const YellowValue2 = styled(Value2)`
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
    margin-top: 20px;
    padding-top: 20px;
    grid-template-rows: auto;
    border-top: 2px solid ${(props) => props.theme.background.senary};
`;

const TableHeader = styled(AlignedParagraph)`
    justify-content: flex-start;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 20px;
    font-weight: 700;
    white-space: pre;
`;

const TableHeader2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.button.textColor.senary};
    font-size: 14px;
    font-weight: 700;
    white-space: pre;
`;

const ZeroBalanceWrapper = styled.div`
    display: flex;
    align-items: center;
    grid-column-start: 5;
    grid-column-end: 7;
`;

const AssetContainer = styled.div`
    display: contents;
    grid-column: 1;
    grid-column-end: 7;
    border-top: 1px solid ${(props) => props.theme.background.senary};
`;

const Deposit = styled(Value)`
    cursor: pointer;
    font-size: 14px;
`;

const Convert = styled(YellowValue)`
    color: white;
    cursor: pointer;
    font-size: 14px;
`;

const Withdraw = styled(YellowValue)`
    cursor: pointer;
    font-size: 14px;
`;

export default Account;

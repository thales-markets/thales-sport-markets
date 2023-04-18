import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Colors, FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import { getIsAppReady } from 'redux/modules/app';
import useVaultTradesQuery from 'queries/vault/useVaultTradesQuery';
import { VaultTrades, VaultTrade, VaultUserTransactions, VaultUserTransaction } from 'types/vault';
import SelectInput from 'components/SelectInput';
import { isParlayVault, VaultTradeStatus, VaultTransaction } from 'constants/vault';
import { formatCurrency, formatPercentageWithSign } from 'utils/formatters/number';
import useVaultUserTransactionsQuery from 'queries/vault/useVaultUserTransactionsQuery';
import UserTransactionsTable from '../UserTransactionsTable';
import useParlayVaultTradesQuery from 'queries/vault/useParlayVaultTradesQuery';
import ParlayTransactionsTable from 'components/ParlayTransactionsTable/ParlayTransactionsTable';
import TradesTable from '../TradesTable';
import { ParlayMarketWithRound } from 'types/markets';
import { isParlayClaimable, isParlayOpen } from 'utils/markets';

type TransactionsProps = {
    vaultAddress: string;
    currentRound: number;
    currentRoundDeposit: number;
};

const Transactions: React.FC<TransactionsProps> = ({ vaultAddress, currentRound, currentRoundDeposit }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [vaultTrades, setVaultTrades] = useState<VaultTrades>([]);
    const [vaultUserTransactions, setVaultUserTransactions] = useState<VaultUserTransactions>([]);
    const [round, setRound] = useState<number>(currentRound > 0 ? currentRound - 1 : 0);
    const [selectedTab, setSelectedTab] = useState<VaultTransaction>(VaultTransaction.TRADES_HISTORY);
    const [pnl, setPnl] = useState<number | undefined>(undefined);
    const [pnlAmount, setPnlAmount] = useState<number | undefined>(undefined);

    const tabContent: Array<{
        id: VaultTransaction;
        name: string;
    }> = useMemo(
        () => [
            {
                id: VaultTransaction.TRADES_HISTORY,
                name: t(`vault.trades-history.title`),
            },
            {
                id: VaultTransaction.USER_TRANSACTIONS,
                name: t(`vault.user-transactions.title`),
            },
        ],
        [t]
    );

    const rounds: Array<{ value: number; label: string }> = [];
    for (let index = 0; index < currentRound; index++) {
        rounds.push({
            value: index,
            label: `${t('vault.trades-history.round-label')} ${index + 1}`,
        });
    }

    const vaultTradesQuery = useVaultTradesQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress,
    });

    const parlayVaultTradesQuery = useParlayVaultTradesQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress && isParlayVault(vaultAddress, networkId),
    });

    useEffect(() => {
        if (vaultTradesQuery.isSuccess && vaultTradesQuery.data) {
            setVaultTrades(
                orderBy(
                    vaultTradesQuery.data.filter((trade: VaultTrade) => trade.round === round + 1),
                    ['timestamp', 'blockNumber'],
                    ['desc', 'desc']
                )
            );
        } else {
            setVaultTrades([]);
        }
    }, [vaultTradesQuery.isSuccess, vaultTradesQuery.data, round]);

    const parlayTrades = useMemo(() => {
        if (parlayVaultTradesQuery.isSuccess) {
            return parlayVaultTradesQuery.data.filter((parlayTrade) => {
                return parlayTrade.round === round + 1;
            });
        }
        return [];
    }, [round, parlayVaultTradesQuery]);

    const noVaultTrades = vaultTrades.length === 0;

    const vaultUserTransactionsQuery = useVaultUserTransactionsQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress,
    });

    useEffect(() => {
        if (vaultUserTransactionsQuery.isSuccess && vaultUserTransactionsQuery.data) {
            setVaultUserTransactions(
                orderBy(
                    vaultUserTransactionsQuery.data.filter((trade: VaultUserTransaction) => trade.round === round + 1),
                    ['timestamp', 'blockNumber'],
                    ['desc', 'desc']
                )
            );
        } else {
            setVaultUserTransactions([]);
        }
    }, [vaultUserTransactionsQuery.isSuccess, vaultUserTransactionsQuery.data, round]);

    const noVaultUserTransactions = vaultUserTransactions.length === 0;

    useEffect(() => {
        if (round === currentRound - 1) {
            const initialNetAmount = 0;
            if (isParlayVault(vaultAddress, networkId)) {
                const netAmount = parlayTrades.reduce((accumulator: number, trade: ParlayMarketWithRound) => {
                    return (
                        accumulator +
                        (isParlayClaimable(trade)
                            ? trade.totalAmount - trade.sUSDPaid
                            : isParlayOpen(trade)
                            ? 0
                            : -trade.sUSDPaid)
                    );
                }, initialNetAmount);
                setPnlAmount(netAmount);
                setPnl(netAmount / currentRoundDeposit);
            } else {
                const netAmount = vaultTrades.reduce((accumulator: number, trade: VaultTrade) => {
                    return (
                        accumulator +
                        (trade.status === VaultTradeStatus.WIN
                            ? trade.amount - trade.paid
                            : trade.status === VaultTradeStatus.LOSE
                            ? -trade.paid
                            : 0)
                    );
                }, initialNetAmount);
                setPnlAmount(netAmount);
                setPnl(netAmount / currentRoundDeposit);
            }
        }
    }, [vaultTrades, parlayTrades, currentRoundDeposit, round, currentRound, networkId, vaultAddress]);

    return (
        <Container>
            <Header>
                <TabContainer>
                    {tabContent.map((tab, index) => (
                        <Tab
                            isActive={tab.id === selectedTab}
                            key={index}
                            index={index}
                            onClick={() => {
                                setSelectedTab(tab.id);
                            }}
                            className={`${tab.id === selectedTab ? 'selected' : ''}`}
                        >
                            {tab.name}
                        </Tab>
                    ))}
                </TabContainer>
                <RightHeader>
                    {!!pnl && !!pnlAmount && round === currentRound - 1 && (
                        <OngoingPnlContainer>
                            <OngoingPnlLabel>{t('vault.pnl.ongoing-pnl')}:</OngoingPnlLabel>
                            <OngoingPnl color={pnl === 0 ? Colors.WHITE : pnl > 0 ? Colors.GREEN : Colors.RED}>
                                {`${formatPercentageWithSign(pnl)} (${pnlAmount > 0 ? '+' : '-'}${formatCurrency(
                                    Math.abs(pnlAmount)
                                )}$)`}
                            </OngoingPnl>
                        </OngoingPnlContainer>
                    )}
                    {currentRound !== 0 && (
                        <SelectContainer>
                            <SelectInput
                                options={rounds}
                                handleChange={(value) => setRound(Number(value))}
                                defaultValue={round}
                                width={230}
                            />
                        </SelectContainer>
                    )}
                </RightHeader>
            </Header>
            <TableContainer>
                {selectedTab === VaultTransaction.TRADES_HISTORY &&
                    (isParlayVault(vaultAddress, networkId) ? (
                        <ParlayTransactionsTable parlayTx={parlayTrades} searchText=""></ParlayTransactionsTable>
                    ) : (
                        <TradesTable
                            transactions={vaultTrades}
                            isLoading={vaultTradesQuery.isLoading}
                            noResultsMessage={
                                noVaultTrades ? <span>{t(`vault.trades-history.no-trades`)}</span> : undefined
                            }
                        />
                    ))}
                {selectedTab === VaultTransaction.USER_TRANSACTIONS && (
                    <UserTransactionsTable
                        transactions={vaultUserTransactions}
                        isLoading={vaultUserTransactionsQuery.isLoading}
                        noResultsMessage={
                            noVaultUserTransactions ? (
                                <span>{t(`vault.user-transactions.no-transactions`)}</span>
                            ) : undefined
                        }
                    />
                )}
            </TableContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 10px;
    position: relative;
    max-height: 370px;
    min-height: 370px;
    overflow-y: auto;
    width: 80%;
    padding: 10px;
    margin-top: 20px;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

const Header = styled(FlexDivRow)`
    margin: 10px 18px;
    align-items: center;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const RightHeader = styled(FlexDivRow)`
    align-items: center;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const TabContainer = styled(FlexDiv)`
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const Tab = styled(FlexDivCentered)<{ isActive: boolean; index: number }>`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    user-select: none;ar
    margin-left: 0px;
    margin-right: 40px;
    color: ${(props) => props.theme.textColor.secondary};
    &.selected {
        transition: 0.2s;
        color: ${(props) => props.theme.textColor.primary};
    }
    &:hover:not(.selected) {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 767px) {
        margin-bottom: 10px;
        margin-left: 0px;
        margin-right: 0px;
    }
`;

const TableContainer = styled(FlexDivColumn)`
    overflow: auto;
    ::-webkit-scrollbar {
        width: 5px;
    }
    ::-webkit-scrollbar-track {
        background: #04045a;
        border-radius: 8px;
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 15px;
        background: #355dff;
    }
    ::-webkit-scrollbar-thumb:active {
        background: #44e1e2;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgb(67, 116, 255);
    }
    @media (max-width: 767px) {
        width: 700px;
    }
`;

export const SelectContainer = styled.div`
    width: 230px;
`;

const OngoingPnlContainer = styled(FlexDivRow)`
    align-items: center;
    margin-right: 15px;
    @media (max-width: 767px) {
        margin-right: 0px;
        margin-bottom: 10px;
    }m
`;

const OngoingPnlLabel = styled.p``;

const OngoingPnl = styled.p<{ color: string }>`
    font-weight: 600;
    margin-left: 6px;
    color: ${(props) => props.color};
`;

export default Transactions;

import SelectInput from 'components/SelectInput';
import { LiquidityPoolTransaction } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import useLiquidityPoolUserTransactionsQuery from 'queries/liquidityPool/useLiquidityPoolUserTransactionsQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { Coins } from 'thales-utils';
import { LiquidityPoolUserTransaction, LiquidityPoolUserTransactions } from 'types/liquidityPool';
import biconomyConnector from 'utils/biconomyWallet';
import { useAccount, useChainId } from 'wagmi';
import UserTransactionsTable from '../UserTransactionsTable';

type TransactionsProps = {
    currentRound: number;
    liquidityPoolAddress: string;
    collateral: Coins;
};

const Transactions: React.FC<TransactionsProps> = ({ currentRound, liquidityPoolAddress, collateral }) => {
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [liquidityPoolUserTransactions, setLiquidityPoolUserTransactions] = useState<LiquidityPoolUserTransactions>(
        []
    );
    const [liquidityPoolMyTransactions, setLiquidityPoolMyTransactions] = useState<LiquidityPoolUserTransactions>([]);
    const [round, setRound] = useState<number>(currentRound);
    const [selectedTab, setSelectedTab] = useState<LiquidityPoolTransaction>(
        LiquidityPoolTransaction.USER_TRANSACTIONS
    );

    const tabContent: Array<{
        id: LiquidityPoolTransaction;
        name: string;
    }> = useMemo(
        () => [
            {
                id: LiquidityPoolTransaction.USER_TRANSACTIONS,
                name: t(`liquidity-pool.user-transactions.title`),
            },
            {
                id: LiquidityPoolTransaction.YOUR_TRANSACTIONS,
                name: t(`liquidity-pool.user-transactions.your-transactions-title`),
            },
        ],
        [t]
    );

    const rounds: Array<{ value: number; label: string }> = [];
    for (let index = 0; index <= currentRound; index++) {
        rounds.push({
            value: index,
            label: `${t('liquidity-pool.user-transactions.round-label')} ${index}`,
        });
    }

    const liquidityPoolUserTransactionsQuery = useLiquidityPoolUserTransactionsQuery(liquidityPoolAddress, collateral, {
        networkId,
    });

    useEffect(() => setRound(currentRound), [currentRound]);

    useEffect(() => {
        if (liquidityPoolUserTransactionsQuery.isSuccess && liquidityPoolUserTransactionsQuery.data) {
            setLiquidityPoolUserTransactions(
                orderBy(
                    liquidityPoolUserTransactionsQuery.data.filter(
                        (trade: LiquidityPoolUserTransaction) => trade.round === round
                    ),
                    ['timestamp', 'blockNumber'],
                    ['desc', 'desc']
                )
            );
            setLiquidityPoolMyTransactions(
                orderBy(
                    liquidityPoolUserTransactionsQuery.data.filter(
                        (trade: LiquidityPoolUserTransaction) => trade.account === walletAddress.toLowerCase()
                    ),
                    ['timestamp', 'blockNumber'],
                    ['desc', 'desc']
                )
            );
        } else {
            setLiquidityPoolUserTransactions([]);
        }
    }, [liquidityPoolUserTransactionsQuery.isSuccess, liquidityPoolUserTransactionsQuery.data, round, walletAddress]);

    const noLiquidityPoolUserTransactions = liquidityPoolUserTransactions.length === 0;
    const noLiquidityPoolMyTransactions = liquidityPoolMyTransactions.length === 0;

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
                {selectedTab === LiquidityPoolTransaction.USER_TRANSACTIONS && (
                    <RightHeader>
                        <SelectContainer>
                            <SelectInput
                                options={rounds}
                                handleChange={(value) => setRound(Number(value))}
                                defaultValue={round}
                                width={230}
                            />
                        </SelectContainer>
                    </RightHeader>
                )}
            </Header>
            <TableContainer>
                {selectedTab === LiquidityPoolTransaction.USER_TRANSACTIONS && (
                    <UserTransactionsTable
                        transactions={liquidityPoolUserTransactions}
                        isLoading={liquidityPoolUserTransactionsQuery.isLoading}
                        noResultsMessage={
                            noLiquidityPoolUserTransactions ? (
                                <span>{t(`liquidity-pool.user-transactions.no-transactions`)}</span>
                            ) : undefined
                        }
                        collateral={collateral}
                    />
                )}
                {selectedTab === LiquidityPoolTransaction.YOUR_TRANSACTIONS && (
                    <UserTransactionsTable
                        transactions={liquidityPoolMyTransactions}
                        isLoading={liquidityPoolUserTransactionsQuery.isLoading}
                        noResultsMessage={
                            noLiquidityPoolMyTransactions ? (
                                <span>{t(`liquidity-pool.user-transactions.no-transactions`)}</span>
                            ) : undefined
                        }
                        collateral={collateral}
                    />
                )}
            </TableContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    color: ${(props) => props.theme.textColor.primary};
    position: relative;
    max-height: 370px;
    min-height: 370px;
    overflow-y: auto;
    width: 70%;
    padding: 10px;
    margin-top: 20px;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

const Header = styled(FlexDivRow)`
    margin: 15px 18px;
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
    min-height: 38px;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const Tab = styled(FlexDivCentered)<{ isActive: boolean; index: number }>`
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    user-select: none;
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
    @media (max-width: 767px) {
        width: 700px;
    }
`;

const SelectContainer = styled.div`
    width: 230px;
`;

export default Transactions;

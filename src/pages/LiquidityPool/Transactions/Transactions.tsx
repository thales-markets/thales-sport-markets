import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import { getIsAppReady } from 'redux/modules/app';
import { LiquidityPoolUserTransactions, LiquidityPoolUserTransaction } from 'types/liquidityPool';
import SelectInput from 'components/SelectInput';
import useLiquidityPoolUserTransactionsQuery from 'queries/liquidityPool/useLiquidityPoolUserTransactionsQuery';
import UserTransactionsTable from '../UserTransactionsTable';
import { LiquidityPoolTransaction } from 'constants/liquidityPool';

type TransactionsProps = {
    currentRound: number;
};

const Transactions: React.FC<TransactionsProps> = ({ currentRound }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
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

    const liquidityPoolUserTransactionsQuery = useLiquidityPoolUserTransactionsQuery(networkId, {
        enabled: isAppReady,
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
    color: #3b4472;
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

export default Transactions;

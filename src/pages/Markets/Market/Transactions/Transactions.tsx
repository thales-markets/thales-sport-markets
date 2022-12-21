import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { orderBy } from 'lodash';
import useMarketTransactionsQuery from 'queries/markets/useMarketTransactionsQuery';
import TransactionsTable from 'pages/Markets/components/TransactionsTable';
import { FlexDivColumn } from 'styles/common';
import {
    ClaimTransaction,
    MarketData,
    MarketTransaction,
    MarketTransactions,
    MarketTransactionType,
} from 'types/markets';
import useClaimTransactionsPerMarket from 'queries/markets/useClaimTransactionsPerMarket';
import { convertFinalResultToResultType } from 'utils/markets';

type TransactionsProps = {
    market: MarketData;
};

const Transactions: React.FC<TransactionsProps> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const marketTransactionsQuery = useMarketTransactionsQuery(market.address, networkId, undefined, {
        enabled: isAppReady,
    });

    const marketClaimTransactionsQuery = useClaimTransactionsPerMarket(market.address, networkId, {
        enabled: isAppReady,
    });

    const marketTransactions: MarketTransactions = useMemo(() => {
        let data: MarketTransaction[] = [];

        if (marketClaimTransactionsQuery.isSuccess && marketClaimTransactionsQuery.data) {
            marketClaimTransactionsQuery.data.forEach((claimTx: ClaimTransaction) => {
                return data.push({
                    hash: claimTx.id,
                    type: 'claim' as MarketTransactionType,
                    account: claimTx.account,
                    timestamp: Number(claimTx.timestamp),
                    amount: claimTx.amount,
                    position: convertFinalResultToResultType(claimTx.market.finalResult),
                    market: claimTx.market.address,
                    paid: 0,
                    blockNumber: 0,
                    wholeMarket: claimTx.market,
                });
            });
        }

        if (marketTransactionsQuery.isSuccess && marketTransactionsQuery.data) {
            marketTransactionsQuery.data.forEach((marketTransaction: MarketTransaction) => {
                return data.push({
                    hash: marketTransaction.hash,
                    type: marketTransaction.type,
                    account: marketTransaction.account,
                    timestamp: marketTransaction.timestamp,
                    amount: marketTransaction.amount,
                    position: marketTransaction.position,
                    market: marketTransaction.market,
                    paid: marketTransaction.paid,
                    blockNumber: 0,
                    wholeMarket: marketTransaction.wholeMarket,
                });
            });
        }

        data = orderBy(data, ['timestamp'], ['desc']);

        return data;
    }, [
        marketClaimTransactionsQuery?.isSuccess,
        marketClaimTransactionsQuery?.data,
        marketTransactionsQuery?.isSuccess,
        marketTransactionsQuery?.data,
    ]);

    const noResults = marketTransactions.length === 0;
    const isLoading = marketClaimTransactionsQuery?.isLoading || marketTransactionsQuery?.isLoading;

    return (
        <Container>
            <TableContainer>
                <Title>{t('market.table.title')}</Title>
                <TransactionsTable
                    transactions={marketTransactions}
                    isLoading={isLoading}
                    noResultsMessage={noResults ? <span>{t(`market.table.no-results`)}</span> : undefined}
                />
            </TableContainer>
        </Container>
    );
};

const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

const Container = styled(FlexDivColumn)`
    border-radius: 15px;
    font-style: normal;
    font-weight: normal;
    padding: 20px 0px 20px 0px;
    color: ${(props) => props.theme.textColor.primary};
    position: relative;
    width: 100%;
    @media (max-width: 991px) {
        flex-direction: column;
    }
    @media (max-width: 575px) {
        padding: 20px 10px;
    }
    max-height: 357px;
    min-height: 357px;
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
`;

export default Transactions;

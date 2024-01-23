import { orderBy } from 'lodash';
import TransactionsTable from 'pages/Markets/components/TransactionsTable';
import useClaimTransactionsPerMarket from 'queries/markets/useClaimTransactionsPerMarket';
import useMarketTransactionsQuery from 'queries/markets/useMarketTransactionsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import {
    ClaimTransaction,
    MarketTransaction,
    MarketTransactions,
    MarketTransactionType,
    SportMarketInfo,
} from 'types/markets';
import { convertFinalResultToResultType, getIsOneSideMarket } from 'utils/markets';

type TransactionsProps = {
    market: SportMarketInfo;
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
                claimTx.market.isOneSideMarket = getIsOneSideMarket(Number(market.tags[0]));
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
                marketTransaction.wholeMarket.isOneSideMarket = getIsOneSideMarket(Number(market.tags[0]));
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
        market.tags,
    ]);

    const noResults = marketTransactions.length === 0;
    const isLoading = marketClaimTransactionsQuery?.isLoading || marketTransactionsQuery?.isLoading;

    return (
        <Container>
            <TableContainer>
                <Title>{t('market.table.single-title')}</Title>
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
`;

const TableContainer = styled(FlexDivColumn)`
    overflow: auto;
`;

export default Transactions;

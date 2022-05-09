import React, { useEffect, useState } from 'react';
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
import { MarketTransactions } from 'types/markets';

type TransactionsProps = {
    marketAddress: string;
};

const Transactions: React.FC<TransactionsProps> = ({ marketAddress }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [marketTransactions, setMarketTransactions] = useState<MarketTransactions>([]);

    const marketTransactionsQuery = useMarketTransactionsQuery(marketAddress, networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (marketTransactionsQuery.isSuccess && marketTransactionsQuery.data) {
            setMarketTransactions(
                orderBy(marketTransactionsQuery.data, ['timestamp', 'blockNumber'], ['desc', 'desc'])
            );
        }
    }, [marketTransactionsQuery.isSuccess, marketTransactionsQuery.data]);

    const noResults = marketTransactions.length === 0;

    return (
        <Container>
            <Title>{t('market.table.title')}</Title>
            <TableContainer>
                <TransactionsTable
                    transactions={marketTransactions}
                    isLoading={marketTransactionsQuery.isLoading}
                    noResultsMessage={noResults ? <span>{t(`market.table.no-results`)}</span> : undefined}
                />
            </TableContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    margin-top: 40px;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 15px;
    font-style: normal;
    font-weight: normal;
    padding: 20px 20px 20px 20px;
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

const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
`;

const TableContainer = styled(FlexDivColumn)`
    overflow: auto;
    ::-webkit-scrollbar {
        width: 5px;
    }
    ::-webkit-scrollbar-track {
        background: #04045a;
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

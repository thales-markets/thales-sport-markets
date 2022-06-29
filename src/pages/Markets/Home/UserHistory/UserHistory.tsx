import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import useUserTransactionsQuery from '../../../../queries/markets/useUserTransactionsQuery';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getNetworkId, getWalletAddress } from '../../../../redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import TransactionsTable from '../../components/TransactionsTable/TransactionsTable';
import { MarketTransactions } from '../../../../types/markets';
import { orderBy } from 'lodash';

const UserHistory: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const userTransactionsQuery = useUserTransactionsQuery(walletAddress, networkId);

    const [userTransactions, setUserTransactions] = useState<MarketTransactions>([]);

    useEffect(() => {
        if (userTransactionsQuery.isSuccess && userTransactionsQuery.data) {
            setUserTransactions(orderBy(userTransactionsQuery.data, ['timestamp', 'blockNumber'], ['desc', 'desc']));
        }
    }, [userTransactionsQuery.isSuccess, userTransactionsQuery.data]);

    const noResults = userTransactions.length === 0;

    return (
        <Container>
            <Title>{t('market.table.title')}</Title>
            <TableContainer>
                <TransactionsTable
                    transactions={userTransactions}
                    isLoading={userTransactionsQuery.isLoading}
                    noResultsMessage={noResults ? <span>{t(`market.table.no-results`)}</span> : undefined}
                />
            </TableContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    margin-top: 10px;
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

export default UserHistory;

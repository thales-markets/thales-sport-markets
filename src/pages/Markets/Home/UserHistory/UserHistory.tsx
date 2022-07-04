import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import useUserTransactionsQuery from '../../../../queries/markets/useUserTransactionsQuery';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getNetworkId, getWalletAddress } from '../../../../redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import { MarketTransactions, SportMarkets, UserTransaction, UserTransactions } from '../../../../types/markets';
import { orderBy } from 'lodash';
import useSportMarketsQuery from '../../../../queries/markets/useSportMarketsQuery';
import { getIsAppReady } from '../../../../redux/modules/app';
import HistoryTable from '../../components/HistoryTable';
import { Position } from '../../../../constants/options';
import { getEtherscanTxLink } from '../../../../utils/etherscan';

const UserHistory: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const userTransactionsQuery = useUserTransactionsQuery(walletAddress, networkId, { enabled: isAppReady });
    const sportMarketsQuery = useSportMarketsQuery(networkId, { enabled: isAppReady });

    const [userTransactions, setUserTransactions] = useState<MarketTransactions>([]);
    const [markets, setMarkets] = useState<SportMarkets>([]);

    useEffect(() => {
        if (userTransactionsQuery.isSuccess && userTransactionsQuery.data) {
            setUserTransactions(orderBy(userTransactionsQuery.data, ['timestamp', 'blockNumber'], ['desc', 'desc']));
        }
    }, [userTransactionsQuery.isSuccess, userTransactionsQuery.data]);

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            setMarkets(sportMarketsQuery.data);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data]);

    const noResults = userTransactions.length === 0;

    const userTransactionsWithMarket: UserTransactions = useMemo(() => {
        return userTransactions.map((tx) => {
            const market = markets.find((market) => tx.market === market.address);
            if (market) {
                return {
                    ...tx,
                    game: `${market.homeTeam} - ${market.awayTeam}`,
                    winner: Position[market.finalResult],
                    // @ts-ignore
                    usdValue: +market[`${tx.position.toLowerCase()}Odds`] * +tx.amount,
                    link: getEtherscanTxLink(networkId, tx.hash),
                };
            } else {
                return tx as UserTransaction;
            }
        });
    }, [markets, userTransactions]);

    return (
        <Container>
            <TableContainer>
                <HistoryTable
                    transactions={userTransactionsWithMarket}
                    isLoading={userTransactionsQuery.isLoading}
                    noResultsMessage={noResults ? <span>{t(`market.table.no-results`)}</span> : undefined}
                />
            </TableContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    margin-top: 10px;
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

export default UserHistory;

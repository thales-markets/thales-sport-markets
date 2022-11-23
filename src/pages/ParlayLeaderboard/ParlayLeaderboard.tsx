import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { OddsType } from 'constants/markets';
import { AddressLink } from 'pages/Rewards/styled-components';

import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { ParlayMarketWithRank } from 'types/markets';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import { formatMarketOdds } from 'utils/markets';

const ParlayLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const query = useParlayLeaderboardQuery(networkId, undefined, undefined, { enabled: isAppReady });
    const parlays = query.isSuccess ? query.data : [];

    return (
        <Container>
            <Table
                data={parlays}
                tableRowHeadStyles={{ width: '100%' }}
                columns={[
                    {
                        accessor: 'rank',
                        Header: <>Rank</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['rank']>) => (
                            <TableText>{cellProps.cell.value}</TableText>
                        ),
                    },
                    {
                        Header: <>{t('rewards.table.wallet-address')}</>,
                        accessor: 'account',
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['account']>) => (
                            <AddressLink
                                href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {truncateAddress(cellProps.cell.value, 5)}
                            </AddressLink>
                        ),
                    },
                    {
                        accessor: 'totalQuote',
                        Header: <>Quote</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalQuote']>) => (
                            <TableText>{formatMarketOdds(OddsType.Decimal, cellProps.cell.value)}</TableText>
                        ),
                    },
                    {
                        accessor: 'sUSDAfterFees',
                        Header: <>Paid</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['sUSDAfterFees']>) => (
                            <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                        ),
                    },
                    {
                        accessor: 'totalAmount',
                        Header: <>Won</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalAmount']>) => (
                            <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                        ),
                    },
                ]}
            ></Table>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 80%;
    position: relative;
    align-items: center;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

const TableText = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #eeeee4;
    @media (max-width: 600px) {
        font-size: 10px;
    }
`;

export default ParlayLeaderboard;

import useLeaderboardByVolumeQuery from 'queries/marchMadness/useLeaderboardByVolumeQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Column, useTable } from 'react-table';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getDefaultColleteralForNetwork } from 'utils/collaterals';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    Container,
    Table,
    TableContainer,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableRowCell,
} from './styled-components';

const TableByVolume: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const columns: Column[] = useMemo(() => {
        return [
            {
                Header: '',
                accessor: 'rank',
            },
            {
                Header: 'Address',
                accessor: 'walletAddress',
                Cell: (cellProps) => <>{truncateAddress(cellProps.cell.value, 5)}</>,
            },
            {
                Header: 'Base',
                accessor: 'baseVolume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: 'Bonus',
                accessor: 'bonusVolume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: 'Volume',
                accessor: 'volume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: 'Rewards',
                accessor: 'rewards',
            },
        ];
    }, [networkId]);

    const leaderboardQuery = useLeaderboardByVolumeQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data?.leaderboard;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
        <Container>
            <TableContainer hideBottomBorder={true}>
                <TableHeader>{'By volume'}</TableHeader>
            </TableContainer>
            <TableContainer>
                <Table {...getTableProps()}>
                    <thead>
                        {headerGroups.map((headerGroup, headerGroupIndex) => (
                            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroupIndex}>
                                {headerGroup.headers.map((column, columnKey) => (
                                    <TableHeaderCell {...column.getHeaderProps()} key={columnKey}>
                                        {column.render('Header')}
                                    </TableHeaderCell>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, rowKey) => {
                            prepareRow(row);
                            return (
                                <TableRow {...row.getRowProps()} key={rowKey} hideBorder={rowKey == rows.length}>
                                    {row.cells.map((cell, cellIndex) => {
                                        return (
                                            <TableRowCell {...cell.getCellProps()} key={cellIndex}>
                                                {cell.render('Cell')}
                                            </TableRowCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </tbody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default TableByVolume;

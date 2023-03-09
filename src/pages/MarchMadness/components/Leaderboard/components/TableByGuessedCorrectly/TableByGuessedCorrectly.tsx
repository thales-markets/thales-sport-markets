import styled from 'styled-components';
import React, { useMemo } from 'react';
import { Column, useTable } from 'react-table';
import {
    Table,
    TableContainer,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableRowCell,
} from '../TableByVolume/styled-components';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { truncateAddress } from 'utils/formatters/string';
import useLoeaderboardByGuessedCorrectlyQuery from 'queries/marchMadness/useLoeaderboardByGuessedCorrectlyQuery';

const TableByGuessedCorrectly: React.FC = () => {
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
                Header: 'Guessed games',
                accessor: 'totalCorrectedPredictions',
            },
            {
                Header: 'Rewards',
                accessor: 'rewards',
            },
        ];
    }, []);

    const leaderboardQuery = useLoeaderboardByGuessedCorrectlyQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    console.log('Data ', data);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
        <Container>
            <TableContainer hideBottomBorder={true}>
                <TableHeader>{'By guessed correctly'}</TableHeader>
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
                                <TableRow {...row.getRowProps()} key={rowKey}>
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

const Container = styled.div`
    width: 40%;
    padding-left: 10px;
`;

export default TableByGuessedCorrectly;

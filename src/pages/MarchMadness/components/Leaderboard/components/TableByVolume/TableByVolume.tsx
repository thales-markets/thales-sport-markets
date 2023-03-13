import Tooltip from 'components/Tooltip';
import useLeaderboardByVolumeQuery from 'queries/marchMadness/useLeaderboardByVolumeQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Column, useTable } from 'react-table';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getDefaultColleteralForNetwork } from 'utils/collaterals';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    Container,
    NoDataContainer,
    NoDataLabel,
    OverlayContainer,
    Table,
    TableContainer,
    TableHeader,
    TableHeaderCell,
    TableHeaderContainer,
    TableRow,
    TableRowCell,
} from './styled-components';

export const TooltipStyle = { backgroundColor: '#021631', border: '1px solid #005EB8' };

const TableByVolume: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const columns: Column[] = useMemo(() => {
        return [
            {
                Header: '',
                accessor: 'rank',
            },
            {
                Header: <>{t('march-madness.leaderboard.address')}</>,
                accessor: 'walletAddress',
                Cell: (cellProps) => <>{truncateAddress(cellProps.cell.value, 5)}</>,
            },
            {
                Header: <>{t('march-madness.leaderboard.volume')}</>,
                accessor: 'volume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.base-volume')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-base-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'baseVolume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.bonus-volume')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-bonus-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'bonusVolume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.rewards')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-rewards-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'rewards',
            },
        ];
    }, [networkId, t]);

    const leaderboardQuery = useLeaderboardByVolumeQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data?.leaderboard;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
        <Container>
            <TableHeaderContainer hideBottomBorder={true}>
                <TableHeader>{'By volume'}</TableHeader>
            </TableHeaderContainer>
            <TableContainer>
                {!data?.length && (
                    <NoDataContainer>
                        <NoDataLabel>{t('march-madness.leaderboard.no-data')}</NoDataLabel>
                    </NoDataContainer>
                )}
                {data?.length > 0 && (
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
                )}
            </TableContainer>
        </Container>
    );
};

export default TableByVolume;

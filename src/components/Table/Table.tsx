import React, { useMemo, DependencyList, CSSProperties } from 'react';
import { useTable, useSortBy, Column, Row } from 'react-table';
import SimpleLoader from 'components/SimpleLoader';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDiv, FlexDivCentered } from 'styles/common';
import { SortDirection } from 'constants/markets';

type ColumnWithSorting<D extends Record<string, unknown>> = Column<D> & {
    sortType?: string;
    sortable?: boolean;
};

type TableProps = {
    data: Record<string, unknown>[];
    columns: ColumnWithSorting<Record<string, unknown>>[];
    columnsDeps?: DependencyList;
    options?: any;
    onTableRowClick?: (row: Row<any>) => void;
    isLoading?: boolean;
    noResultsMessage?: React.ReactNode;
    tableHeadCellStyles?: CSSProperties;
    tableRowCellStyles?: CSSProperties;
};

const Table: React.FC<TableProps> = ({
    columns = [],
    columnsDeps = [],
    data = [],
    options = {},
    noResultsMessage = null,
    onTableRowClick = undefined,
    isLoading = false,
    tableHeadCellStyles = {},
    tableRowCellStyles = {},
}) => {
    const { t } = useTranslation();
    const memoizedColumns = useMemo(() => columns, [...columnsDeps, t]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns: memoizedColumns,
            data,
            ...options,
            autoResetSortBy: false,
        },
        useSortBy
    );

    return (
        <>
            {headerGroups.map((headerGroup, headerGroupIndex: any) => (
                <TableRowHead {...headerGroup.getHeaderGroupProps()} key={headerGroupIndex}>
                    {headerGroup.headers.map((column: any, headerIndex: any) => (
                        <TableCellHead
                            {...column.getHeaderProps(column.sortable ? column.getSortByToggleProps() : undefined)}
                            key={headerIndex}
                            style={column.sortable ? { cursor: 'pointer', ...tableHeadCellStyles } : {}}
                        >
                            <HeaderTitle>{column.render('Header')}</HeaderTitle>
                            {column.sortable && (
                                <SortIconContainer>
                                    {column.isSorted ? (
                                        column.isSortedDesc ? (
                                            <SortIcon selected sortDirection={SortDirection.DESC} />
                                        ) : (
                                            <SortIcon selected sortDirection={SortDirection.ASC} />
                                        )
                                    ) : (
                                        <SortIcon selected={false} sortDirection={SortDirection.NONE} />
                                    )}
                                </SortIconContainer>
                            )}
                        </TableCellHead>
                    ))}
                </TableRowHead>
            ))}
            <ReactTable {...getTableProps()}>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : noResultsMessage != null ? (
                    <NoResultContainer>{noResultsMessage}</NoResultContainer>
                ) : (
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row, rowIndex: any) => {
                            prepareRow(row);

                            return (
                                <TableRow
                                    {...row.getRowProps()}
                                    onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
                                    key={rowIndex}
                                >
                                    {row.cells.map((cell, cellIndex: any) => (
                                        <TableCell style={tableRowCellStyles} {...cell.getCellProps()} key={cellIndex}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                )}
            </ReactTable>
        </>
    );
};

const ReactTable = styled.div`
    width: 100%;
    height: 100%;
    overflow-x: auto;
    position: relative;
    display: flex;
`;

const TableBody = styled.div`
    display: flex;
    overflow: auto;
    flex-direction: column;
    width: 100%;
`;

const TableRow = styled(FlexDiv)`
    min-height: 38px;
    font-weight: 600;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.25px;
    border-bottom: 2px dotted ${(props) => props.theme.borderColor.primary};
`;

const TableRowHead = styled(TableRow)`
    min-height: 40px;
`;

const TableCell = styled(FlexDivCentered)`
    flex: 1;
    min-width: 0px;
    width: 150px;
    justify-content: left;
    &:first-child {
        padding-left: 18px;
    }
    &:last-child {
        padding-right: 18px;
    }
    @media (max-width: 767px) {
        font-size: 12px;
    }
    @media (max-width: 512px) {
        font-size: 10px;
        justify-content: center;
        text-align: center;
        &:first-child {
            padding-left: 6px;
        }
        &:last-child {
            padding-right: 0;
        }
    }
`;

const TableCellHead = styled(TableCell)`
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.5px;
    @media (max-width: 767px) {
        font-size: 13px;
    }
    @media (max-width: 512px) {
        font-size: 10px;
    }
    user-select: none;
`;

const HeaderTitle = styled.span`
    text-transform: uppercase;
`;

const SortIconContainer = styled.span`
    display: flex;
    align-items: center;
`;

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 228px;
    width: 100%;
`;

const NoResultContainer = styled(TableRow)`
    height: 60px;
    padding-top: 20px;
    padding-left: 18px;
    font-size: 14px;
    border: none;
`;

const SortIcon = styled.i<{ selected: boolean; sortDirection: SortDirection }>`
    font-size: ${(props) => (props.selected && props.sortDirection !== SortDirection.NONE ? 22 : 19)}px;
    &:before {
        font-family: ExoticIcons !important;
        content: ${(props) =>
            props.selected
                ? props.sortDirection === SortDirection.ASC
                    ? "'\\0046'"
                    : props.sortDirection === SortDirection.DESC
                    ? "'\\0047'"
                    : "'\\0045'"
                : "'\\0045'"};
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default Table;

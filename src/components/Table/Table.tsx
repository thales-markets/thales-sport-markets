import SimpleLoader from 'components/SimpleLoader';
import { SortDirection } from 'enums/markets';
import React, { CSSProperties, DependencyList, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cell, Column, Row, usePagination, useSortBy, useTable } from 'react-table';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered } from 'styles/common';

type CSSPropertiesWithMedia = { cssProperties: CSSProperties } & { mediaMaxWidth: string };

type ColumnWithSorting<D extends Record<string, unknown>> = Column<D> & {
    sortType?: string | ((rowA: any, rowB: any, columnId?: string, desc?: boolean) => number);
    sortable?: boolean;
    headStyle?: CSSPropertiesWithMedia;
    headTitleStyle?: CSSPropertiesWithMedia;
};

type TableProps = {
    data: Record<string, unknown>[];
    columns: ColumnWithSorting<Record<string, unknown>>[];
    columnsDeps?: DependencyList;
    options?: any;
    onTableRowClick?: (row: Row<any>) => void;
    onTableCellClick?: (row: Row<any>, cell: Cell<any>) => void;
    isLoading?: boolean;
    noResultsMessage?: React.ReactNode;
    tableRowHeadStyles?: CSSProperties;
    tableRowStyles?: CSSProperties;
    tableHeadCellStyles?: CSSProperties;
    tableRowCellStyles?: CSSProperties;
    initialState?: any;
    onSortByChanged?: any;
    currentPage?: number;
    rowsPerPage?: number;
    tableHeight?: string;
    expandedRow?: (row: Row<any>) => JSX.Element;
    stickyRow?: JSX.Element;
};

const Table: React.FC<TableProps> = ({
    columns = [],
    columnsDeps = [],
    data = [],
    options = {},
    noResultsMessage = null,
    onTableRowClick = undefined,
    onTableCellClick = undefined,
    isLoading = false,
    tableRowHeadStyles = {},
    tableRowStyles = {},
    tableHeadCellStyles = {},
    tableRowCellStyles = {},
    initialState = {},
    onSortByChanged = undefined,
    currentPage,
    rowsPerPage,
    expandedRow,
    stickyRow,
    tableHeight,
}) => {
    const { t } = useTranslation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedColumns = useMemo(() => columns, [...columnsDeps, t]);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        gotoPage,
        setPageSize,
        page,
    } = useTable(
        {
            columns: memoizedColumns,
            data,
            ...options,
            initialState,
            autoResetSortBy: false,
            autoResetPage: false,
        },
        useSortBy,
        usePagination
    );

    useEffect(() => {
        onSortByChanged && onSortByChanged();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.sortBy]);

    useEffect(() => {
        if (currentPage !== undefined) {
            gotoPage(currentPage);
        }
    }, [currentPage, gotoPage]);

    useEffect(() => {
        if (rowsPerPage !== undefined) {
            setPageSize(rowsPerPage || 0);
        }
    }, [rowsPerPage, setPageSize]);

    return (
        <>
            {headerGroups.map((headerGroup, headerGroupIndex: any) => (
                <TableRowHead style={tableRowHeadStyles} {...headerGroup.getHeaderGroupProps()} key={headerGroupIndex}>
                    {headerGroup.headers.map((column: any, headerIndex: any) => (
                        <TableCellHead
                            {...column.getHeaderProps(column.sortable ? column.getSortByToggleProps() : undefined)}
                            cssProp={column.headStyle}
                            key={headerIndex}
                            style={
                                column.sortable
                                    ? { cursor: 'pointer', ...tableHeadCellStyles }
                                    : { ...tableHeadCellStyles }
                            }
                            width={column.width}
                            id={column.id}
                        >
                            <HeaderTitle cssProp={column.headTitleStyle}>{column.render('Header')}</HeaderTitle>
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
            <ReactTable height={tableHeight} {...getTableProps()}>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : noResultsMessage != null && !data?.length ? (
                    <NoResultContainer>{noResultsMessage}</NoResultContainer>
                ) : (
                    <TableBody height={tableHeight} {...getTableBodyProps()}>
                        {stickyRow ?? <></>}
                        {(currentPage !== undefined ? page : rows).map((row, rowIndex: any) => {
                            prepareRow(row);

                            return (
                                <ExpandableRow key={rowIndex}>
                                    {expandedRow ? (
                                        <ExpandableRowReact
                                            row={row}
                                            tableRowCellStyles={tableRowCellStyles}
                                            isVisible={false}
                                            tableRowStyles={tableRowStyles}
                                        >
                                            {expandedRow(row)}
                                        </ExpandableRowReact>
                                    ) : (
                                        <TableRow
                                            style={tableRowStyles}
                                            {...row.getRowProps()}
                                            cursorPointer={!!onTableRowClick}
                                            onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
                                        >
                                            {row.cells.map((cell, cellIndex: any) => {
                                                return (
                                                    <TableCell
                                                        style={tableRowCellStyles}
                                                        {...cell.getCellProps()}
                                                        key={cellIndex}
                                                        width={cell.column.width}
                                                        minWidth={cell.column.minWidth}
                                                        id={cell.column.id}
                                                        onClick={
                                                            onTableCellClick
                                                                ? () => onTableCellClick(row, cell)
                                                                : undefined
                                                        }
                                                    >
                                                        {cell.render('Cell')}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    )}
                                </ExpandableRow>
                            );
                        })}
                    </TableBody>
                )}
            </ReactTable>
        </>
    );
};

const ExpandableRowReact: React.FC<{
    isVisible: boolean;
    tableRowStyles: React.CSSProperties;
    row: Row<any>;
    tableRowCellStyles: React.CSSProperties;
}> = ({ isVisible, tableRowStyles, row, tableRowCellStyles, children }) => {
    const [hidden, setHidden] = useState<boolean>(!isVisible);

    return (
        <>
            <TableRow
                style={{ ...tableRowStyles, borderBottom: hidden ? '' : '2px dashed transparent' }}
                {...row.getRowProps()}
                cursorPointer={true}
                onClick={setHidden.bind(this, !hidden)}
            >
                {row.cells.map((cell, cellIndex: any) => (
                    <TableCell
                        style={tableRowCellStyles}
                        {...cell.getCellProps()}
                        key={cellIndex}
                        width={cell.column.width}
                        minWidth={cell.column.minWidth}
                        id={cell.column.id}
                    >
                        {cell.render('Cell')}
                    </TableCell>
                ))}
                <ArrowIcon className={hidden ? 'icon icon--arrow-down' : 'icon icon--arrow-up'} />
            </TableRow>
            <ExpandableRow style={{ display: hidden ? 'none' : 'block' }}>{children}</ExpandableRow>
        </>
    );
};

const ReactTable = styled.div<{ height?: string }>`
    width: 100%;
    height: ${(props) => props.height || '100%'};
    overflow-x: auto;
    position: relative;
    display: flex;
`;

const TableBody = styled.div<{ height?: string }>`
    display: flex;
    overflow: auto;
    flex-direction: column;
    width: 100%;
    padding-right: ${(props) => (props.height ? '10px' : '0')};
    @media (max-width: 767px) {
        padding-right: ${(props) => (props.height ? '5px' : '0')};
    }
`;

const TableRow = styled(FlexDiv)<{ cursorPointer?: boolean }>`
    cursor: ${(props) => (props.cursorPointer ? 'pointer' : 'default')};
    min-height: 38px;
    font-weight: 600;
    font-size: 12px;
    line-height: 100%;
    letter-spacing: 0.25px;
    border-bottom: 2px dashed ${(props) => props.theme.borderColor.senary};
`;

const TableRowHead = styled(TableRow)`
    min-height: 31px;
    border-radius: 5px;
    background-color: ${(props) => props.theme.background.secondary};
    border-bottom: none;
`;

const TableCell = styled(FlexDivCentered)<{ width?: number | string; id: string; minWidth?: number }>`
    flex: 1;
    max-width: ${(props) => (props.width ? props.width : 'initial')};
    min-width: ${(props) => (props.minWidth ? `${props.minWidth}px` : '0px')};
    justify-content: ${(props) => CellAlignment[props.id] || 'left'};
    &:first-child {
        padding-left: 18px;
    }
    &:last-child {
        padding-right: 18px;
    }
    @media (max-width: 767px) {
        min-width: auto;
        font-size: 12px;
        &:first-child {
            padding-left: 6px;
        }
        &:last-child {
            padding-right: 6px;
        }
    }
    @media (max-width: 575px) {
        font-size: 10px;
        &:first-child {
            padding-left: 6px;
        }
        &:last-child {
            padding-right: 0;
        }
    }
`;

const TableCellHead = styled(TableCell)<{ cssProp?: CSSPropertiesWithMedia }>`
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.5px;
    @media (max-width: 767px) {
        font-size: 10px;
    }
    @media (max-width: ${(props) => (props.cssProp ? props.cssProp.mediaMaxWidth : '600px')}) {
        ${(props) => (props.cssProp ? { ...props.cssProp.cssProperties } : '')}
    }
    @media (max-width: 575px) {
        font-size: 9px;
    }
    user-select: none;
`;

const HeaderTitle = styled.span<{ cssProp?: CSSPropertiesWithMedia }>`
    text-transform: uppercase;
    @media (max-width: ${(props) => (props.cssProp ? props.cssProp.mediaMaxWidth : '600px')}) {
        ${(props) => (props.cssProp ? { ...props.cssProp.cssProperties } : '')}
    }
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
    margin: auto;
`;

const SortIcon = styled.i<{ selected: boolean; sortDirection: SortDirection }>`
    text-transform: none;
    font-weight: ${(props) => (props.selected && props.sortDirection !== SortDirection.NONE ? 400 : 600)};
    font-size: 13px;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: ${(props) =>
            props.selected
                ? props.sortDirection === SortDirection.ASC
                    ? "'\\00EA'"
                    : props.sortDirection === SortDirection.DESC
                    ? "'\\00D5'"
                    : "'\\00D6'"
                : "'\\00D6'"};
    }
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

const CellAlignment: Record<string, string> = {
    wallet: 'center',
    points: 'center',
    rewards: 'center',
    finishTime: 'center',
};

const ExpandableRow = styled.div`
    display: block;
`;

const ArrowIcon = styled.i`
    font-size: 9px;
    display: flex;
    align-items: center;
    margin-right: 5px;
`;

export default Table;

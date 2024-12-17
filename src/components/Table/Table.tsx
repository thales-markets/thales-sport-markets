import {
    Cell,
    Column,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import SelectInput from 'components/SelectInput';
import SimpleLoader from 'components/SimpleLoader';
import { SortDirection } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { CSSProperties, DependencyList, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered } from 'styles/common';

const PAGINATION_SIZE = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
];

type CSSPropertiesWithMedia = { cssProperties: CSSProperties } & { mediaMaxWidth: string };

type ColumnWithSorting<D extends Record<string, unknown>> = Column<D> & {
    sortingFn?: string | ((rowA: any, rowB: any, columnId?: string, desc?: boolean) => number);
    enableSorting?: boolean;
    headStyle?: CSSPropertiesWithMedia;
    headTitleStyle?: CSSPropertiesWithMedia;
};

type TableProps = {
    data: Record<string, unknown>[];
    columns: ColumnWithSorting<Record<string, unknown>>[];
    columnsDeps?: DependencyList;
    options?: any;
    onTableRowClick?: (row: Row<any>) => void;
    onTableCellClick?: (row: Row<any>, cell: Cell<any, any>) => void;
    isLoading?: boolean;
    noResultsMessage?: React.ReactNode;
    tableRowHeadStyles?: CSSProperties;
    tableRowStyles?: CSSProperties;
    tableHeadCellStyles?: CSSProperties;
    tableRowCellStyles?: CSSProperties;
    initialState?: any;
    rowsPerPage?: number;
    tableHeight?: string;
    expandedRow?: (row: Row<any>) => JSX.Element;
    stickyRow?: JSX.Element;
    mobileCards?: boolean;
    expandAll?: boolean;
    showPagination?: boolean;
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
    rowsPerPage,
    expandedRow,
    stickyRow,
    tableHeight,
    mobileCards,
    expandAll,
    showPagination,
}) => {
    const { t } = useTranslation();

    const [sorting, setSorting] = React.useState<SortingState>(initialState.sorting ? initialState.sorting : []);
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: rowsPerPage || PAGINATION_SIZE[0].value, //default page size
    });

    const isMobile = useSelector(getIsMobile);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedColumns = useMemo(() => columns, [...columnsDeps, t]);

    const tableInstance = useReactTable({
        columns: memoizedColumns,
        data,
        ...options,
        autoResetSortBy: false,
        autoResetPageIndex: false, // turn off auto reset of pageIndex
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
        onPaginationChange: setPagination, // update the pagination state when internal APIs mutate the pagination state
        state: {
            sorting,
            pagination,
        },
    });
    // handle resetting the pageIndex to avoid showing empty pages (required when autoResetPageIndex is turned off)
    useEffect(() => {
        const maxPageIndex = data.length > 0 ? Math.ceil(data.length / pagination.pageSize) - 1 : 0;

        if (pagination.pageIndex > maxPageIndex) {
            setPagination({ ...pagination, pageIndex: maxPageIndex });
        }
    }, [data.length, pagination]);

    return (
        <>
            {!(isMobile && mobileCards) &&
                tableInstance.getHeaderGroups().map((headerGroup: any, headerGroupIndex: any) => (
                    <TableRowHead style={tableRowHeadStyles} key={headerGroupIndex}>
                        {headerGroup.headers.map((header: any, headerIndex: any) => {
                            const isSortEnabled = header.column.columnDef.enableSorting;
                            return (
                                <TableCellHead
                                    {...{
                                        onClick: isSortEnabled ? header.column.getToggleSortingHandler() : undefined,
                                    }}
                                    cssProp={header.headStyle}
                                    key={headerIndex}
                                    style={
                                        isSortEnabled
                                            ? { cursor: 'pointer', ...tableHeadCellStyles }
                                            : { ...tableHeadCellStyles }
                                    }
                                    width={header.getSize()}
                                    id={header.id}
                                >
                                    <HeaderTitle cssProp={header.headTitleStyle}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </HeaderTitle>
                                    {isSortEnabled && (
                                        <SortIconContainer>
                                            {header.column.getIsSorted() ? (
                                                header.column.getIsSorted() === SortDirection.DESC ? (
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
                            );
                        })}
                    </TableRowHead>
                ))}
            <ReactTable height={tableHeight}>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : noResultsMessage !== null && !data?.length && !stickyRow ? (
                    <NoResultContainer>{noResultsMessage}</NoResultContainer>
                ) : (
                    <TableBody height={tableHeight}>
                        {stickyRow ?? <></>}
                        {tableInstance.getPaginationRowModel().rows.map((row: any, rowIndex: any) => {
                            return (
                                <ExpandableRow key={rowIndex}>
                                    {expandedRow && expandedRow(row) && expandedRow(row).type !== React.Fragment ? (
                                        <ExpandableRowReact
                                            row={row}
                                            tableRowCellStyles={tableRowCellStyles}
                                            isVisible={false}
                                            tableRowStyles={tableRowStyles}
                                            expandAll={expandAll}
                                        >
                                            {expandedRow(row)}
                                        </ExpandableRowReact>
                                    ) : (
                                        <TableRow
                                            isCard={isMobile && mobileCards}
                                            style={tableRowStyles}
                                            cursorPointer={!!onTableRowClick}
                                            onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
                                        >
                                            {row.getAllCells().map((cell: any, cellIndex: any) => {
                                                return isMobile && mobileCards ? (
                                                    <TableRowMobile key={`mrm${rowIndex}${cellIndex}`}>
                                                        <TableCell id={cell.column.id + 'Header'}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                        <TableCell isCard={mobileCards} id={cell.column.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    </TableRowMobile>
                                                ) : (
                                                    <TableCell
                                                        style={tableRowCellStyles}
                                                        key={cellIndex}
                                                        width={cell.column.getSize()}
                                                        id={cell.column.id}
                                                        onClick={
                                                            onTableCellClick
                                                                ? () => onTableCellClick(row, cell)
                                                                : undefined
                                                        }
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            {showPagination && data?.length > 0 && (
                <PaginationWrapper>
                    <SectionWrapper>
                        <PaginationLabel>{t('common.pagination.rows-per-page')}</PaginationLabel>
                        <div>
                            <SelectInput
                                options={PAGINATION_SIZE}
                                value={{ value: pagination.pageSize, label: '' + pagination.pageSize }}
                                handleChange={(value) => tableInstance.setPageSize(Number(value))}
                                isPaginationStyle
                            />
                        </div>
                    </SectionWrapper>

                    <SectionWrapper className="flex items-center gap-1">
                        <PaginationLabel>
                            {`${tableInstance.getState().pagination.pageIndex * pagination.pageSize + 1}-${Math.min(
                                data.length,
                                (tableInstance.getState().pagination.pageIndex + 1) * pagination.pageSize
                            )} ${t('common.pagination.of')} ${data.length}`}
                        </PaginationLabel>
                    </SectionWrapper>

                    <ActionSection>
                        <ArrowWrapper
                            onClick={() => tableInstance.previousPage()}
                            disabled={!tableInstance.getCanPreviousPage()}
                        >
                            <ArrowLeft className={'icon icon--arrow-down'} />
                        </ArrowWrapper>
                    </ActionSection>
                    <ActionSection>
                        <ArrowWrapper
                            onClick={() => tableInstance.getCanNextPage() && tableInstance.nextPage()}
                            disabled={!tableInstance.getCanNextPage()}
                        >
                            <ArrowRight className={'icon icon--arrow-down'} />
                        </ArrowWrapper>
                    </ActionSection>
                </PaginationWrapper>
            )}
        </>
    );
};

const ExpandableRowReact: React.FC<{
    isVisible: boolean;
    tableRowStyles: React.CSSProperties;
    row: Row<any>;
    tableRowCellStyles: React.CSSProperties;
    children: React.ReactNode;
    expandAll?: boolean;
}> = ({ isVisible, tableRowStyles, row, tableRowCellStyles, children, expandAll }) => {
    const [hidden, setHidden] = useState<boolean>(!isVisible);

    useEffect(() => {
        setHidden(!expandAll);
    }, [expandAll]);

    return (
        <>
            <TableRow
                style={{ ...tableRowStyles, borderBottom: hidden ? '' : '2px dashed transparent' }}
                cursorPointer={true}
                onClick={() => setHidden(!hidden)}
            >
                {row.getAllCells().map((cell: any, cellIndex: any) => (
                    <TableCell
                        style={tableRowCellStyles}
                        key={cellIndex}
                        width={cell.column.getSize()}
                        id={cell.column.id}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export const TableRow = styled(FlexDiv)<{ cursorPointer?: boolean; isCard?: boolean }>`
    flex-direction: ${(props) => (props.isCard ? 'column' : '')};
    cursor: ${(props) => (props.cursorPointer ? 'pointer' : 'default')};
    min-height: 38px;
    font-weight: 600;
    font-size: 12px;
    line-height: 100%;
    letter-spacing: 0.25px;
    border-bottom: 2px dashed ${(props) => !props.isCard && props.theme.borderColor.senary};
    ${(props) =>
        props.isCard &&
        `border: 1px solid #7983a9; border-radius: 8px; & > div:last-child {justify-content: flex-end;}`};
`;

const TableRowHead = styled(TableRow)`
    min-height: 31px;
    border-radius: 5px;
    background-color: ${(props) => props.theme.background.secondary};
    border-bottom: none;
`;

export const TableCell = styled(FlexDivCentered)<{
    width?: number | string;
    id: string;
    minWidth?: number;
    isCard?: boolean;
}>`
    flex: 1;
    max-width: ${(props) => (props.width ? `${props.width}px` : 'initial')};
    min-width: ${(props) => (props.minWidth ? `${props.minWidth}px` : '0px')};
    justify-content: ${(props) => (props.isCard ? 'right' : CellAlignment[props.id] || 'left')};
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

const PaginationWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 5px 0;
`;

const SectionWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin: 0 14px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin: 0 8px;
    }
`;

const PaginationLabel = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 400;
    line-height: 10%;
    letter-spacing: 0.13px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;

const ActionSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const ArrowWrapper = styled.span<{ disabled: boolean }>`
    display: flex;
    width: 40px;
    height: 24px;
    justify-content: center;
    align-items: center;
    padding: 4px;
    color: ${(props) => props.theme.textColor.primary};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;

const ArrowLeft = styled.i`
    font-size: 12px;
    rotate: 90deg;
`;
const ArrowRight = styled.i`
    font-size: 12px;
    rotate: -90deg;
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

export const TableRowMobile = styled.div<{ isSticky?: boolean }>`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0 10px;

    ${TableCell} {
        height: auto;
        margin: 6px 0px;
        width: 100%;
        :first-child {
            justify-content: flex-start;
            color: ${(props) =>
                props.isSticky ? props.theme.overdrop.textColor.tertiary : props.theme.overdrop.textColor.tertiary};
            text-transform: uppercase;
        }
    }
`;

export default Table;

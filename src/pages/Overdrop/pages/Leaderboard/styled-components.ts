import { TablePagination } from '@material-ui/core';
import styled from 'styled-components';

export const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center',
};

export const tableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '10px 0',
    flexDirection: 'column',
    gap: '3px',
    height: '50px',
    marginLeft: '5px',
};

export const StickyRow = styled.div`
    margin-top: 5px;
    margin-left: 5px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    border-radius: 25px;
    background-color: ${(props) => props.theme.overdrop.textColor.primary};
    color: black;
`;

export const StickyContrainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;

export const StickyCell = styled.div<{ width?: string }>`
    width: ${(props) => props.width || '150px'};
    display: flex;
    text-align: center;
    justify-content: center;
    padding: 10px 0px;
    flex-direction: column;
    gap: 3px;
    height: 40px;
    font-size: 12px;
    font-weight: bold;
`;

export const Badge = styled.img`
    width: 55px;
    margin-left: -7px;
`;

export const AddressContainer = styled.div`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`;

export const PaginationWrapper = styled(TablePagination)`
    border: none !important;
    display: flex;
    width: 100%;
    height: auto;
    color: ${(props) => props.theme.textColor.primary} !important;
    .MuiTablePagination-toolbar {
        min-height: 48px;
        @media (max-width: 767px) {
            min-height: 48px;
        }
    }
    .MuiToolbar-root {
        padding: 0;
        display: flex;
        .MuiSelect-icon {
            color: ${(props) => props.theme.textColor.primary};
        }
        @media (max-width: 767px) {
            font-size: 12px;
        }
    }
    .MuiTypography-body2 {
        @media (max-width: 767px) {
            font-size: 12px;
        }
    }
    .MuiIconButton-root.Mui-disabled {
        color: ${(props) => props.theme.textColor.secondary};
    }
    .MuiTablePagination-toolbar > .MuiTablePagination-caption:last-of-type {
        display: block;
    }
    .MuiTablePagination-input {
        margin-top: 2px;
    }
    .MuiTablePagination-selectRoot {
        @media (max-width: 767px) {
            margin-left: 0px;
            margin-right: 5px;
        }
    }
    .MuiTablePagination-actions {
        margin-left: 10px;
    }
    .MuiIconButton-root {
        padding: 5px 10px;
    }
`;

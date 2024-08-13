import { TablePagination } from '@material-ui/core';
import styled from 'styled-components';

const PaginationWrapper = styled(TablePagination)`
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

export default PaginationWrapper;

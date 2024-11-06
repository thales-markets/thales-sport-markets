import React from 'react';
import styled from 'styled-components';

interface PaginationWrapperProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowsPerPageOptions?: number[];
    labelRowsPerPage?: React.ReactNode;
}

const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
    count,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [10, 25, 50, 100],
    labelRowsPerPage = 'Rows per page:',
}) => {
    const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <PaginationContainer>
            <RowsPerPageContainer>
                {labelRowsPerPage}
                <Select value={rowsPerPage} onChange={() => onRowsPerPageChange}>
                    {rowsPerPageOptions.map((rowsPerPageOption) => (
                        <option key={rowsPerPageOption} value={rowsPerPageOption}>
                            {rowsPerPageOption}
                        </option>
                    ))}
                </Select>
            </RowsPerPageContainer>
            <div>{}</div>
            <Button onClick={handleFirstPageButtonClick} disabled={page === 0}>
                {'<<'}
            </Button>
            <Button onClick={handleBackButtonClick} disabled={page === 0}>
                {'<'}
            </Button>
            <Button onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                {'>'}
            </Button>
            <Button onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                {'>>'}
            </Button>
        </PaginationContainer>
    );
};

const PaginationContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 16px;
`;

const RowsPerPageContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: 32px;
`;

const Select = styled.select`
    margin-left: 8px;
    padding: 4px;
`;

const Button = styled.button`
    margin: 0 8px;
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

export default PaginationWrapper;

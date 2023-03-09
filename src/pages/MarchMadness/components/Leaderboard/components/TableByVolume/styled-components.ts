import styled from 'styled-components';

export const Table = styled.table`
    font-family: 'Oswald' !important;
    width: 100%;
`;

export const OverlayContainer = styled.div`
    text-align: center;
`;

export const TableHeaderCell = styled.th`
    font-family: 'Oswald' !important;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    padding: 5px 0px;
`;

export const TableRow = styled.tr<{ hideBorder?: boolean }>`
    font-family: 'Oswald' !important;
    font-size: 14px;
    font-weight: 600;
    border-bottom: ${(_props) => (_props?.hideBorder == true ? `2px dotted rgba(0, 94, 184, 1)` : ``)};
`;

export const TableRowCell = styled.td`
    padding: 10px 0px;
    text-align: center;
`;

export const Container = styled.div`
    height: auto;
    width: 60%;
`;

export const TableHeaderContainer = styled.div<{ hideBottomBorder?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px;
    border-bottom: ${(_props) => (_props?.hideBottomBorder === true ? '0px' : '')};
    border-style: solid;
    border-image: linear-gradient(
            279.41deg,
            #da252f 10.64%,
            #5c2c3b 23.38%,
            #021630 41.03%,
            #0c99d0 70.84%,
            #02223e 94.26%
        )
        1;
    width: 100%;
`;

export const TableContainer = styled(TableHeaderContainer)`
    min-height: 600px;
    align-items: flex-start;
`;

export const TableHeader = styled.span`
    text-transform: uppercase;
    font-size: 20px;
    font-weight: 400;
    padding: 6px 0px;
    font-family: 'NCAA' !important;
`;

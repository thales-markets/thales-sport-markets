import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';

export const Table = styled.table`
    font-family: 'Oswald' !important;
    width: 100%;
`;

export const OverlayContainer = styled.div`
    text-align: center;
    font-family: 'Oswald' !important;
    font-weight: 400;
    font-size: 12px;
`;

export const TableHeaderCell = styled.th`
    color: #fff;
    font-family: ${(props) => props.theme.fontFamily.primary};
    text-transform: uppercase;
    padding: 5px 0px;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%;
    letter-spacing: 0.3px;
`;

export const NoDataContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 60px;
    margin-top: 100px;
`;

export const NoDataLabel = styled.span`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 25px;
    line-height: 40px;
    color: ${(props) => props.theme.marchMadness.textColor.senary};
    text-align: center;
    text-transform: uppercase;
`;

export const TableRow = styled(FlexDivStart)<{ hideBorder?: boolean; topTen?: boolean; myScore?: boolean }>`
    height: 40px;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 14px;
    font-weight: 600;
    ${(props) => (props?.hideBorder == true ? `border-bottom: '';` : ``)}
    ${(props) =>
        !props?.hideBorder ? `border-bottom: 1px solid ${props.theme.marchMadness.borderColor.tertiary};` : ``}
    ${(props) => (props?.topTen == true ? `background-color: ${props.theme.marchMadness.background.senary};` : ``)}  
    ${(props) =>
        props?.topTen == true ? `border-bottom: 1px solid ${props.theme.marchMadness.borderColor.tertiary};` : ``}  
    ${(props) => (props?.myScore == true ? `background-color: ${props.theme.marchMadness.borderColor.secondary};` : ``)}
`;

export const TableRowCell = styled.span<{ width?: string; noTextTransform?: boolean }>`
    ${(props) => (props.width ? `width: ${props.width};` : '')}
    padding: 10px 0px;
    color: #fff;
    text-align: left;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 150%;
    letter-spacing: 0.21px;
    ${(props) => (props.noTextTransform ? '' : 'text-transform: uppercase;')}

    &:first-child {
        padding-left: 18px;
    }
`;

export const Container = styled.div`
    height: auto;
    flex: 5;
`;

export const TableHeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${(props) => props.theme.marchMadness.borderColor.secondary};
    border-bottom: 0px;
    width: 100%;
`;

export const TableContainer = styled(TableHeaderContainer)<{ isEmpty: boolean }>`
    flex-direction: column;
    justify-content: flex-start;
    border: 2px solid ${(props) => props.theme.marchMadness.borderColor.secondary};
    ${(props) => (props.isEmpty ? 'min-height: 450px;' : '')}
`;

export const TableHeader = styled.span`
    color: #fff;
    text-align: center;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 33px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
`;

export const Arrow = styled.i`
    font-size: 14px;
    margin-left: 8px;
    text-transform: none;
    color: white;
    font-weight: 400;
`;

export const StickyRow = styled(TableRow)`
    width: 100%;
    height: 35px !important;
`;

export const StickyRowTopTable = styled(TableRow)`
    width: 100%;
`;

export const WalletAddress = styled.span`
    text-transform: lowercase;
`;

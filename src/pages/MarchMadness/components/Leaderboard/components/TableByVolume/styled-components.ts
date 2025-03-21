import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow, FlexDivStart } from 'styles/common';

export const OverlayContainer = styled.div`
    text-align: center;
    font-family: 'Oswald' !important;
    font-weight: 400;
    font-size: 12px;
`;

const TableRow = styled(FlexDivStart)<{ hideBorder?: boolean; topTen?: boolean; myScore?: boolean }>`
    height: auto;
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

export const TableRowCell = styled.div<{ width?: string; noTextTransform?: boolean }>`
    flex: 1;
    min-width: auto;
    ${(props) => (props.width ? `max-width: ${props.width};` : '')}
    padding: 10px 0px;
    color: ${(props) => props.theme.textColor.primary};
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
    &:last-child {
        padding-right: 18px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        text-align: center;
        white-space: nowrap;

        &:first-child {
            padding-left: 6px;
        }
        &:last-child {
            padding-right: 6px;
        }
    }

    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        &:last-child {
            padding-right: 0px;
        }
    }
`;

export const Container = styled(FlexDivColumnNative)`
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

export const TableHeader = styled.span`
    color: ${(props) => props.theme.textColor.primary};
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

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;

export const StickyRow = styled(TableRow)`
    width: 100%;
`;

export const StickyRowTopTable = styled(TableRow)`
    width: 100%;
`;

export const Owner = styled(FlexDivRow)`
    width: 350px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: auto;
    }
`;

export const WalletAddress = styled.span`
    text-transform: lowercase;
    white-space: nowrap;
    font-family: ${(props) => props.theme.fontFamily.primary};
`;

export const Champion = styled.span`
    text-transform: uppercase;
    white-space: nowrap;
    font-family: ${(props) => props.theme.fontFamily.primary};
`;

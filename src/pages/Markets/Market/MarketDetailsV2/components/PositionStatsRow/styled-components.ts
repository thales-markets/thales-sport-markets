import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const TicketRow = styled(FlexDivRowCentered)<{ highlighted?: boolean }>`
    border: ${(props) => (props.highlighted ? `1px solid ${props.theme.borderColor.senary}` : 'none ')};
    border-radius: 8px;
    height: 32px;
    padding: 0 10px;
    & > div {
        flex: 1;
    }
    &:last-child {
        margin-bottom: 10px;
    }
    @media (max-width: 767px) {
        border-radius: 5px;
        height: initial;
        margin-bottom: 6px;
        padding: 2px;
    }
`;

export const SelectionInfoContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    & > div {
        flex: 1;
    }
    @media (max-width: 575px) {
        flex-direction: column;
        align-items: start;
    }
`;

export const PositionInfo = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.quaternary};
    align-items: center;
    margin-right: 5px;
`;

export const PositionText = styled.span`
    text-align: start;
    min-width: 110px;
`;

export const Value = styled.span<{ color?: string }>`
    color: ${(props) => props.color || props.theme.textColor.primary};
    min-width: 150px;
    text-align: end;
    @media (max-width: 767px) {
        margin-left: 5px;
        min-width: 80px;
    }
    @media (max-width: 575px) {
        margin-left: 10px;
        min-width: 55px;
    }
`;

export const Header = styled(Value)<{ textAlign?: string; marginLeft?: string }>`
    text-align: ${(props) => props.textAlign || 'end'};
    color: ${(props) => props.theme.textColor.quinary};
    text-transform: uppercase;
    font-size: 10px;
    line-height: 10px;
    @media (max-width: 767px) {
        font-size: 10px;
        margin-left: ${(props) => props.marginLeft || '5px'};
    }
    @media (max-width: 575px) {
        font-size: 9px;
        margin-left: ${(props) => props.marginLeft || '10px'};
    }
`;

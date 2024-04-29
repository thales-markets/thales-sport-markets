import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';
import { Label } from '../../styled-components';

export const Container = styled(FlexDivColumnNative)`
    align-items: center;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    width: 100%;
    margin-bottom: 5px;
    @media (max-width: 768px) {
        padding: 7px 5px;
    }
`;

export const OverviewContainer = styled(FlexDivRow)`
    justify-content: space-between;
    background-color: ${(props) => props.theme.background.secondary};
    border-radius: 7px;
    padding: 10px 10px;
    width: 100%;
    max-height: 40px;
    align-items: center;
    cursor: pointer;
    position: relative;
    @media (max-width: 768px) {
        justify-content: space-between;
    }
`;

export const InfoContainer = styled(FlexDivRow)`
    border-radius: 7px;
    padding: 10px 10px;
    min-width: 120px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
    }
`;

export const TicketIdContainer = styled(FlexDivRow)`
    min-width: 150px;
    justify-content: flex-start;
    margin-right: 10px;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
    }
`;

export const InfoContainerColumn = styled(FlexDivColumnNative)`
    min-width: 120px;
    margin-left: 10px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
        margin-left: 0px;
    }
`;

export const TicketId = styled(Label)`
    text-transform: none;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const Value = styled(TicketId)`
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const WinLabel = styled(Label)`
    font-weight: 600;
    color: ${(props) => props.theme.status.win};
`;

export const WinValue = styled(WinLabel)``;

export const ArrowIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 10px;
    margin-left: 10px;
    @media (max-width: 768px) {
        margin-right: 5px;
        margin-left: 5px;
        font-size: 9px;
    }
`;

export const CollapsableContainer = styled(FlexDivColumnNative)<{ show?: boolean }>`
    width: 100%;
    max-height: ${(props) => (props?.show ? '100%' : '0')};
    overflow: hidden;
    align-items: center;
`;

export const Divider = styled.div`
    height: 1px;
    border: none;
    background-color: ${(props) => props.theme.background.tertiary};
    color: ${(props) => props.theme.textColor.secondary};
    width: 100%;
    margin-top: 8px;
    margin-bottom: 10px;
`;

export const ParlayDetailContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

export const CollapseFooterContainer = styled(FlexDivRow)`
    position: relative;
    justify-content: space-around;
    width: 100%;
    align-items: center;
    margin-bottom: 11px;
    margin-top: 11px;
`;

export const TotalQuoteContainer = styled(FlexDivRow)``;

export const ProfitContainer = styled(FlexDivRow)``;

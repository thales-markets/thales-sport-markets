import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivColumnNative)`
    align-items: center;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 4px;
    padding: 11px 10px;
    width: 100%;
    margin-bottom: 5px;
`;

export const OverviewContainer = styled(FlexDivRow)`
    justify-content: flex-start;
    width: 100%;
    align-items: center;
    height: 35px;
    cursor: pointer;
`;

export const InfoContainer = styled(FlexDivRow)`
    min-width: 150px;
    justify-content: flex-start;
`;

export const TicketIdContainer = styled(FlexDivRow)`
    min-width: 150px;
    justify-content: flex-start;
    margin-right: 20px;
`;

export const InfoContainerColumn = styled(FlexDivColumnNative)`
    min-width: 100px;
    justify-content: flex-start;
`;

export const Label = styled.span`
    font-weight: 400;
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    text-transform: uppercase;
    margin-right: 3px;
`;

export const TicketId = styled(Label)`
    text-transform: none;
`;

export const Value = styled(TicketId)``;

export const NumberOfGames = styled(Label)`
    font-weight: 700;
    text-transform: none;
`;

export const ClaimLabel = styled(Label)`
    font-weight: 900;
    color: ${MAIN_COLORS.TEXT.BLUE};
    text-transform: uppercase;
`;

export const ClaimValue = styled(ClaimLabel)`
    text-transform: none;
`;

export const WinLabel = styled(Label)`
    font-weight: 900;
    color: ${MAIN_COLORS.TEXT.POTENTIAL_PROFIT};
    text-transform: uppercase;
`;

export const WinValue = styled(WinLabel)`
    text-transform: none;
`;

export const ArrowIcon = styled.i<{ visibility?: boolean }>`
    visibility: ${(_props) => (_props?.visibility ? 'visible' : 'hidden')};
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-right: 10px;
    margin-left: 10px;
`;

export const ArrowIconFooter = styled.i`
    cursor: pointer;
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-right: 10px;
    position: absolute;
    left: 10px;
`;

export const CollapsableContainer = styled(FlexDivColumnNative)<{ show?: boolean }>`
    width: 100%;
    max-height: ${(_props) => (_props?.show ? '100%' : '0')};
    overflow: hidden;
    align-items: center;
`;

export const Divider = styled.div`
    height: 1px;
    border: none;
    background-color: ${MAIN_COLORS.DIVIDER_COLOR};
    color: ${MAIN_COLORS.DIVIDER_COLOR};
    width: 95%;
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
`;

export const TotalQuoteContainer = styled(FlexDivRow)``;

export const ProfitContainer = styled(FlexDivRow)``;

import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';
import Button from 'components/Button';

export const Container = styled(FlexDivColumnNative)`
    align-items: center;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 4px;
    padding: 12px 10px;
    width: 100%;
    margin-bottom: 5px;
    @media (max-width: 768px) {
        padding: 12px 5px;
    }
`;

export const OverviewContainer = styled(FlexDivRow)`
    justify-content: flex-start;
    width: 100%;
    align-items: center;
    height: 35px;
    cursor: pointer;
    position: relative;
    @media (max-width: 768px) {
        justify-content: space-between;
    }
`;

export const InfoContainer = styled(FlexDivRow)`
    min-width: 150px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
    }
`;

export const TicketIdContainer = styled(FlexDivRow)`
    min-width: 150px;
    justify-content: flex-start;
    margin-right: 20px;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
    }
`;

export const InfoContainerColumn = styled(FlexDivColumnNative)`
    min-width: 100px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
    }
`;

export const ClaimContainer = styled(FlexDivColumnNative)`
    min-width: 100px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        min-width: auto;
        flex-direction: column;
        align-items: flex-end;
    }
`;

export const Label = styled.span<{ canceled?: boolean }>`
    font-weight: 400;
    font-size: 12px;
    color: ${(props) => (props?.canceled ? `${MAIN_COLORS.TEXT.CANCELED}` : `${MAIN_COLORS.TEXT.WHITE}`)};
    text-transform: uppercase;
    margin-right: 3px;
    @media (max-width: 768px) {
        font-size: 10px;
        margin-bottom: 3px;
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

export const NumberOfGames = styled(Label)`
    font-weight: 700;
    text-transform: none;
`;

export const ClaimLabel = styled(Label)`
    font-weight: 900;
    color: ${MAIN_COLORS.TEXT.BLUE};
    text-transform: uppercase;
    @media (max-width: 768px) {
        font-size: 10px;
    }
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

export const ArrowIcon = styled.i`
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-right: 10px;
    margin-left: 10px;
    @media (max-width: 768px) {
        margin-right: 5px;
        margin-left: 5px;
        font-size: 9px;
    }
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
    max-height: ${(props) => (props?.show ? '100%' : '0')};
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
    margin-top: 11px;
`;

export const ExternalLinkContainer = styled.div`
    height: 20px;
    width: 20px;
    display: block;
    cursor: pointer;
    @media (max-width: 768px) {
        display: none;
    }
`;

export const ExternalLinkArrow = styled.i.attrs({ className: 'icon icon--arrow-external' })`
    font-size: 20px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    position: absolute;
    right: 15px;
    cursor: pointer;
`;

export const ExternalLink = styled.a``;

export const TotalQuoteContainer = styled(FlexDivRow)``;

export const ProfitContainer = styled(FlexDivRow)``;

export const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 5px;
    position: absolute;
    right: 10px;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
    @media (max-width: 768px) {
        position: initial;
        font-size: 9px;
        padding: 2px 5px;
        min-height: 12px;
    }
`;

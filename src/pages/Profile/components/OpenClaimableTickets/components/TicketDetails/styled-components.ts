import styled, { CSSProperties } from 'styled-components';
import { FlexDivColumnNative, FlexDivRow, FlexDivStart } from 'styles/common';

export const Container = styled(FlexDivColumnNative)`
    position: relative;
    font-weight: 600;
    font-size: 12px;
    align-items: center;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    width: 100%;
    margin-bottom: 7px;
    @media (max-width: 767px) {
        margin-bottom: 5px;
    }
`;

export const OverviewWrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;

export const OverviewContainer = styled(FlexDivRow)`
    justify-content: space-between;
    background-color: ${(props) => props.theme.background.secondary};
    border-radius: 0 7px 7px 0;
    padding: 10px 40px 10px 3px;
    width: 100%;
    max-height: 40px;
    align-items: center;
    cursor: pointer;
    position: relative;
    @media (max-width: 950px) {
        max-height: initial;
    }
    @media (max-width: 767px) {
        padding: 6px 30px 5px 0px;
    }
    position: relative;
`;

export const TicketInfo = styled(FlexDivStart)`
    @media (max-width: 767px) {
        margin-left: 3px;
        flex-direction: column;
    }
`;

export const ExternalLink = styled.a``;

export const TicketIdContainer = styled(FlexDivStart)`
    min-width: 150px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-left: 0px;
    margin-right: 10px;
    @media (max-width: 767px) {
        min-width: 130px;
        margin-right: 5px;
    }
`;

export const NumberOfGamesContainer = styled(FlexDivStart)`
    min-width: 100px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-right: 10px;
    @media (max-width: 767px) {
        min-width: 100px;
        margin-right: 5px;
    }
`;

export const InfoContainerColumn = styled(FlexDivColumnNative)`
    min-width: 100px;
    justify-content: flex-start;
    margin-right: 10px;
    @media (max-width: 767px) {{
        min-width: 85px;
        flex-direction: column;
        margin-left: 0px;
        margin-right: 5px;
    }
`;

export const LiveIndicatorContainer = styled(FlexDivStart)<{ isLive?: boolean }>`
    min-width: 12px;
    max-width: 12px;
    height: 100%;
    border-radius: 5px 0 0 5px;
    background: ${(props) => (props.isLive ? props.theme.status.live : props.theme.background.secondary)};
    padding-left: 2px;
    color: ${(props) => props.theme.textColor.secondary};
    align-items: center;
    justify-content: center;
    span {
        transform: rotate(270deg);
        color: ${(props) => props.theme.textColor.tertiary};
        font-size: 10px;
        margin-left: 3px;
        text-transform: uppercase;
        line-height: 10px;
        animation: blinker 1.5s step-start infinite;
        @keyframes blinker {
            50% {
                opacity: 0;
            }
        }
    }
    @media (max-width: 767px) {
        min-width: 8px;
        max-width: 8px;
        span {
            font-size: 8px;
            margin-left: 2px;
        }
    }
`;

export const Label = styled.span`
    margin-right: 3px;
    @media (max-width: 767px) {
        font-size: 10px;
        margin-bottom: 2px;
    }
`;

export const Value = styled(Label)``;

export const WinLabel = styled(Label)`
    color: ${(props) => props.theme.status.win};
`;

export const PayoutInLabel = styled(WinLabel)`
    @media (max-width: 767px) {
        margin-bottom: 0px;
    }
`;

export const WinValue = styled(WinLabel)``;

export const ArrowIcon = styled.i`
    position: absolute;
    right: 0px;
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: none;
    font-weight: 400;
    padding: 10px;
    @media (max-width: 767px) {
        font-size: 10px;
        padding: 8px;
    }
`;

export const CollapsableContainer = styled(FlexDivColumnNative)<{ show?: boolean }>`
    width: 100%;
    max-height: ${(props) => (props?.show ? '100%' : '0')};
    overflow: hidden;
    align-items: center;
`;

export const TicketMarketsContainer = styled(FlexDivColumnNative)`
    width: 100%;
    padding: 0 10px;
    @media (max-width: 767px) {
        padding: 0 0px;
    }
`;

export const CollapseFooterContainer = styled(FlexDivRow)`
    position: relative;
    justify-content: center;
    width: 100%;
    align-items: center;
    margin-bottom: 15px;
    margin-top: 15px;
`;

export const TotalQuoteContainer = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const CollateralSelectorContainer = styled(FlexDivRow)`
    margin-top: 5px;
`;

export const ClaimContainer = styled(FlexDivColumnNative)`
    min-width: 100px;
    align-items: end;
    justify-content: flex-end;
    button {
        margin-top: 2px;
        @media (max-width: 767px) {
            margin-top: 0px;
        }
    }
`;

export const additionalClaimButtonStyle: CSSProperties = {
    minWidth: '100px',
    maxWidth: '100px',
};

export const additionalClaimButtonStyleMobile: CSSProperties = {
    minWidth: '65px',
    maxWidth: '80px',
};

export const liveBlinkStyle: CSSProperties = {
    width: 25,
};

export const liveBlinkStyleMobile: CSSProperties = {
    width: 20,
};

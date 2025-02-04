import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const OddChangeUp = styled.span`
    position: absolute;
    bottom: 4px;
    left: -15px;
    visibility: hidden;
    margin-right: 5px;
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${(props) => props.theme.borderColor.tertiary};
    &.rise {
        visibility: visible;
        animation-name: rise;
        animation-duration: 0.8s;
        animation-iteration-count: 3;
    }
    @keyframes rise {
        0% {
            transform: scale(1) translateY(2px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(-3px);
            opacity: 0.5;
        }
    }
`;

export const OddChangeDown = styled.span`
    position: absolute;
    top: 5px;
    left: -15px;
    visibility: hidden;
    margin-right: 5px;
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${(props) => props.theme.borderColor.septenary};
    &.descend {
        visibility: visible;
        animation-name: descend;
        animation-duration: 0.8s;
        animation-iteration-count: 3;
    }
    @keyframes descend {
        0% {
            transform: scale(1) translateY(-3px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(2px);
            opacity: 0.5;
        }
    }
`;

export const LeftContainer = styled(FlexDivColumn)`
    flex: initial;
    height: 100%;
    justify-content: center;
`;

export const LiveTag = styled.span<{ readOnly?: boolean }>`
    background: ${(props) => props.theme.status.live};
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 3px;
    font-weight: 600;
    font-size: 10px;
    height: 12px;
    line-height: 11px;
    padding: ${(props) => (props.readOnly ? '0 10px' : '0 12px')};
    width: fit-content;
    margin-bottom: ${(props) => (props.readOnly ? '4px' : '5px')};
`;

export const SgpTag = styled.span<{ readOnly?: boolean }>`
    background: ${(props) => props.theme.status.sgp};
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 3px;
    font-weight: 600;
    font-size: 10px;
    height: 12px;
    line-height: 11px;
    padding: ${(props) => (props.readOnly ? '0 10px' : '0 12px')};
    width: fit-content;
    margin-bottom: ${(props) => (props.readOnly ? '4px' : '5px')};
`;

export const MarketPositionContainer = styled(FlexDivColumn)<{ readOnly?: boolean }>`
    display: block;
    width: 100%;
    font-size: ${(props) => (props.readOnly ? '11px' : '13px')};
    line-height: ${(props) => (props.readOnly ? '11px' : '13px')};
`;

export const MatchLabel = styled(FlexDivRow)<{ readOnly?: boolean; isLive?: boolean }>`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: ${(props) => (props.readOnly ? '4px' : '5px')};
    text-align: start;
    @media (max-width: 950px) {
        margin-bottom: ${(props) => (props.readOnly ? (props.isLive ? '4px' : '2px') : '5px')};
    }
`;

export const MarketTypeInfo = styled(FlexDivRow)<{ readOnly?: boolean; isLive?: boolean }>`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.quinary};
    margin-bottom: ${(props) => (props.readOnly ? '4px' : '5px')};
    @media (max-width: 950px) {
        margin-bottom: ${(props) => (props.readOnly ? (props.isLive ? '4px' : '2px') : '5px')};
    }
    text-align: start;
`;

export const PositionInfo = styled(FlexDivRow)`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const PositionText = styled.span`
    text-align: start;
`;

export const Odd = styled.span`
    position: relative;
    margin-left: 5px;
`;

export const CloseIcon = styled.i`
    font-size: 10px;
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    margin-left: 5px;
`;

const Icon = styled.i`
    font-size: 12px;
    position: absolute;
    top: 12px;
    right: 12px;
`;
export const Correct = styled(Icon)`
    color: ${(props) => props.theme.status.win};
`;
export const Wrong = styled(Icon)`
    color: ${(props) => props.theme.status.loss};
`;
export const Canceled = styled(Icon)`
    color: ${(props) => props.theme.textColor.primary};
`;
export const Empty = styled(Icon)`
    visibility: hidden;
`;

import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivRow)<{
    disabled: boolean;
    selected: boolean;
    isResolved?: boolean;
    isWinner: boolean;
    order?: string;
    isMainPageView?: boolean;
    isPlayerPropsMarket?: boolean;
    isQuickSgpMarket?: boolean;
    hide: boolean;
}>`
    display: ${(props) => (props.hide ? 'none' : 'flex')};
    position: relative;
    align-items: center;
    border-radius: 5px;
    padding: 0 8px;
    flex: 1 1 0;
    min-height: 25px;
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    background: ${(props) => (props.selected ? props.theme.background.quaternary : props.theme.background.secondary)};
    color: ${(props) => (props.selected ? props.theme.textColor.tertiary : props.theme.textColor.primary)};
    border: 1px solid
        ${(props) =>
            props.selected || props.isWinner ? props.theme.borderColor.quaternary : props.theme.borderColor.quinary};
    box-shadow: ${(props) => (props.isWinner ? props.theme.shadow.positionWinner : '')};
    opacity: ${(props) => (props.disabled && !props.isWinner ? '0.4' : '1')};
    cursor: ${(props) => (props.disabled ? '' : 'pointer')};
    :hover {
        border: ${(props) => (props.disabled ? undefined : `1px solid ${props.theme.borderColor.quaternary}`)};
    }
    order: ${(props) => props.order || 'initial'};
    @media (max-width: 950px) {
        flex-direction: ${(props) =>
            props.isMainPageView && !props.isPlayerPropsMarket && !props.isQuickSgpMarket ? 'column' : 'row'};
        align-items: ${(props) =>
            props.isMainPageView && !props.isPlayerPropsMarket && !props.isQuickSgpMarket ? 'flex-start' : 'center'};
        padding: ${(props) => (props.isMainPageView ? '2px 5px' : '0 5px')};
    }
`;

export const Text = styled.span<{ isColumnView?: boolean; maxWidth?: string }>`
    font-weight: 600;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    ${(props) => (props.maxWidth ? `max-width: ${props.maxWidth};` : props.isColumnView ? 'max-width: 200px;' : '')}
`;

export const Odd = styled.span<{
    selected: boolean;
    isMainPageView?: boolean;
}>`
    font-weight: 600;
    font-size: 13px;
    color: ${(props) => (props.selected ? props.theme.textColor.tertiary : props.theme.textColor.quaternary)};
    margin-left: 5px;
    @media (max-width: 950px) {
        font-size: 12px;
        text-align: ${(props) => (props.isMainPageView ? 'left' : 'right')};
        margin-left: ${(props) => (props.isMainPageView ? '0px' : '5px')};
    }
`;

export const Status = styled(Text)`
    text-align: end;
    width: fit-content;
    overflow: initial;
    @media (max-width: 575px) {
        font-size: 11px;
        margin-top: 1px;
    }
`;

export const SgpPositions = styled(FlexDivColumn)`
    gap: 2px;
`;

export const SgpPositionRow = styled(FlexDivRowCentered)`
    position: relative;
    padding: 2px 0;
    :not(:last-child) {
        :after {
            content: '';
            position: absolute;
            top: 12px;
            bottom: -6px;
            left: 6px;
            border-left: 1px dashed ${(props) => props.theme.textColor.quinary};
        }
    }
`;

export const SgpPositionMark = styled.span<{ isSelected: boolean }>`
    position: absolute;
    width: 13px;
    height: 13px;
    background-color: ${(props) =>
        props.isSelected ? props.theme.background.quaternary : props.theme.background.secondary};
    border: 1px solid ${(props) => props.theme.textColor.quinary};
    border-radius: 50%;
    flex-shrink: 0;
    z-index: 1;
`;

export const SgpPositionText = styled(Text)`
    margin-left: 20px;
    white-space: break-spaces;
`;

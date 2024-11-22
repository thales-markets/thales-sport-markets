import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivRow)<{
    disabled: boolean;
    selected: boolean;
    isResolved?: boolean;
    isWinner: boolean;
    order?: string;
    isMainPageView?: boolean;
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
        flex-direction: ${(props) => (props.isMainPageView ? 'column' : 'row')};
        align-items: ${(props) => (props.isMainPageView ? 'flex-start' : 'center')};
        padding: ${(props) => (props.isMainPageView ? '2px 5px' : '0 5px')};
    }
`;

export const Text = styled.span<{ isColumnView?: boolean }>`
    font-weight: 600;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    ${(props) => (props.isColumnView ? 'max-width: 200px;' : '')}
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

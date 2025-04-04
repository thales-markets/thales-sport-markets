import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

export const Wrapper = styled(FlexDivRowCentered)`
    width: 100%;
    justify-content: space-evenly;
    padding: 6px;
    border-radius: 5px;
`;

export const ItemWrapper = styled(FlexDivRowCentered)`
    cursor: pointer;
`;

export const Item = styled.div<{ selected: boolean }>`
    position: relative;
    margin-right: 6px;
    i {
        color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    }
`;

export const ItemLabel = styled.p<{ selected?: boolean }>`
    font-size: 12px;
    font-weight: 600;
    line-height: 110%;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    text-align: start;
    text-transform: uppercase;
    white-space: pre;
`;

export const Icon = styled.i`
    text-transform: none;
    font-weight: 400;
    font-size: 18px;
`;

export const ClaimableTicketsNotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    top: -6px;
    left: -8px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 14px;
    width: 14px;
    background-color: ${(props) => props.theme.background.quaternary};
    box-shadow: ${(props) => props.theme.shadow.notification};
`;

export const OpenTicketsNotificationCount = styled(ClaimableTicketsNotificationCount)`
    left: unset;
    right: -8px;
    background-color: ${(props) => props.theme.background.octonary};
    box-shadow: ${(props) => props.theme.shadow.notificationOpen};
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 10px;
`;

import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
    height: 48px;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.secondary};
    justify-content: space-around;
    align-items: center;
    z-index: 11;
`;

export const ItemWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    text-align: start;
    white-space: pre;
    padding: 0 10px;
    width: fit-content;
`;

export const ItemLabel = styled.p<{ selected?: boolean }>`
    font-size: 10px;
    font-weight: 600;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
    text-align: center;
`;

export const Item = styled.span`
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
`;

export const Icon = styled.i<{ selected?: boolean }>`
    font-size: 20px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

export const ClaimableTicketsNotificationCount = styled.div`
    display: flex;
    position: absolute;
    border-radius: 50%;
    top: -6px;
    left: 8px;
    align-items: center;
    text-align: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    background-color: ${(props) => props.theme.background.quaternary};
    box-shadow: ${(props) => props.theme.shadow.notification};
`;

export const OpenTicketsNotificationCount = styled(ClaimableTicketsNotificationCount)`
    left: unset;
    right: 8px;
    background-color: ${(props) => props.theme.background.octonary};
    box-shadow: ${(props) => props.theme.shadow.notificationOpen};
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 10px;
`;

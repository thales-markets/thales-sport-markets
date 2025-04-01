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
    @media (max-width: 767px) {
        padding: 0 10px;
        width: fit-content;
    }
`;

export const ItemLabel = styled.p<{ selected?: boolean }>`
    font-size: 10px;
    font-weight: 600;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

export const Item = styled.span`
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    @media (max-width: 767px) {
        font-size: 10px;
        white-space: nowrap;
    }
`;

export const Icon = styled.i<{ selected?: boolean }>`
    font-size: 20px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

export const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    top: -6px;
    right: -8px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 14px;
    width: 14px;
    background-color: ${(props) => props.theme.background.quaternary};
    box-shadow: ${(props) => props.theme.shadow.notification};
    @media (max-width: 767px) {
        height: 12px;
        width: 12px;
        right: 0;
        top: -4px;
    }
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 10px;
`;

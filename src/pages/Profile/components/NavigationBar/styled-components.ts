import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 5px;
`;

export const ItemWrapper = styled.div`
    position: relative;
    padding: 0 20px;
    text-align: start;
    @media (max-width: 767px) {
        padding: 0 10px;
        width: fit-content;
    }
`;

export const Item = styled.span<{ selected: boolean }>`
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    i {
        color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    }
    @media (max-width: 767px) {
        font-size: 10px;
        white-space: nowrap;
    }
`;

export const Icon = styled.i`
    text-transform: none;
    font-weight: 400;
    font-size: 18px;
    margin-right: 6px;
    margin-top: -2px;
`;

export const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    top: -6px;
    right: 4px;
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
        right: -2px;
        top: -4px;
    }
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 800;
    font-size: 10px;
    @media (max-width: 767px) {
        font-size: 9px;
    }
`;

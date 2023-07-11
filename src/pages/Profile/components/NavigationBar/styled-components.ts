import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 5px;
    margin: 10px 0px;
`;

export const ItemWrapper = styled.div`
    position: relative;
    padding: 0 20px;
    text-align: start;

    @media (max-width: 768px) {
        padding: 0 8px;
        max-width: 100px;
        width: min-content;
        :first-child {
            padding-left: 0;
        }
        :last-child {
            padding-right: 10px;
        }
    }
`;

export const Item = styled.span<{ selected: boolean }>`
    color: ${(props) => (props?.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
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
    @media (max-width: 768px) {
        right: -5px;
    }
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 800;
    font-size: 10px;
`;

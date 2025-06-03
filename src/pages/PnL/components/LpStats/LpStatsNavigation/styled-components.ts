import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 0px 6px 20px 6px;
    border-radius: 5px;
`;

export const ItemWrapper = styled.div`
    position: relative;
    padding: 0 40px;
    text-align: start;
    @media (max-width: 767px) {
        padding: 0px 10px;
        width: fit-content;
    }
`;

export const Item = styled.span<{ selected: boolean }>`
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    i {
        color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    }
`;

import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Container = styled(FlexDiv)`
    width: 100%;
    max-width: 806px;
    margin-top: 10px;
    align-items: center;
`;

export const BetTypesContainer = styled(FlexDiv)`
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    ::-webkit-scrollbar {
        display: none;
    }
`;

export const BetTypeButton = styled.button<{ selected?: boolean }>`
    width: 100%;
    border-radius: 5px;
    border: none;
    height: 30px;
    margin-right: 5px;
    cursor: pointer;
    white-space: nowrap;
    font-weight: bold;
    background: ${({ theme, selected }) =>
        selected ? theme.button.background.quaternary : theme.button.background.secondary};
    color: ${({ theme, selected }) => (selected ? theme.textColor.senary : theme.textColor.secondary)};
    :focus {
        outline: none;
    }
`;

export const ArrowIcon = styled.i<{ flip?: boolean }>`
    cursor: pointer;
    margin: 0 5px;
    font-size: 15px;
    transform: ${(props) => (props.flip ? 'rotate(180deg)' : 'none')};
    color: ${(props) => props.theme.textColor.secondary};
`;

export const ThreeWayIcon = styled.i`
    cursor: pointer;
    font-size: 20px;
    color: ${(props) => props.theme.textColor.secondary};
    margin: 0 5px;
`;

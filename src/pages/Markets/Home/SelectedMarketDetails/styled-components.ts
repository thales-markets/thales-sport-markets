import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)<{
    hideGame: boolean;
    isResolved: boolean;
}>`
    width: 100%;
    display: ${(props) => (props.hideGame ? 'none' : '')};
    border-radius: 8px;
    margin-top: 10px;
    padding: 10px;
    background-color: ${(props) => props.theme.oddsContainerBackground.secondary};
    height: fit-content;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

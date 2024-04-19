import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)<{
    hideGame: boolean;
    isResolved: boolean;
}>`
    position: relative;
    width: 100%;
    display: ${(props) => (props.hideGame ? 'none' : '')};
    border-radius: 8px;
    margin-top: 10px;
    padding: 20px 10px 10px 10px;
    background-color: ${(props) => props.theme.oddsContainerBackground.secondary};
    height: fit-content;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    height: 80vh;
    overflow: auto;
`;

export const CloseIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    top: 6px;
    right: 15px;
    margin-right: 2px;
    cursor: pointer;
`;

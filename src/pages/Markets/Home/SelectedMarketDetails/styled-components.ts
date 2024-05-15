import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)<{
    hideGame: boolean;
}>`
    position: relative;
    width: 100%;
    display: ${(props) => (props.hideGame ? 'none' : '')};
    padding: 10px 10px 10px 10px;
    height: fit-content;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    @media (max-width: 950px) {
        padding: 0px 5px 70px 5px;
    }
`;

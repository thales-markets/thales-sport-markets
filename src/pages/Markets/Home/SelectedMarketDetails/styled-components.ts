import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';

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
        padding: 0px 5px 100px 5px;
    }
`;

export const NoMarketsContainer = styled(FlexDivColumnCentered)`
    min-height: 200px;
    align-items: center;
    justify-content: start;
    margin-top: 100px;
    font-style: normal;
    font-weight: bold;
    font-size: 28px;
    line-height: 100%;
`;

export const NoMarketsLabel = styled.span`
    margin-bottom: 15px;
    text-align: center;
    font-size: 16px;
`;

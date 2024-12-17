import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const FilterTypeContainer = styled(FlexDivRowCentered)<{ isMobile?: boolean }>`
    justify-content: space-around;
    z-index: 1;
    @media (max-width: 950px) {
        margin-bottom: 70px;
    }
`;

export const TimeFilterContainer = styled(FlexDivRow)<{ selected: boolean }>`
    margin: 0px 10px;
    margin-top: 2px;
    cursor: pointer;
    div {
        background-color: ${(props) => (props.selected ? props.theme.christmasTheme.textColor.secondary : '')};
    }
    label {
        color: ${(props) => (props.selected ? props.theme.christmasTheme.textColor.secondary : '')};
        cursor: pointer;
    }
`;

export const Circle = styled.div<{ isMobile: boolean }>`
    height: 14px;
    width: 14px;
    background-color: ${(props) => props.theme.christmasTheme.background.primary};
    cursor: pointer;
    margin-right: 5px;
    border-radius: 50px;
    @media (max-width: 950px) {
        height: 20px;
        width: 20px;
        background-color: ${(props) => props.theme.textColor.septenary};
        margin-right: 10px;
    }
`;

export const Label = styled.label`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    @media (max-width: 950px) {
        line-height: 20px;
        color: ${(props) => props.theme.textColor.primary};
    }
`;

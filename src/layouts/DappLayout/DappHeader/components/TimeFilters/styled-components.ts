import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const FilterTypeContainer = styled(FlexDivRowCentered)<{ isMobile?: boolean }>`
    color: ${(props) => props.theme.textColor.secondary};
    justify-content: space-around;
    align-items: ${(props) => (props.isMobile ? 'flex-start' : 'center')};
    flex-direction: row;
    height: ${(props) => (props.isMobile ? '120px' : '')};
`;

export const TimeFilterContainer = styled(FlexDivRow)<{ selected: boolean; isMobile?: boolean }>`
    margin: 0px 10px;
    margin-top: 2px;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    & > div {
        background-color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    }
    &:hover {
        cursor: pointer;
        color: ${(props) => (!props.isMobile ? props.theme.textColor.quaternary : '')};
        & > div {
            cursor: pointer;
            color: ${(props) => (!props.isMobile ? props.theme.textColor.quaternary : '')};
        }
        & > label {
            cursor: pointer;
        }
    }
`;

export const Circle = styled.div<{ isMobile: boolean }>`
    height: ${(props) => (props.isMobile ? '23px' : '9px')};
    width: ${(props) => (props.isMobile ? '23px' : '9px')};
    border-radius: 50px;
    background-color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    margin-top: ${(props) => (props.isMobile ? '0px' : '2px')};
    margin-right: 3px;
`;

export const Label = styled.label`
    font-size: 14px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    white-space: nowrap;
    align-self: center;
`;

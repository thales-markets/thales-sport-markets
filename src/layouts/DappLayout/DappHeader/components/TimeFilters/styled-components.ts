import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const FilterTypeContainer = styled(FlexDiv)<{ isMobile?: boolean }>`
    padding: 10px;
    justify-content: space-around;
    flex-direction: column;
    gap: 8px;
`;

export const TimeFilterContainer = styled(FlexDiv)<{ selected: boolean }>`
    gap: 2px;
    align-items: center;
    cursor: pointer;
    div {
        background-color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    }
    label {
        color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
        cursor: pointer;
    }
`;

export const Circle = styled.div<{ isMobile: boolean }>`
    height: 14px;
    width: 14px;
    background-color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    border-radius: 50px;
`;

export const Label = styled.label`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.secondary};
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

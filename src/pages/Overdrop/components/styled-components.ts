import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

export const Circle = styled(FlexDivColumnCentered)<{ active: boolean; size?: string }>`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    background-color: ${(props) =>
        props?.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.background.quaternary};
    border-radius: 50%;
    width: ${(props) => (props.size ? props.size : '20px')};
    min-height: ${(props) => (props.size ? props.size : '20px')};
    font-size: 11px;
    font-weight: 900;
    justify-content: center;
    text-align: center;
    margin-right: 5px;
`;

export const OverdropIcon = styled.i`
    font-size: 13px;
    text-transform: none;
    font-weight: 300;
`;

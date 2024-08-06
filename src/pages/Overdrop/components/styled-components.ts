import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

export const Circle = styled(FlexDivColumnCentered)<{ active: boolean }>`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    background-color: ${(props) =>
        props?.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.background.quaternary};
    margin-right: 5px;
    border-radius: 50%;
    width: 20px;
    min-height: 20px;
    font-size: 11px;
    font-weight: 900;
    justify-content: center;
    text-align: center;
`;

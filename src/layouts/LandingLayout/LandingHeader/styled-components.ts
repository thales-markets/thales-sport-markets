import styled from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';

export const HeaderContainer = styled(FlexDivSpaceBetween)`
    z-index: 1;
    width: 100%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    span {
        cursor: pointer;
    }
`;

export const SplineContainer = styled.div`
    z-index: 0;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    display: none;
`;

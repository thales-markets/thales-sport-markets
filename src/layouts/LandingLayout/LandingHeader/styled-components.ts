import styled from 'styled-components';
import { FlexDivCentered, FlexDivSpaceBetween } from 'styles/common';

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
    left: 12.5%;
    top: 0;
    bottom: 0;
    right: 12.5%;
`;

export const NavLinks = styled(FlexDivCentered)`
    @media (max-width: 767px) {
        display: none;
    }
`;

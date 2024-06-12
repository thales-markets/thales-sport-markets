import { ReactComponent as LogoIcon } from 'assets/images/overtime-logo.svg';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES, { RESET_STATE } from 'constants/routes';
import React from 'react';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';

const Logo: React.FC = () => (
    <Container>
        <SPAAnchor href={buildHref(ROUTES.Markets.Home)} state={RESET_STATE}>
            <StyledLogo />
        </SPAAnchor>
    </Container>
);

const Container = styled.div`
    z-index: 1;
    @media (max-width: 767px) {
        margin-top: 10px;
        margin-bottom: 10px;
    }
`;

const StyledLogo = styled(LogoIcon)`
    fill: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    height: 35px;
`;

export default Logo;

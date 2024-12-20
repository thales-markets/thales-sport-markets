import LogoIcon from 'assets/images/xmas-overtime-logo.svg?react';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES, { RESET_STATE } from 'constants/routes';
import React from 'react';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';

type LogoParams = {
    width?: number;
};

const Logo: React.FC<LogoParams> = ({ width }) => (
    <Container>
        <SPAAnchor href={buildHref(ROUTES.Markets.Home)} state={RESET_STATE}>
            <StyledLogo width={width} />
        </SPAAnchor>
    </Container>
);

const Container = styled.div`
    z-index: 1;
    @media (max-width: 767px) {
        margin-top: 15px;
        margin-bottom: 10px;
    }
`;

const StyledLogo = styled(LogoIcon)`
    fill: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    height: 60px;
    @media (max-width: 400px) {
        width: 130px;
    }
    @media (max-width: 375px) {
        width: 115px;
    }
`;

export default Logo;

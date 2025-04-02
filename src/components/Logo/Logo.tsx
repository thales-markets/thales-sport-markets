import SPAAnchor from 'components/SPAAnchor';
import ROUTES, { RESET_STATE } from 'constants/routes';
import React from 'react';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';

const Logo: React.FC = () => (
    <Container>
        <SPAAnchor href={buildHref(ROUTES.Markets.Home)} state={RESET_STATE}>
            <LogoIcon className="icon icon--overtime" />
        </SPAAnchor>
    </Container>
);

const Container = styled.div`
    z-index: 1;
`;

const LogoIcon = styled.i`
    font-weight: 400;
    font-size: 220px;
    line-height: 37px;
    cursor: pointer;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 767px) {
        font-size: 170px;
    }

    @media (max-width: 420px) {
        font-size: 140px;
        line-height: 32px;
    }
`;

export default Logo;

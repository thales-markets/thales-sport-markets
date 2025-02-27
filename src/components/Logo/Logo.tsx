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
    @media (max-width: 767px) {
        margin-top: 15px;
        margin-bottom: 10px;
        width: 165px;
    }
    @media (max-width: 400px) {
        width: 135px;
    }
    @media (max-width: 375px) {
        width: 115px;
    }
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
    @media (max-width: 400px) {
        font-size: 140px;
    }
    @media (max-width: 375px) {
        font-size: 120px;
    }
`;

// const StyledLogo = styled(LogoIcon)`
//     fill: ${(props) => props.theme.textColor.primary};
//     cursor: pointer;
//     height: 35px;
//     @media (max-width: 400px) {
//         width: 130px;
//     }
//     @media (max-width: 375px) {
//         width: 115px;
//     }
// `;

export default Logo;

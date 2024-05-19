import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    margin-top: 15px;
    @media (max-width: 767px) {
        margin-top: 20px;
    }
`;

export const NavigationWrapper = styled(FlexDivRow)`
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

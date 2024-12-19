import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    margin-top: 15px;
    justify-content: start;
    @media (max-width: 767px) {
        margin-top: 20px;
    }
`;

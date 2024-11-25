import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    margin-top: 30px;
    justify-content: start;
    max-width: 1080px;
    @media (max-width: 767px) {
        margin-top: 20px;
    }
`;

export const Title = styled.span`
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 20px;
    @media (max-width: 767px) {
        font-size: 15px;
        margin-bottom: 15px;
    }
`;

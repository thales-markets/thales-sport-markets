import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    min-width: 600px;
    @media (max-width: 768px) {
        width: 100%;
        min-width: auto;
    }
`;

export const NavigationWrapper = styled(FlexDivRow)`
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

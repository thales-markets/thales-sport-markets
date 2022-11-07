import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    min-width: 600px;
    @media (max-width: 768px) {
        width: 100%;
        min-width: auto;
    }
`;

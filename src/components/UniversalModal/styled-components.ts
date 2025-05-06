import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const FormContainer = styled(FlexDiv)`
    flex-direction: column;
    flex: 6;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

export const InputContainer = styled(FlexDiv)`
    position: relative;
    width: 100%;
    margin-bottom: 10px;
`;

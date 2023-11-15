import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Wrapper = styled(FlexDiv)`
    align-items: flex-start;
    flex-direction: row;
    width: 100%;
    @media (max-width: 575px) {
        flex-wrap: wrap-reverse;
    }
`;

export const FormContainer = styled(FlexDiv)`
    flex-direction: column;
    width: 60%;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

export const BalanceSection = styled(FlexDiv)`
    flex-direction: column;
    width: 40%;
    padding: 0 20px;
    @media (max-width: 575px) {
        padding: 0;
        width: 100%;
    }
`;

export const PrimaryHeading = styled.h1`
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 20px;
    margin-bottom: 21px;
`;

export const InputLabel = styled.span<{ marginTop?: string }>`
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    margin-top: ${(props) => (props.marginTop ? props.marginTop : '')};
    margin-bottom: 5px;
`;

export const InputContainer = styled(FlexDiv)`
    position: relative;
    margin-right: 10px;
    width: 100%;
`;

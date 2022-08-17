import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 60%;
    position: relative;
    align-items: center;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

export const QuizContainer = styled(FlexDivColumn)`
    margin-top: 20px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.35);
    border-radius: 25px;
    width: 100%;
    padding: 20px 50px 20px 50px;
    background: ${(props) => props.theme.background.secondary};
    flex: initial;
    @media (max-width: 768px) {
        padding: 0px 20px 0px 20px;
    }
`;

export const Header = styled(FlexDivRow)`
    @media (max-width: 575px) {
        flex-direction: column;
    }
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    margin-top: 20px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 40px;
`;

export const Description = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    margin-bottom: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const Question = styled(Description)`
    font-size: 20px;
    font-weight: 600;
    font-style: italic;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

export const FinishedInfoContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-top: 20px;
`;

export const FinishedInfoLabel = styled(Description)`
    font-size: 25px;
    font-weight: 600;
`;

export const FinishedInfo = styled(Description)`
    font-size: 23px;
`;

export const SubmitButton = styled.button`
    background: #5fc694;
    border-radius: 5px;
    margin: 20px 20px;
    font-size: 20px;
    line-height: 23px;
    color: #303656;
    width: 200px;
    border: none;
    padding: 7px;
    cursor: pointer;
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

export const ButtonContainer = styled(FlexDivCentered)`
    @media (max-width: 575px) {
        flex-direction: column;
        button {
            margin: 10px 10px;
            :last-child {
                margin-bottom: 20px;
            }
        }
    }
`;

export const Input = styled.input`
    background: ${(props) => props.theme.input.background.primary};
    border-radius: 5px;
    border: 2px solid ${(props) => props.theme.borderColor.tertiary};
    color: ${(props) => props.theme.input.textColor.primary};
    width: 300px;
    height: 34px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 18px;
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
    &:focus {
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    }
`;

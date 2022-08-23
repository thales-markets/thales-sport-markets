import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivEnd,
    FlexDivStart,
} from 'styles/common';

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

export const TimeRemainingText = styled(Description)`
    margin-top: 30px;
    margin-bottom: 10px;
`;

export const TimeRemainingGraphicContainer = styled(FlexDivStart)`
    position: relative;
    width: 565px;
    height: 14px;
    background: #303656;
    border-radius: 15px;
    margin-bottom: 10px;
    @media (max-width: 767px) {
        width: 400px;
    }
    @media (max-width: 575px) {
        width: 300px;
    }
`;

export const TimeRemainingGraphicPercentage = styled(FlexDivStart)<{ width: number }>`
    position: absolute;
    width: ${(props) => props.width}%;
    max-width: 565px;
    height: 10px;
    left: 2px;
    top: 2px;
    background: linear-gradient(270deg, #3fd1ff 16.01%, #15bba7 89.24%);
    border-radius: 15px;
    @media (max-width: 767px) {
        max-width: 400px;
    }
    @media (max-width: 575px) {
        max-width: 300px;
    }
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
    background: linear-gradient(88.84deg, #5fc694 19.98%, #1ca6b9 117.56%);
    border-radius: 40px;
    margin: 20px 20px;
    font-size: 20px;
    font-weight: 700;
    line-height: 23px;
    color: #1a1c2b;
    width: 252px;
    border: none;
    padding: 7px;
    cursor: pointer;
    text-transform: uppercase;
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

export const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const QuestionWeightContainer = styled(FlexDivEnd)`
    @media (max-width: 575px) {
        margin-top: 10px;
        justify-content: start;
    }
`;

export const TwitterTableContainer = styled(FlexDivStart)`
    align-items: center;
`;

export const TwitterImage = styled.img`
    border-radius: 50%;
    height: 24px;
    width: 24px;
    color: #ffffff;
    margin-right: 6px;
`;

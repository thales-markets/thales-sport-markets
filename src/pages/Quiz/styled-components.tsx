import { TablePagination, Tooltip, withStyles } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivStart,
    QuizQuestionDifficultyMap,
    FlexDivRow,
} from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

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
    border-radius: 20px;
    width: 100%;
    padding: 20px 50px 20px 50px;
    background: ${(props) => props.theme.background.secondary};
    flex: initial;
    @media (max-width: 768px) {
        padding: 0px 20px 0px 20px;
        border-radius: 20px;
    }
    align-items: center;
    position: relative;
`;

export const QuizFirstNextContainer = styled(FlexDivColumn)`
    width: 95%;
    background: #252940;
    border-radius: 0 0 30px 30px;
    min-height: 25px;
    max-height: 25px;
    @media (max-width: 768px) {
        width: 90%;
        border-radius: 0 0 20px 20px;
    }
`;

export const QuizSecondNextContainer = styled(FlexDivColumn)`
    width: 90%;
    background: #1e2134;
    border-radius: 0 0 30px 30px;
    min-height: 25px;
    max-height: 25px;
    @media (max-width: 768px) {
        width: 80%;
        border-radius: 0 0 20px 20px;
    }
`;

export const LeaderboardContainer = styled(FlexDivColumn)`
    margin-top: 20px;
    flex: initial;
    width: 100%;
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

export const LeaderboardTitleContainer = styled(FlexDivStart)`
    align-items: center;
    font-size: 25px;
    line-height: 100%;
    margin-top: 20px;
    margin-bottom: 40px;
    justify-content: center;
`;

export const Description = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const Copy = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 15px;
    color: ${(props) => props.theme.textColor.primary};
    p {
        margin-bottom: 10px;
    }
    a {
        cursor: pointer;
        color: #91bced;
        &:hover {
            color: #00f9ff;
        }
    }
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
    transition: width 1s linear;
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
    font-weight: 700;
    font-size: 22px;
    line-height: 30px;
    margin-top: 55px;
    margin-bottom: 30px;
    text-align: center;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

export const FinishedInfoContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-top: 20px;
    text-align: center;
    margin-bottom: 40px;
`;

export const FinishedInfoLabel = styled(Description)`
    font-size: 25px;
`;

export const FinishedInfo = styled(Description)`
    font-size: 25px;
    font-weight: 600;
    margin-top: 30px;
`;

export const FinishedInfoMessagesContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    text-align: center;
    margin-bottom: 20px;
`;

export const FinishedInfoMessage = styled(Description)`
    margin-bottom: 0px;
    line-height: 22px;
`;

export const SubmitButton = styled.button<{ isNavigation?: boolean }>`
    background: ${(props) =>
        props.isNavigation
            ? 'linear-gradient(88.84deg, #5fc694 19.98%, #1ca6b9 117.56%)'
            : 'linear-gradient(88.84deg, #2FC9DD 19.98%, #1CA6B9 117.56%);'};
    border-radius: 8px;
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
        cursor: default;
    }
`;

export const ButtonContainer = styled(FlexDivCentered)<{ mobileDirection?: string }>`
    @media (max-width: 675px) {
        flex-direction: ${(props) => props.mobileDirection || 'column'};
        button {
            margin: 10px 10px;
            :first-child {
                margin-bottom: ${(props) => (props.mobileDirection ? '20px' : '10px')};
            }
            :last-child {
                margin-bottom: ${(props) => (props.mobileDirection ? '10px' : '20px')};
            }
        }
    }
`;

export const InputContainer = styled(FlexDivColumnCentered)`
    margin-top: 5px;
    margin-bottom: 10px;
`;

export const InputLabel = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    margin-bottom: 6px;
    color: ${(props) => props.theme.textColor.primary};
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

export const TwitterContainer = styled(FlexDivStart)`
    align-items: center;
`;

export const TwitterImage = styled.img`
    border-radius: 50%;
    height: 30px;
    width: 30px;
    color: #ffffff;
    margin-right: 6px;
    @media (max-width: 767px) {
        height: 25px;
        width: 25px;
    }
    @media (max-width: 512px) {
        height: 20px;
        width: 20px;
    }
`;

export const OptionsContainer = styled(FlexDivColumnCentered)`
    align-items: center;
`;

export const CurrentQuestion = styled(Description)`
    margin-top: 30px;
    margin-bottom: 0px;
`;

export const QuestionIndicatorContainer = styled(FlexDivStart)`
    flex-wrap: wrap;
    justify-content: center;
`;

export const QuestionIndicator = styled(FlexDivCentered)<{ isPassed: boolean }>`
    border-radius: 50%;
    background: ${(props) => (props.isPassed ? '#2fc9dd' : '#303656')};
    width: 24px;
    height: 24px;
    :not(:last-child) {
        margin-right: 25px;
    }
    margin-top: 10px;
    @media (max-width: 575px) {
        width: 18px;
        height: 18px;
        :not(:last-child) {
            margin-right: 15px;
        }
    }
`;

export const Footer = styled(FlexDivColumn)`
    margin-top: 20px;
    align-items: center;
`;

export const ValidationTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        width: '300px',
        marginBottom: '7px',
        backgroundColor: '#303656',
        color: '#E26A78',
        border: '1.5px solid #E26A78',
        borderRadius: '2px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    arrow: {
        '&:before': {
            border: '1.5px solid #E26A78',
            backgroundColor: '#303656',
            boxSizing: 'border-box',
        },
        width: '13px',
        height: '10px',
        bottom: '-2px !important',
    },
}))(Tooltip);

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 298px;
    width: 100%;
`;

export const PaginationWrapper = styled(TablePagination)`
    border: none !important;
    display: flex;
    width: 100%;
    height: auto;
    color: #f6f6fe !important;
    .MuiToolbar-root {
        padding: 0;
        display: flex;
        .MuiSelect-icon {
            color: #f6f6fe;
        }
    }
    .MuiIconButton-root.Mui-disabled {
        color: #5f6180;
    }
    .MuiTablePagination-toolbar > .MuiTablePagination-caption:last-of-type {
        display: block;
    }
    .MuiTablePagination-input {
        margin-top: 2px;
    }
    .MuiTablePagination-selectRoot {
        @media (max-width: 767px) {
            margin-left: 0px;
            margin-right: 0px;
        }
    }
`;

export const TextLink = styled.a`
    color: #91bced;
    &:hover {
        color: #00f9ff;
    }
`;

export const QuizLink: React.FC<{ href: string }> = ({ children, href }) => {
    return (
        <TextLink target="_blank" rel="noreferrer" href={href}>
            {children}
        </TextLink>
    );
};

export const LeaderboardIcon = styled.i`
    font-size: 30px;
    margin-right: 15px;
    &:before {
        font-family: OvertimeIcons !important;
        content: '\\0053';
    }
`;

export const DifficultyContainer = styled(FlexDivStart)`
    align-items: center;
    position: absolute;
    top: 37px;
    right: 50px;
    @media (max-width: 768px) {
        margin-top: 12px;
        position: relative;
        top: auto;
        right: auto;
    }
`;

export const DifficultyLabel = styled(Description)`
    margin-bottom: 0px;
    margin-right: 4px;
`;

export const DifficultyInfo = styled(Description)<{ difficulty: number }>`
    margin-bottom: 0px;
    font-weight: 600;
    color: ${(props) => QuizQuestionDifficultyMap[props.difficulty - 1]};
`;

export const SelectContainer = styled.div`
    margin-left: 1px;
    width: 230px;
`;

export const LeaderboardHeader = styled(FlexDivRow)`
    align-items: center;
    margin-bottom: 10px;
    @media screen and (max-width: 767px) {
        flex-direction: column;
    }
`;

export const OvertimeVoucherIcon = styled.img`
    width: 18px;
    margin-right: 4px;
    margin-bottom: 2px;
`;

export const PeriodContainer = styled(FlexDivStart)`
    align-items: center;
    @media screen and (max-width: 767px) {
        flex-direction: column;
        margin-bottom: 10px;
    }
`;

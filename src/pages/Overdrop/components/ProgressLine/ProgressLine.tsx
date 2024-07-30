import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';

type ProgressLineProps = {
    progress: number;
    currentPoints: number;
    nextLevelPoints: number;
    level: number;
};

const ProgressLine: React.FC<ProgressLineProps> = ({ progress, currentPoints, nextLevelPoints, level }) => {
    return (
        <Wrapper>
            <ProgressLineWrapper>
                <Progress progress={progress}>
                    <DetailedPoints>{`${currentPoints} XP / ${nextLevelPoints} XP`}</DetailedPoints>
                </Progress>
            </ProgressLineWrapper>
            <LevelWrapper>
                <Label>{'Level'}</Label>
                <Level>{level}</Level>
            </LevelWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    align-items: center;
`;

const LevelWrapper = styled(FlexDivColumn)`
    align-items: center;
`;

const Label = styled.span`
    font-size: 17.252px;
    font-weight: 500;
    line-height: 80%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const Level = styled(Label)`
    font-size: 32.347px;
    font-weight: 800;
    margin-top: 7px;
`;

const ProgressLineWrapper = styled(FlexDiv)`
    margin-left: 10px;
    width: 80%;
    border-radius: 28.753px;
    background-color: ${(props) => props.theme.background.senary};
    height: 26.666px;
`;

const Progress = styled(FlexDiv)<{ progress: number }>`
    width: ${(props) => props.progress}%;
    height: 100%;
    align-items: center;
    background-color: ${(props) => props.theme.overdrop.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.secondary};
    font-size: 12.46px;
    border-radius: 28.753px;
    font-weight: 900;
    text-transform: uppercase;
    text-align: right !important;
`;

const DetailedPoints = styled.span`
    width: 100%;
    text-align: right;
    margin-right: 10px;
`;

export default ProgressLine;

import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';

type ProgressLineProps = {
    progress: number;
    currentPoints: number;
    nextLevelPoints: number;
    level: number;
    hideLevelLabel?: boolean;
};

const ProgressLine: React.FC<ProgressLineProps> = ({
    progress,
    currentPoints,
    nextLevelPoints,
    level,
    hideLevelLabel,
}) => {
    return (
        <Wrapper>
            <ProgressLineWrapper levelLabelHidden={hideLevelLabel}>
                <Progress progress={progress}>
                    <DetailedPoints>{`${currentPoints} XP / ${nextLevelPoints} XP`}</DetailedPoints>
                </Progress>
            </ProgressLineWrapper>
            {!hideLevelLabel && (
                <LevelWrapper>
                    <Label>{'Level'}</Label>
                    <Level>{level}</Level>
                </LevelWrapper>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    align-items: center;
    @media (max-width: 767px) {
        margin-top: 10px;
    }
`;

const LevelWrapper = styled(FlexDivColumn)`
    align-items: center;
`;

const Label = styled.span`
    font-size: 17px;
    font-weight: 500;
    line-height: 80%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 767px) {
        font-size: 12px;
    }
`;

const Level = styled(Label)`
    font-size: 32px;
    font-weight: 800;
    margin-top: 7px;
    @media (max-width: 767px) {
        font-size: 20px;
    }
`;

const ProgressLineWrapper = styled(FlexDiv)<{ levelLabelHidden?: boolean }>`
    margin-left: 10px;
    border-radius: 28px;
    background-color: ${(props) => props.theme.background.senary};
    @media (max-width: 767px) {
        width: 100%;
        height: 13px;
    }
    width: ${(props) => (props.levelLabelHidden ? '100%' : '80%')};
    background-color: ${(props) => props.theme.background.senary};
    height: ${(props) => (props.levelLabelHidden ? '18px' : '26px')};
`;

const Progress = styled(FlexDiv)<{ progress: number }>`
    width: ${(props) => props.progress}%;
    height: 100%;
    align-items: center;
    background-color: ${(props) => props.theme.overdrop.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.secondary};
    font-size: 12px;
    border-radius: 28px;
    font-weight: 900;
    text-transform: uppercase;
    text-align: right !important;
    @media (max-width: 767px) {
        font-size: 8px;
    }
`;

const DetailedPoints = styled.span`
    width: 100%;
    text-align: right;
    margin-right: 10px;
`;

export default ProgressLine;

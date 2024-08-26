import Progress from 'components/Progress';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatPoints } from 'utils/overdrop';

type ProgressLineProps = {
    progress: number;
    currentPoints: number;
    currentLevelMinimum: number;
    nextLevelMinimumPoints: number;
    level: number;
    progressUpdate?: number;
    hideLevelLabel?: boolean;
    height?: string;
};

const ProgressLine: React.FC<ProgressLineProps> = ({
    progress,
    progressUpdate,
    currentPoints,
    nextLevelMinimumPoints,
    level,
    hideLevelLabel,
    height,
}) => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <ProgressContainer>
                <ProgressLineWrapper height={height} levelLabelHidden={hideLevelLabel}>
                    <Progress
                        progressUpdate={progressUpdate}
                        progress={progress}
                        textBelow={`${formatPoints(currentPoints)} / ${formatPoints(nextLevelMinimumPoints)}`}
                    />
                    <DetailedPoints progress={Math.min(progress, 100)}></DetailedPoints>
                </ProgressLineWrapper>
            </ProgressContainer>

            {!hideLevelLabel && (
                <LevelWrapper>
                    <Label>{t('overdrop.overdrop-home.level')}</Label>
                    <Level>{level}</Level>
                </LevelWrapper>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    align-items: center;
    width: 100%;
    @media (max-width: 767px) {
        margin-top: 10px;
    }
`;

const LevelWrapper = styled(FlexDivColumn)`
    align-items: center;
    max-width: 20%;
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

const ProgressContainer = styled(FlexDivColumn)`
    width: 100%;
`;

const ProgressLineWrapper = styled(FlexDiv)<{ levelLabelHidden?: boolean; height?: string }>`
    border-radius: 28px;
    background-color: ${(props) => props.theme.background.senary};
    min-width: 100%;
    @media (max-width: 767px) {
        width: 100%;
        height: 13px;
    }
    width: ${(props) => (props.levelLabelHidden ? '100%' : '80%')};
    background-color: ${(props) => props.theme.background.senary};
    height: ${(props) => props.height ?? '12px'};
    @media (max-width: 767px) {
        margin-left: 0px;
    }
`;

const DetailedPoints = styled.span<{ progress: number }>`
    font-size: ${(props) => (props.progress < 13 ? 7 : props.progress < 20 ? 10 : 12)}px;
    width: 100%;
    text-align: right;
    margin-right: 10px;
`;

export default ProgressLine;

import Progress from 'components/Progress';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrency } from 'thales-utils';
import { formatPoints } from 'utils/overdrop';

type ProgressLineProps = {
    progress: number;
    currentPoints: number;
    nextLevelMinimumPoints: number;
    level: number;
    progressUpdate?: number;
    hideLevelLabel?: boolean;
    showNumbersOnly?: boolean;
};

const ProgressLine: React.FC<ProgressLineProps> = ({
    progress,
    progressUpdate,
    currentPoints,
    nextLevelMinimumPoints,
    level,
    hideLevelLabel,
    showNumbersOnly,
}) => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <ProgressContainer>
                <ProgressLineWrapper levelLabelHidden={hideLevelLabel}>
                    {!!progressUpdate && <ProgressUpdate progress={Math.min(progress + progressUpdate, 100)} />}
                    <Progress
                        progress={progress}
                        textBelow={`${
                            showNumbersOnly
                                ? formatCurrency(currentPoints, undefined, true)
                                : formatPoints(currentPoints)
                        } / ${
                            showNumbersOnly
                                ? formatCurrency(nextLevelMinimumPoints, undefined, true)
                                : formatPoints(nextLevelMinimumPoints)
                        }`}
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

const ProgressLineWrapper = styled(FlexDiv)<{ levelLabelHidden?: boolean }>`
    margin-left: 10px;
    border-radius: 28px;
    background-color: ${(props) => props.theme.background.senary};
    min-width: 100%;
    @media (max-width: 767px) {
        width: 100%;
        height: 13px;
    }
    width: ${(props) => (props.levelLabelHidden ? '100%' : '80%')};
    background-color: ${(props) => props.theme.background.senary};
    height: ${(props) => (props.levelLabelHidden ? '18px' : '26px')};
`;

const ProgressUpdate = styled(FlexDiv)<{ progress: number }>`
    z-index: 0;
    position: absolute;
    width: ${(props) => props.progress}%;
    height: 100%;
    align-items: center;
    background-color: ${(props) => props.theme.overdrop.textColor.senary};
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

const DetailedPoints = styled.span<{ progress: number }>`
    font-size: ${(props) => (props.progress < 13 ? 7 : props.progress < 20 ? 10 : 12)}px;
    width: 100%;
    text-align: right;
    margin-right: 10px;
`;

export default ProgressLine;

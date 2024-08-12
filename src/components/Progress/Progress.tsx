import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';

type ProgressProps = {
    progress: number;
    width?: string;
    height?: string;
    backgroundColor?: string;
    progressLineColor?: string;
    textBelow?: string;
};

const Progress: React.FC<ProgressProps> = ({
    progress,
    width,
    height,
    backgroundColor,
    progressLineColor,
    textBelow,
}) => {
    return (
        <Wrapper>
            <ProgressLineWrapper backgroundColor={backgroundColor} width={width} height={height}>
                <ProgressLine progress={progress} color={progressLineColor} height={height} />
            </ProgressLineWrapper>
            <TextBelow>{textBelow}</TextBelow>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    min-width: 100%;
    min-height: auto;
`;

const ProgressLineWrapper = styled(FlexDiv)<{ backgroundColor?: string; height?: string; width?: string }>`
    border-radius: 28px;
    height: ${(props) => (props.height ? props.height : '27px')};
    min-width: ${(props) => (props.width ? props.width : '100%')};
    background-color: ${(props) => (props.backgroundColor ? props.backgroundColor : props.theme.background.senary)};
    align-items: center;
`;

const ProgressLine = styled(FlexDivRow)<{ progress: number; color?: string; height?: string }>`
    border-radius: 28px;
    min-width: ${(props) => `${props.progress}%`};
    height: ${(props) => (props.height ? props.height : '27px')};
    background-color: ${(props) => (props.color ? props.color : props.theme.overdrop.background.progressBar)};
`;

const TextBelow = styled(FlexDiv)`
    min-width: 100%;
    text-align: center;
    font-size: 12px;
    margin-top: 5px;
    font-weight: 900;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
`;

export default Progress;

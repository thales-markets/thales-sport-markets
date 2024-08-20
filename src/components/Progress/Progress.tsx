import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';

type ProgressProps = {
    progress: number;
    progressUpdate?: number;
    width?: string;
    height?: string;
    backgroundColor?: string;
    progressLineColor?: string;
    textBelow?: string;
};

const Progress: React.FC<ProgressProps> = ({
    progress,
    progressUpdate,
    width,
    height,
    backgroundColor,
    progressLineColor,
    textBelow,
}) => {
    return (
        <Wrapper>
            <ProgressLineWrapper backgroundColor={backgroundColor} width={width} height={height}>
                {!!progressUpdate && <ProgressUpdate progress={Math.min(progress + progressUpdate, 100)} />}
                <ProgressLine progress={isNaN(progress) ? 0 : progress} color={progressLineColor} height={height} />
                <TextBelow>{textBelow}</TextBelow>
            </ProgressLineWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    position: relative;
    min-width: 100%;
    min-height: auto;
`;

const ProgressLineWrapper = styled(FlexDiv)<{ backgroundColor?: string; height?: string; width?: string }>`
    position: relative;
    border-radius: 28px;
    height: ${(props) => (props.height ? props.height : '100%')};
    min-width: ${(props) => (props.width ? props.width : '100%')};
    background-color: ${(props) =>
        props.backgroundColor ? props.backgroundColor : props.theme.overdrop.textColor.tertiary};
    align-items: center;
`;

const ProgressLine = styled(FlexDivRow)<{ progress: number; color?: string; height?: string }>`
    z-index: 1;
    border-radius: 28px;
    min-width: ${(props) => `${props.progress > 3 || props.progress == 0 ? props.progress : 2}%`};
    height: ${(props) => (props.height ? props.height : '100%')};
    background-color: ${(props) => (props.color ? props.color : props.theme.overdrop.background.progressBar)};
    box-shadow: ${(props) => (props.progress > 0 ? '0px 0px 10px 1px #ff4307' : '')};
`;

const TextBelow = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    min-width: 100%;
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.secondary};

    z-index: 10;
    @media (max-width: 767px) {
        font-size: 9px;
    }
`;

const ProgressUpdate = styled(FlexDiv)<{ progress: number }>`
    box-shadow: 0px 0px 10px 1px ${(props) => props.theme.overdrop.textColor.senary};
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

export default Progress;

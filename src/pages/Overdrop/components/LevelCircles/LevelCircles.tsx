import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { Circle } from '../styled-components';

type LevelCirclesTypes = {
    levels: number[];
    currentLevel: number;
    additionalLabelsForLevels?: string[];
    displayLevelNumberInsideCircle?: boolean;
    displayAdditionalLabelsBelow?: boolean;
    customCircleSize?: string;
    customGap?: string;
    additionalStyles?: CSSProperties;
};

const LevelCircles: React.FC<LevelCirclesTypes> = ({
    levels,
    currentLevel,
    additionalLabelsForLevels,
    displayLevelNumberInsideCircle,
    displayAdditionalLabelsBelow,
    customCircleSize,
    customGap,
    additionalStyles,
}) => {
    return (
        <Wrapper customGap={customGap} style={additionalStyles}>
            {levels.map((item, index) => {
                return (
                    <LevelWrapper key={index}>
                        {!!additionalLabelsForLevels &&
                            !displayAdditionalLabelsBelow &&
                            !!additionalLabelsForLevels[index] && (
                                <LabelAbove>{additionalLabelsForLevels[index]}</LabelAbove>
                            )}
                        <Circle size={customCircleSize} active={item <= currentLevel}>
                            {displayLevelNumberInsideCircle ? item : ''}
                        </Circle>
                        <LabelBelow active={item <= currentLevel}>
                            {!displayLevelNumberInsideCircle ? item : ''}
                            {!!additionalLabelsForLevels &&
                                displayAdditionalLabelsBelow &&
                                !!additionalLabelsForLevels[index] && (
                                    <LabelAbove>{additionalLabelsForLevels[index]}</LabelAbove>
                                )}
                        </LabelBelow>
                    </LevelWrapper>
                );
            })}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRowCentered)<{ customGap?: string }>`
    justify-content: center;
    gap: ${(props) => (props.customGap ? props.customGap : '8px')};
    flex-wrap: wrap;
`;

const LevelWrapper = styled(FlexDivColumnCentered)`
    position: relative;
    margin: 5px 0px;
    align-items: center;
    max-width: 23px;
`;

const LabelAbove = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 11px;
    font-weight: 700;
    font-style: normal;
    text-align: center;
`;

const LabelBelow = styled.span<{ active: boolean }>`
    color: ${(props) =>
        props.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.background.quaternary};
    font-size: 9px;
    margin-top: 3px;
    font-style: normal;
    font-weight: 800;
    text-align: center;
`;

export default LevelCircles;

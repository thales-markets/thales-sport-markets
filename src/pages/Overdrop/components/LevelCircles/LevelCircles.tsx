import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { Circle } from '../styled-components';

type LevelCirclesTypes = {
    levels: number[];
    currentLevel: number;
    additionalLabelsForLevels?: string[];
    displayLevelNumberInsideCircle?: boolean;
    wrapperMargin?: string;
};

const LevelCircles: React.FC<LevelCirclesTypes> = ({
    levels,
    currentLevel,
    additionalLabelsForLevels,
    displayLevelNumberInsideCircle,
    wrapperMargin,
}) => {
    return (
        <Wrapper wrapperMargin={wrapperMargin}>
            {levels.map((item, index) => {
                return (
                    <LevelWrapper key={index} active={item <= currentLevel}>
                        {!!additionalLabelsForLevels && !!additionalLabelsForLevels[index] && (
                            <LabelAbove>{additionalLabelsForLevels[index]}</LabelAbove>
                        )}
                        <Circle active={item <= currentLevel}>{displayLevelNumberInsideCircle ? item : ''}</Circle>
                        <LabelBelow active={item <= currentLevel}>
                            {!displayLevelNumberInsideCircle ? item : ''}
                        </LabelBelow>
                    </LevelWrapper>
                );
            })}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRowCentered)<{ wrapperMargin?: string }>`
    justify-content: space-around;
    margin: ${(props) => (props.wrapperMargin ? props.wrapperMargin : '5px 0px')};
`;

const LevelWrapper = styled(FlexDivColumnCentered)<{ wrapperMargin?: string; active?: boolean }>`
    position: relative;
    margin: 5px 0px;
    align-items: center;
    max-width: 23px;
    &:after {
        ${(props) =>
            props.active
                ? `
        content: ' ';
        width: 50%;
        height: 16px;
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        filter: blur(25px);
        background-color: #f1ba20;
  
    `
                : ''}
    }
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

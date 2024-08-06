import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';

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
                    <LevelWrapper key={index}>
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

const LevelWrapper = styled(FlexDivColumnCentered)<{ wrapperMargin?: string }>`
    margin: 5px 0px;
    align-items: center;
    justify-content: center;
    max-width: 23px;
`;

const Circle = styled(FlexDivColumnCentered)<{ active: boolean }>`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    background-color: ${(props) =>
        props?.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.background.quaternary};
    border-radius: 50%;
    width: 20px;
    min-height: 20px;
    font-size: 11px;
    font-weight: 900;
    justify-content: center;
    margin: 5px 2px;
    text-align: center;
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
    font-style: normal;
    font-weight: 800;
    text-align: center;
`;

export default LevelCircles;

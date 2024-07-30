import TestBadge from 'assets/images/overdrop/test.png';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';

type SmallBadgeProps = {
    level: number;
    requiredPointsForLevel: number;
    levelName: string;
    reached: boolean;
};

const SmallBadge: React.FC<SmallBadgeProps> = ({ level, requiredPointsForLevel, levelName, reached }) => {
    return (
        <Wrapper>
            <LevelName active={reached}>{levelName}</LevelName>
            <BadgeWrapper>
                <Badge src={TestBadge} active={reached} />
                {!reached && (
                    <DisabledLevelWrapper>
                        <Icon className="icon icon--lock" />
                    </DisabledLevelWrapper>
                )}
            </BadgeWrapper>
            <PointsLabel active={reached}>{`${requiredPointsForLevel} XP`}</PointsLabel>
            <Label active={reached}>{'LEVEL'}</Label>
            <Level active={reached}>{level}</Level>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    justify-content: center;
    height: 150px;
    margin: 0 5px;
`;

const Label = styled.span<{ active?: boolean }>`
    font-size: 13.5px;
    font-weight: 300;
    margin-bottom: 3px;
    text-transform: uppercase;
    color: ${(props) =>
        props.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.textColor.tertiary};
`;

const PointsLabel = styled(Label)`
    font-weight: 700;
`;

const Level = styled(Label)`
    font-size: 25.038px;
    font-weight: 800;
`;

const LevelName = styled.span<{ active?: boolean }>`
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${(props) => (props.active ? props.theme.textColor.primary : props.theme.overdrop.textColor.tertiary)};
`;

const BadgeWrapper = styled(FlexDivColumnCentered)`
    position: relative;
`;

const Badge = styled.img<{ active?: boolean }>`
    width: 86px;
    height: 86px;
    margin: 5px 0px;
    opacity: ${(props) => (props.active ? '1' : '0.2')};
`;

const DisabledLevelWrapper = styled(FlexDivColumnCentered)`
    position: absolute;
    top: 5px;
    left: 0;
    width: 86px;
    height: 86px;
    background-color: ${(props) => props.theme.overdrop.badge.background.secondary};
    border: 3px solid ${(props) => props.theme.overdrop.borderColor.primary};
    border-radius: 50%;
    text-align: center;
`;

const Icon = styled.i`
    color: ${(props) => props.theme.overdrop.borderColor.primary};
    height: 22px;
`;

export default SmallBadge;

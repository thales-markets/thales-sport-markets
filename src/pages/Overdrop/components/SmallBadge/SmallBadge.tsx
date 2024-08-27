import { OVERDROP_LEVELS } from 'constants/overdrop';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { formatPoints } from 'utils/overdrop';

type SmallBadgeProps = {
    level: number;
    requiredPointsForLevel: number;
    levelName: string;
    reached: boolean;
};

const SmallBadge: React.FC<SmallBadgeProps> = ({ level, requiredPointsForLevel, levelName, reached }) => {
    const { t } = useTranslation();
    const levelItem = OVERDROP_LEVELS.find((item) => item.level == level);

    return (
        <Wrapper>
            <LevelName active={reached}>{levelName}</LevelName>
            <BadgeWrapper>
                <Badge src={levelItem ? levelItem.smallBadge : ''} active={reached} />
                {!reached && (
                    <DisabledLevelWrapper>
                        <Icon className="icon icon--lock" />
                    </DisabledLevelWrapper>
                )}
            </BadgeWrapper>
            <PointsLabel active={reached}>{`${formatPoints(requiredPointsForLevel)}`}</PointsLabel>
            <Label active={reached}>{t('overdrop.overdrop-home.level')}</Label>
            <Level active={reached}>{level}</Level>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    justify-content: center;
    height: 200px;
    margin: 0 4px;
    @media (max-width: 767px) {
        height: 180px;
    }
`;

const Label = styled.span<{ active?: boolean }>`
    font-size: 13.5px;
    font-weight: 300;
    margin-bottom: 3px;
    text-transform: uppercase;
    color: ${(props) =>
        props.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.textColor.tertiary};
    white-space: pre;
`;

const PointsLabel = styled(Label)`
    font-weight: 700;
`;

const Level = styled(Label)`
    font-size: 25px;
    font-weight: 800;
`;

const LevelName = styled.span<{ active?: boolean }>`
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    text-align: center;
    word-wrap: break-word;
    white-space: pre;
    color: ${(props) => (props.active ? props.theme.textColor.primary : props.theme.overdrop.textColor.tertiary)};
`;

const BadgeWrapper = styled(FlexDivColumnCentered)`
    position: relative;
`;

const Badge = styled.img<{ active?: boolean }>`
    width: 80px;
    height: 80px;
    margin: 5px 0px;
    opacity: ${(props) => (props.active ? '1' : '0.2')};
    @media (max-width: 400px) {
        width: 70px;
        height: 70px;
    }
`;

const DisabledLevelWrapper = styled(FlexDivColumnCentered)`
    position: absolute;
    top: 20px;
    left: 0;
    width: 74px;
    height: 74px;
    background-color: ${(props) => props.theme.overdrop.badge.background.secondary};
    border: 3px solid ${(props) => props.theme.overdrop.borderColor.primary};
    border-radius: 50%;
    text-align: center;
    @media (max-width: 400px) {
        width: 66px;
        height: 66px;
    }
`;

const Icon = styled.i`
    color: ${(props) => props.theme.overdrop.borderColor.primary};
    height: 22px;
`;

export default SmallBadge;

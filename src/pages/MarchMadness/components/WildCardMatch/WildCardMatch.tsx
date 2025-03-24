import React from 'react';
import styled from 'styled-components';
import { FlexDivEnd } from 'styles/common';

type WildCardMatchProps = {
    homeTeam: string;
    awayTeam: string;
    position: number;
    isHomeTeamWon: boolean | undefined;
    margin?: string;
};

const WildCardMatch: React.FC<WildCardMatchProps> = ({ homeTeam, awayTeam, position, isHomeTeamWon, margin }) => {
    return (
        <Container margin={margin}>
            <TeamRow>
                <TeamPosition>
                    <TeamPositionValue>{position}</TeamPositionValue>
                </TeamPosition>
                <TeamName isWinner={isHomeTeamWon}>{homeTeam}</TeamName>
            </TeamRow>
            <TeamSeparator />
            <TeamRow>
                <TeamPosition>
                    <TeamPositionValue>{position}</TeamPositionValue>
                </TeamPosition>
                <TeamName isWinner={!isHomeTeamWon}>{awayTeam}</TeamName>
            </TeamRow>
        </Container>
    );
};

const Container = styled.div<{ margin?: string }>`
    background: ${(props) => props.theme.marchMadness.button.background.primary};
    position: relative;
    width: 135px;
    height: 52px;
    border: 1px solid ${(props) => props.theme.marchMadness.borderColor.quinary};
    border-radius: 4px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const TeamRow = styled.div`
    width: 100%;
    height: 24.5px;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 1px;
    z-index: 100;
`;

const TeamName = styled.div<{ isWinner?: boolean }>`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-transform: uppercase;
    color: ${(props) =>
        props.isWinner === undefined || props.isWinner
            ? props.theme.marchMadness.textColor.secondary
            : props.theme.marchMadness.textColor.quinary};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TeamSeparator = styled.hr`
    width: 122px;
    height: 1px;
    border: none;
    background-color: ${(props) => props.theme.marchMadness.background.quinary};
    margin: auto;
`;

const TeamPosition = styled(FlexDivEnd)`
    position: absolute;
    left: 0;
    align-items: center;
    width: 15px;
    height: 100%;
`;

const TeamPositionValue = styled.span`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.quinary};
`;

export default WildCardMatch;

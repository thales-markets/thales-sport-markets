import styled from 'styled-components';
import React from 'react';

type WildCardMatchProps = {
    homeTeam: string;
    awayTeam: string;
    isHomeTeamWon: boolean | undefined;
    margin?: string;
};

const WildCardMatch: React.FC<WildCardMatchProps> = ({ homeTeam, awayTeam, isHomeTeamWon, margin }) => {
    return (
        <Container margin={margin}>
            <TeamRow>
                <TeamName isWinner={isHomeTeamWon}>{homeTeam}</TeamName>
            </TeamRow>
            <TeamSeparator />
            <TeamRow>
                <TeamName isWinner={!isHomeTeamWon}>{awayTeam}</TeamName>
            </TeamRow>
        </Container>
    );
};

const Container = styled.div<{ margin?: string }>`
    background: #ffffff;
    position: relative;
    width: 135px;
    height: 52px;
    border: 1px solid #0e94cb;
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
    color: ${(props) => (props.isWinner === undefined || props.isWinner ? '#021631' : '#9AAEB1')};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TeamSeparator = styled.hr`
    width: 122px;
    height: 1px;
    border: none;
    background-color: #0e94cb;
    margin: auto;
`;

export default WildCardMatch;

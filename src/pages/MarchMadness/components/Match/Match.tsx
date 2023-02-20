import React from 'react';
import styled from 'styled-components';
import MatchConnector from '../MatchConnector';

type MatchProps = { id: number; height: number; margin?: string };

const Match: React.FC<MatchProps> = ({ id, height, margin }) => {
    return (
        <Container height={height} margin={margin}>
            <HomeTeam></HomeTeam>
            <TeamSeparator />
            <AwayTeam></AwayTeam>
            <MatchConnector id={id} />
        </Container>
    );
};

const Container = styled.div<{ height: number; margin?: string }>`
    background: #ffffff;
    position: relative;
    width: 142px;
    height: ${(props) => props.height}px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    border: 1px solid #0E94CB;
    border-radius: 4px;
`;

const TeamSeparator = styled.hr`
    width: 122px;
    height: 1px;
    border: none;
    background-color: #0e94cb;
    margin: auto;
`;

const HomeTeam = styled.div`
    width: 100%;
    height: 50%;
`;

const AwayTeam = styled.div`
    width: 100%;
    height: 50%;
`;

export default Match;

import styled from 'styled-components';
import React from 'react';
import TableByVolume from './components/TableByVolume';
import TableByGuessedCorrectly from './components/TableByGuessedCorrectly';

const Leaderboard: React.FC = () => {
    return (
        <Container>
            <TableByVolume />
            <TableByGuessedCorrectly />
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: auto;
    width: 100%;
    margin: 70px 0;
`;

export default Leaderboard;

import { initialMatchesData } from 'utils/marchMadness';
import React, { useState } from 'react';
import styled from 'styled-components';
import Match from '../Match';
import { MarchMadMatch } from 'types/marchMadness';

const Brackets: React.FC = () => {
    const [matchesData, setMatchesData] = useState(initialMatchesData);

    const updateBracketsByMatch = (id: number, isHomeTeamSelected: boolean) => {
        // update current match - only one
        let updatedMatch: MarchMadMatch | undefined = undefined;
        const updatedMatches = matchesData.map((match) => {
            if (match.id === id) {
                updatedMatch = { ...match, isHomeTeamSelected };
                return updatedMatch;
            }
            return match;
        });

        // populate first child match always - only one child
        let firstChildMatchId: number | undefined = undefined;
        let previousTeamId: number | undefined = undefined;
        let newTeamId: number | undefined = undefined;
        const updatedChildMatches = updatedMatches.map((match) => {
            if (match.homeTeamParentMatchId === updatedMatch?.id) {
                // home team in child match
                firstChildMatchId = match.id;
                previousTeamId = match.homeTeamId;
                newTeamId = updatedMatch?.isHomeTeamSelected ? updatedMatch.homeTeamId : updatedMatch?.awayTeamId;
                return {
                    ...match,
                    homeTeamId: newTeamId,
                    isHomeTeamSelected: true,
                };
            }
            if (match.awayTeamParentMatchId === updatedMatch?.id) {
                // away team in child match
                firstChildMatchId = match.id;
                previousTeamId = match.awayTeamId;
                newTeamId = updatedMatch?.isHomeTeamSelected ? updatedMatch.homeTeamId : updatedMatch?.awayTeamId;
                return {
                    ...match,
                    awayTeamId: newTeamId,
                    isHomeTeamSelected: false,
                };
            }
            return match;
        });

        // update all children of first child which have previous team
        const childrenMatchesIds: number[] = [];
        let currentChildMatch = updatedChildMatches.find(
            (match) =>
                match.homeTeamParentMatchId === firstChildMatchId || match.awayTeamParentMatchId === firstChildMatchId
        );
        while (currentChildMatch) {
            childrenMatchesIds.push(currentChildMatch.id);
            const newParentMatchId = currentChildMatch.id;
            currentChildMatch = updatedChildMatches.find(
                (match) =>
                    match.homeTeamParentMatchId === newParentMatchId || match.awayTeamParentMatchId === newParentMatchId
            );
        }
        const updatedChildrenMatches = updatedChildMatches.map((match) => {
            if (childrenMatchesIds.includes(match.id)) {
                if (match.homeTeamId !== undefined && match.homeTeamId === previousTeamId) {
                    return {
                        ...match,
                        homeTeamId: newTeamId,
                    };
                } else if (match.awayTeamId !== undefined && match.awayTeamId === previousTeamId) {
                    return {
                        ...match,
                        awayTeamId: newTeamId,
                    };
                }
                return match;
            }
            return match;
        });

        setMatchesData(updatedChildrenMatches);
    };

    const getMatchesPerIdRange = (fromId: number, toId: number) => {
        return matchesData.map((match) => {
            if (match.id >= fromId && match.id <= toId) {
                const isFirstRound = fromId < 32;
                const isSecondRound = fromId >= 32 && toId < 48;
                const isSecondRoundLowerHalf = [36, 44].includes(match.id);
                const isSweet16 = fromId >= 48 && toId < 56;
                const isSweet16LowerHalf = [50, 54].includes(match.id);

                const margin = isFirstRound
                    ? match.id === fromId
                        ? '0'
                        : `${FIRST_ROUND_MATCH_GAP}px 0 0 0`
                    : isSecondRound
                    ? match.id === fromId // first match in round by quarter
                        ? isSecondRoundLowerHalf
                            ? '51px 0 0 0'
                            : `${FIRST_ROUND_MATCH_GAP + 1}px 0 0 0`
                        : `${SECOND_ROUND_MATCH_GAP}px 0 0 0`
                    : isSweet16
                    ? match.id === fromId // first match in round by quarter
                        ? isSweet16LowerHalf
                            ? '111px 0 0 0'
                            : `${SECOND_ROUND_MATCH_GAP + 1}px 0 0 0`
                        : `${SWEET16_ROUND_MATCH_GAP}px 0 0 0`
                    : '';
                return (
                    <Match
                        key={match.id}
                        id={match.id}
                        matchData={match}
                        updateBrackets={updateBracketsByMatch}
                        height={MATCH_HEIGHT}
                        margin={margin}
                    ></Match>
                );
            }
        });
    };

    const getMatchById = (id: number) => {
        const isElite8UpperHalf = [56, 58].includes(id);
        const isElite8LowerHalf = [57, 59].includes(id);
        const isSemiFinalLeft = id === 60;
        const isSemiFinalRight = id === 61;
        const isFinal = id === 62;

        const margin = isElite8UpperHalf
            ? `${SWEET16_ROUND_MATCH_GAP + 1}px 0 0 0`
            : isElite8LowerHalf
            ? '231px 0 0 0'
            : isSemiFinalLeft
            ? '-7px 25px 0 0'
            : isSemiFinalRight
            ? '-7px 0 0 25px'
            : isFinal
            ? '24px 0 0 0'
            : '';

        return (
            <Match
                id={id}
                matchData={matchesData.find((match) => match.id === id) || matchesData[id]}
                updateBrackets={updateBracketsByMatch}
                height={MATCH_HEIGHT}
                margin={margin}
            ></Match>
        );
    };

    return (
        <Container>
            <RowHalf>
                <LeftQuarter>
                    <FirstRound>{getMatchesPerIdRange(0, 7)}</FirstRound>
                    <SecondRound sideLeft={true}>{getMatchesPerIdRange(32, 35)}</SecondRound>
                    <Sweet16 sideLeft={true}>{getMatchesPerIdRange(48, 49)}</Sweet16>
                    <Elite8 sideLeft={true}>{getMatchById(56)}</Elite8>
                </LeftQuarter>
                <RightQuarter>
                    <Elite8 sideLeft={false}>{getMatchById(58)}</Elite8>
                    <Sweet16 sideLeft={false}>{getMatchesPerIdRange(52, 53)}</Sweet16>
                    <SecondRound sideLeft={false}>{getMatchesPerIdRange(40, 43)}</SecondRound>
                    <FirstRound>{getMatchesPerIdRange(16, 23)}</FirstRound>
                </RightQuarter>
            </RowHalf>
            <SemiFinals>
                {getMatchById(60)}
                {getMatchById(61)}
            </SemiFinals>
            <Final>{getMatchById(62)}</Final>
            <RowHalf>
                <LeftQuarter>
                    <FirstRound>{getMatchesPerIdRange(8, 15)}</FirstRound>
                    <SecondRound sideLeft={true}>{getMatchesPerIdRange(36, 39)}</SecondRound>
                    <Sweet16 sideLeft={true}>{getMatchesPerIdRange(50, 51)}</Sweet16>
                    <Elite8 sideLeft={true}>{getMatchById(57)}</Elite8>
                </LeftQuarter>
                <RightQuarter>
                    <Elite8 sideLeft={false}>{getMatchById(59)}</Elite8>
                    <Sweet16 sideLeft={false}>{getMatchesPerIdRange(54, 55)}</Sweet16>
                    <SecondRound sideLeft={false}>{getMatchesPerIdRange(44, 47)}</SecondRound>
                    <FirstRound>{getMatchesPerIdRange(24, 31)}</FirstRound>
                </RightQuarter>
            </RowHalf>
        </Container>
    );
};

const MATCH_HEIGHT = 52;
const FIRST_ROUND_MATCH_GAP = 8;
const SECOND_ROUND_MATCH_GAP = 1 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;
const SWEET16_ROUND_MATCH_GAP = 3 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;

const Container = styled.div``;

const RowHalf = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const LeftQuarter = styled.div`
    display: flex;
`;

const RightQuarter = styled.div`
    display: flex;
    margin-left: 208px;
`;

const FirstRound = styled.div`
    display: flex;
    flex-direction: column;
    z-index: 40;
`;

const SecondRound = styled.div<{ sideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.sideLeft ? 'margin-left: ' : 'margin-right: '}15px;`}
    z-index: 30;
`;

const Sweet16 = styled.div<{ sideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.sideLeft ? 'margin-left: ' : 'margin-right: '}-24px;`}
    z-index: 20;
`;

const Elite8 = styled.div<{ sideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.sideLeft ? 'margin-left: ' : 'margin-right: '}-37px;`}
    z-index: 10;
`;

const SemiFinals = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 38px;
`;

const Final = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 0;
`;

export default Brackets;

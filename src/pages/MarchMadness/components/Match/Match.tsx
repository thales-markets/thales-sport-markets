import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MarchMadMatch } from 'types/marchMadness';
import { teamsData } from 'utils/marchMadness';
import MatchConnector from '../MatchConnector';
import TeamStatus from '../TeamStatus';

type MatchProps = {
    id: number;
    matchData: MarchMadMatch;
    updateBrackets: (id: number, isHomeTeamSelected: boolean) => void;
    height: number;
    margin?: string;
};

const Match: React.FC<MatchProps> = ({ id, matchData, updateBrackets: updateMatch, height, margin }) => {
    const { t } = useTranslation();

    const isBracketsLeftSide = useMemo(
        () => id <= 15 || (id > 31 && id <= 39) || (id > 47 && id <= 51) || [56, 57, 60, 62].includes(id),
        [id]
    );

    const homeTeam = teamsData.find((team) => team.id === matchData?.homeTeamId);
    const awayTeam = teamsData.find((team) => team.id === matchData?.awayTeamId);

    const [isHomeTeamSelected, setIsHomeTeamSelected] = useState(matchData?.isHomeTeamSelected);
    const isAwayTeamSelected = isHomeTeamSelected !== undefined ? !isHomeTeamSelected : undefined;

    const teamClickHandler = (matchId: number, isHomeTeamClicked: boolean) => {
        if (!matchData.isResolved) {
            setIsHomeTeamSelected(isHomeTeamClicked);
            updateMatch(matchId, isHomeTeamClicked);
        }
    };

    return (
        <Container height={height} margin={margin}>
            <TeamRow isClickable={!matchData.isResolved} onClick={() => teamClickHandler(id, true)}>
                {/* HOME TEAM */}
                {isBracketsLeftSide ? (
                    <>
                        <Logo>L1</Logo>
                        <TeamPosition isLeftSide={true}>
                            <TeamPositionValue>{homeTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        <TeamName isLeftSide={true} hasName={!!homeTeam?.displayName} isSelected={isHomeTeamSelected}>
                            {homeTeam?.displayName || t('march-madness.brackets.team-1')}
                        </TeamName>
                        <TeamStatus
                            isSelected={!!isHomeTeamSelected}
                            isResolved={!!matchData?.isResolved}
                            margin="0 5px 0 0"
                        />
                    </>
                ) : (
                    <>
                        <TeamStatus
                            isSelected={!!isHomeTeamSelected}
                            isResolved={!!matchData?.isResolved}
                            margin="0 0 0 5px"
                        />
                        <TeamName isLeftSide={false} hasName={!!homeTeam?.displayName} isSelected={isHomeTeamSelected}>
                            {homeTeam?.displayName || t('march-madness.brackets.team-1')}
                        </TeamName>
                        <TeamPosition isLeftSide={false}>
                            <TeamPositionValue>{homeTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        <Logo>L1</Logo>
                    </>
                )}
            </TeamRow>
            <TeamSeparator />
            <TeamRow isClickable={!matchData.isResolved} onClick={() => teamClickHandler(id, false)}>
                {/* AWAY TEAM */}
                {isBracketsLeftSide ? (
                    <>
                        <Logo>L2</Logo>
                        <TeamPosition isLeftSide={true}>
                            <TeamPositionValue>{awayTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        <TeamName isLeftSide={true} hasName={!!awayTeam?.displayName} isSelected={isAwayTeamSelected}>
                            {awayTeam?.displayName || t('march-madness.brackets.team-2')}
                        </TeamName>
                        <TeamStatus
                            isSelected={!!isAwayTeamSelected}
                            isResolved={!!matchData?.isResolved}
                            margin="0 5px 0 0"
                        />
                    </>
                ) : (
                    <>
                        <TeamStatus
                            isSelected={!!isAwayTeamSelected}
                            isResolved={!!matchData?.isResolved}
                            margin="0 0 0 5px"
                        />
                        <TeamName isLeftSide={false} hasName={!!awayTeam?.displayName} isSelected={isAwayTeamSelected}>
                            {awayTeam?.displayName || t('march-madness.brackets.team-2')}
                        </TeamName>
                        <TeamPosition isLeftSide={false}>
                            <TeamPositionValue>{awayTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        <Logo>L2</Logo>
                    </>
                )}
            </TeamRow>
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
    padding: 1px;
`;

const TeamSeparator = styled.hr`
    width: 122px;
    height: 1px;
    border: none;
    background-color: #0e94cb;
    margin: auto;
`;

const TeamRow = styled.div<{ isClickable: boolean }>`
    width: 100%;
    height: 50%;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 1px;
    z-index: 100;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
`;

const Logo = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9aaeb1; // remove this
`;

const TeamPosition = styled.div<{ isLeftSide: boolean }>`
    width: 9px;
    text-align: ${(props) => (props.isLeftSide ? 'right' : 'left')};
    height: 100%;
`;

const TeamPositionValue = styled.span`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    text-transform: uppercase;
    vertical-align: top;
    color: #9aaeb1;
`;

const TeamName = styled.div<{ isLeftSide: boolean; hasName: boolean; isSelected: boolean | undefined }>`
    width: 90px;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-transform: uppercase;
    color: ${(props) =>
        props.hasName
            ? props.isSelected === undefined
                ? '#021631'
                : props.isSelected
                ? '#0E94CB'
                : '#9AAEB1'
            : '#9AAEB1'};
    ${(props) => (props.isLeftSide ? 'margin-left: 2px;' : 'margin-right: 2px;')}
    text-align: ${(props) => (props.isLeftSide ? 'left' : 'right')};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export default Match;

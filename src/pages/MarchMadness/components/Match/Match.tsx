import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BracketMatch } from 'types/marchMadness';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { teamsData } from 'constants/marchMadness';
import MatchConnector from '../MatchConnector';
import TeamStatus from '../TeamStatus';
import { isMatchInRegion } from 'utils/marchMadness';
import { TAGS_FLAGS } from 'constants/tags';

export type MatchProps = {
    matchData: BracketMatch;
    winnerTeamId: number;
    isBracketsLocked: boolean;
    isTeamLostInPreviousRounds: (teamId: number | undefined) => boolean;
    updateBrackets: (id: number, isHomeTeamSelected: boolean) => void;
    height: number;
    isReadOnly?: boolean;
    margin?: string;
};

const Match: React.FC<MatchProps> = ({
    matchData,
    winnerTeamId,
    isBracketsLocked,
    isTeamLostInPreviousRounds,
    updateBrackets,
    height,
    isReadOnly,
    margin,
}) => {
    const { t } = useTranslation();

    const isBracketsLeftSide = useMemo(
        () => isMatchInRegion(matchData.id, 'South') || isMatchInRegion(matchData.id, 'East'),
        [matchData.id]
    );

    const [isHomeTeamSelected, setIsHomeTeamSelected] = useState(matchData?.isHomeTeamSelected);
    const isAwayTeamSelected = isHomeTeamSelected !== undefined ? !isHomeTeamSelected : undefined;

    const homeTeam = teamsData.find((team) => team.id === matchData?.homeTeamId);
    const awayTeam = teamsData.find((team) => team.id === matchData?.awayTeamId);

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        getTeamImageSource(homeTeam?.name || '', TAGS_FLAGS.NCAA_BASKETBALL)
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(
        getTeamImageSource(awayTeam?.name || '', TAGS_FLAGS.NCAA_BASKETBALL)
    );

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(homeTeam?.name || '', TAGS_FLAGS.NCAA_BASKETBALL));
        setAwayLogoSrc(getTeamImageSource(awayTeam?.name || '', TAGS_FLAGS.NCAA_BASKETBALL));
    }, [homeTeam?.name, awayTeam?.name]);

    useEffect(() => {
        if (matchData?.isHomeTeamSelected !== isHomeTeamSelected) {
            setIsHomeTeamSelected(matchData?.isHomeTeamSelected);
        }
    }, [matchData?.isHomeTeamSelected, isHomeTeamSelected]);

    const isTeamClickable =
        !isReadOnly && !isBracketsLocked && matchData.homeTeamId !== undefined && matchData.awayTeamId !== undefined;
    const teamClickHandler = (isHomeTeamClicked: boolean) => {
        if (isTeamClickable) {
            setIsHomeTeamSelected(isHomeTeamClicked);
            updateBrackets(matchData.id, isHomeTeamClicked);
        }
    };

    const homeTeamWonStatus =
        winnerTeamId !== 0
            ? matchData.isHomeTeamSelected === true && matchData.homeTeamId === winnerTeamId
            : isTeamLostInPreviousRounds(matchData.homeTeamId)
            ? false
            : undefined;
    const awayTeamWonStatus =
        winnerTeamId !== 0
            ? matchData.isHomeTeamSelected === false && matchData.awayTeamId === winnerTeamId
            : isTeamLostInPreviousRounds(matchData.awayTeamId)
            ? false
            : undefined;

    const getTeamName = (isHomeTeam: boolean, isLeftSide: boolean) => {
        const isWon = isHomeTeam ? homeTeamWonStatus : awayTeamWonStatus;
        return (
            <TeamName
                isLeftSide={isLeftSide}
                hasName={isHomeTeam ? !!homeTeam?.displayName : !!awayTeam?.displayName}
                isSelected={isHomeTeam ? isHomeTeamSelected : isAwayTeamSelected}
                isWon={isWon}
                isBracketsLocked={isBracketsLocked}
            >
                {isHomeTeam
                    ? homeTeam?.displayName || t('march-madness.brackets.team-1')
                    : awayTeam?.displayName || t('march-madness.brackets.team-2')}
            </TeamName>
        );
    };

    return (
        <Container height={height} margin={margin}>
            <TeamRow isClickable={isTeamClickable} isHomeTeam={true} onClick={() => teamClickHandler(true)}>
                {/* HOME TEAM */}
                {isBracketsLeftSide ? (
                    /* LEFT HALF */
                    <>
                        <Logo>
                            <TeamLogo
                                alt="Home team logo"
                                src={homeLogoSrc}
                                onError={getOnImageError(setHomeLogoSrc, TAGS_FLAGS.NCAA_BASKETBALL, true)}
                            />
                        </Logo>
                        <TeamPosition isLeftSide={true}>
                            <TeamPositionValue>{homeTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        {getTeamName(true, true)}
                        <TeamStatus isSelected={!!isHomeTeamSelected} isWon={homeTeamWonStatus} margin="0 5px 0 0" />
                    </>
                ) : (
                    /* RIGHT HALF */
                    <>
                        <TeamStatus isSelected={!!isHomeTeamSelected} isWon={homeTeamWonStatus} margin="0 0 0 5px" />
                        {getTeamName(true, false)}
                        <TeamPosition isLeftSide={false}>
                            <TeamPositionValue>{homeTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        <Logo>
                            <TeamLogo
                                alt="Home team logo"
                                src={homeLogoSrc}
                                onError={getOnImageError(setHomeLogoSrc, TAGS_FLAGS.NCAA_BASKETBALL, true)}
                            />
                        </Logo>
                    </>
                )}
            </TeamRow>
            <TeamSeparator isActive={!!homeTeam?.displayName || !!awayTeam?.displayName} />
            <TeamRow isClickable={isTeamClickable} isHomeTeam={false} onClick={() => teamClickHandler(false)}>
                {/* AWAY TEAM */}
                {isBracketsLeftSide ? (
                    /* LEFT HALF */
                    <>
                        <Logo>
                            <TeamLogo
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, TAGS_FLAGS.NCAA_BASKETBALL, true)}
                            />
                        </Logo>
                        <TeamPosition isLeftSide={true}>
                            <TeamPositionValue>{awayTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        {getTeamName(false, true)}
                        <TeamStatus isSelected={!!isAwayTeamSelected} isWon={awayTeamWonStatus} margin="0 5px 0 0" />
                    </>
                ) : (
                    /* RIGHT HALF */
                    <>
                        <TeamStatus isSelected={!!isAwayTeamSelected} isWon={awayTeamWonStatus} margin="0 0 0 5px" />
                        {getTeamName(false, false)}
                        <TeamPosition isLeftSide={false}>
                            <TeamPositionValue>{awayTeam?.position}</TeamPositionValue>
                        </TeamPosition>
                        <Logo>
                            <TeamLogo
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, TAGS_FLAGS.NCAA_BASKETBALL, true)}
                            />
                        </Logo>
                    </>
                )}
            </TeamRow>
            <MatchConnector id={matchData.id} />
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

const TeamSeparator = styled.hr<{ isActive: boolean }>`
    width: 122px;
    height: 1px;
    border: none;
    background-color: ${(props) => (props.isActive ? '#0e94cb' : '#9AAEB1')};
    margin: auto;
`;

const TeamRow = styled.div<{ isClickable: boolean; isHomeTeam: boolean }>`
    background: #ffffff;
    border-radius: 4px;
    width: 100%;
    height: 24.5px;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 1px;
    z-index: 100;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
    ${(props) =>
        props.isClickable
            ? `:hover {
                    background: #c4def2;
                    border-radius: ${props.isHomeTeam ? '4px 4px 0 0' : '0 0 4px 4px'};
                }`
            : ''}
`;

const Logo = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TeamLogo = styled.img`
    width: 20px;
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

const TeamName = styled.div<{
    isLeftSide: boolean;
    hasName: boolean;
    isSelected: boolean | undefined;
    isWon: boolean | undefined;
    isBracketsLocked: boolean;
}>`
    width: 90px;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-transform: uppercase;
    color: ${(props) =>
        props.hasName
            ? props.isBracketsLocked
                ? props.isSelected
                    ? props.isWon === undefined
                        ? '#0E94CB'
                        : props.isWon
                        ? '#00957E'
                        : '#606A78'
                    : '#9AAEB1'
                : props.isSelected
                ? '#0E94CB'
                : '#021631'
            : '#9AAEB1'};
    ${(props) => (props.isLeftSide ? 'margin-left: 2px;' : 'margin-right: 2px;')}
    text-align: ${(props) => (props.isLeftSide ? 'left' : 'right')};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${(props) =>
        props.hasName && props.isBracketsLocked && props.isSelected && props.isWon === false
            ? 'text-decoration: line-through #CA4C53;'
            : ''}
`;

export default Match;

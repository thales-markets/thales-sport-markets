import { REGION_BOTTOM_LEFT, REGION_UPPER_LEFT, teamsData } from 'constants/marchMadness';
import { League } from 'enums/sports';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BracketMatch } from 'types/marchMadness';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isMatchInRegion } from 'utils/marchMadness';
import MatchConnector from '../MatchConnector';
import TeamStatus from '../TeamStatus';

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
        () => isMatchInRegion(matchData.id, REGION_UPPER_LEFT) || isMatchInRegion(matchData.id, REGION_BOTTOM_LEFT),
        [matchData.id]
    );

    const [isHomeTeamSelected, setIsHomeTeamSelected] = useState(matchData?.isHomeTeamSelected);
    const isAwayTeamSelected = isHomeTeamSelected !== undefined ? !isHomeTeamSelected : undefined;

    const homeTeam = teamsData.find((team) => team.id === matchData?.homeTeamId);
    const awayTeam = teamsData.find((team) => team.id === matchData?.awayTeamId);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(homeTeam?.name || '', League.NCAAB));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(awayTeam?.name || '', League.NCAAB));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(homeTeam?.name || '', League.NCAAB));
        setAwayLogoSrc(getTeamImageSource(awayTeam?.name || '', League.NCAAB));
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
            <TeamRowWrapper>
                <TeamRow
                    isClickable={isTeamClickable}
                    isHomeTeam={true}
                    isWon={homeTeamWonStatus}
                    isDefault={isHomeTeamSelected === undefined}
                    isSelected={!!isHomeTeamSelected}
                    onClick={() => teamClickHandler(true)}
                >
                    {/* HOME TEAM */}
                    {isBracketsLeftSide ? (
                        /* LEFT HALF */
                        <>
                            <Logo>
                                <TeamLogo
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={getOnImageError(setHomeLogoSrc, League.NCAAB, true)}
                                />
                            </Logo>
                            <TeamPosition isLeftSide={true}>
                                <TeamPositionValue>{homeTeam?.position}</TeamPositionValue>
                            </TeamPosition>
                            {getTeamName(true, true)}
                            <TeamStatus
                                isSelected={!!isHomeTeamSelected}
                                isWon={homeTeamWonStatus}
                                margin="0 3px 0 0"
                            />
                        </>
                    ) : (
                        /* RIGHT HALF */
                        <>
                            <TeamStatus
                                isSelected={!!isHomeTeamSelected}
                                isWon={homeTeamWonStatus}
                                margin="0 0 0 3px"
                            />
                            {getTeamName(true, false)}
                            <TeamPosition isLeftSide={false}>
                                <TeamPositionValue>{homeTeam?.position}</TeamPositionValue>
                            </TeamPosition>
                            <Logo>
                                <TeamLogo
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={getOnImageError(setHomeLogoSrc, League.NCAAB, true)}
                                />
                            </Logo>
                        </>
                    )}
                </TeamRow>
            </TeamRowWrapper>
            <TeamRowWrapper>
                <TeamRow
                    isClickable={isTeamClickable}
                    isHomeTeam={false}
                    isWon={awayTeamWonStatus}
                    isDefault={isHomeTeamSelected === undefined}
                    isSelected={isHomeTeamSelected === false}
                    onClick={() => teamClickHandler(false)}
                >
                    {/* AWAY TEAM */}
                    {isBracketsLeftSide ? (
                        /* LEFT HALF */
                        <>
                            <Logo>
                                <TeamLogo
                                    alt="Away team logo"
                                    src={awayLogoSrc}
                                    onError={getOnImageError(setAwayLogoSrc, League.NCAAB, true)}
                                />
                            </Logo>
                            <TeamPosition isLeftSide={true}>
                                <TeamPositionValue>{awayTeam?.position}</TeamPositionValue>
                            </TeamPosition>
                            {getTeamName(false, true)}
                            <TeamStatus
                                isSelected={!!isAwayTeamSelected}
                                isWon={awayTeamWonStatus}
                                margin="0 3px 0 0"
                            />
                        </>
                    ) : (
                        /* RIGHT HALF */
                        <>
                            <TeamStatus
                                isSelected={!!isAwayTeamSelected}
                                isWon={awayTeamWonStatus}
                                margin="0 0 0 3px"
                            />
                            {getTeamName(false, false)}
                            <TeamPosition isLeftSide={false}>
                                <TeamPositionValue>{awayTeam?.position}</TeamPositionValue>
                            </TeamPosition>
                            <Logo>
                                <TeamLogo
                                    alt="Away team logo"
                                    src={awayLogoSrc}
                                    onError={getOnImageError(setAwayLogoSrc, League.NCAAB, true)}
                                />
                            </Logo>
                        </>
                    )}
                </TeamRow>
            </TeamRowWrapper>
            <MatchConnector id={matchData.id} />
        </Container>
    );
};

const Container = styled.div<{ height: number; margin?: string }>`
    position: relative;
    width: 142px;
    height: ${(props) => props.height}px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const TeamRowWrapper = styled.div`
    background: ${(props) => props.theme.marchMadness.button.background.quaternary};
    border-radius: 4px;
    position: relative;
    z-index: 100;
`;

const TeamRow = styled.div<{
    isClickable: boolean;
    isHomeTeam: boolean;
    isWon: boolean | undefined;
    isDefault: boolean;
    isSelected: boolean;
}>`
    opacity: ${(props) => (!props.isDefault && !props.isSelected ? '0.5' : '1')};
    background: ${(props) => props.theme.marchMadness.button.background.primary};
    border: ${(props) =>
        !props.isDefault && !props.isSelected
            ? 'none'
            : `1px solid ${
                  props.isWon === undefined || props.isDefault
                      ? props.theme.marchMadness.borderColor.quinary
                      : props.isWon
                      ? props.theme.marchMadness.status.win
                      : props.theme.marchMadness.button.background.primary
              }`};
    border-radius: 4px;
    width: 100%;
    height: 26px;
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
                    background: ${props.theme.marchMadness.button.background.quinary};
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
    color: ${(props) => props.theme.marchMadness.textColor.quinary};
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
                        ? props.theme.marchMadness.status.selected // locked selected
                        : props.isWon
                        ? props.theme.marchMadness.status.win
                        : props.theme.marchMadness.status.loss
                    : props.theme.marchMadness.status.notSelected // locked not selected
                : props.isSelected
                ? props.theme.marchMadness.status.selected // open selected
                : props.theme.marchMadness.status.started // open not selected
            : props.theme.marchMadness.status.notSelected};
    ${(props) => (props.isLeftSide ? 'margin-left: 2px;' : 'margin-right: 2px;')}
    text-align: ${(props) => (props.isLeftSide ? 'left' : 'right')};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export default Match;

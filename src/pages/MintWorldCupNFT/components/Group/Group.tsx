import React from 'react';
import { ReactComponent as GroupRectangle } from 'assets/images/favorite-team/group-rectangle.svg';
import { ReactComponent as GroupCollapsedRectangle } from 'assets/images/favorite-team/group-collapsed-rectangle.svg';
import { ReactComponent as ArrowDown } from 'assets/images/favorite-team/arrow-down.svg';
import { countriesFlagsNames } from 'pages/MintWorldCupNFT/countries';
import { Team } from 'pages/MintWorldCupNFT/groups';
import {
    GroupLetter,
    TeamContainer,
    TeamImage,
    TeamNameWrapper,
    TeamName,
    TeamFlagContainer,
    TeamFlagImage,
    ArrowContainer,
    GroupInfoContainer,
} from 'pages/MintWorldCupNFT/styled-components';
import styled from 'styled-components';

type GroupProps = {
    openedGroup: string;
    setOpenedGroup: (groupLetter: string) => void;
    selectedTeam: Team | null;
    setSelectedTeam: (team: Team) => void;
    groupLetter: string;
    groupTeams: Team[];
};

const Group: React.FC<GroupProps> = ({
    groupLetter,
    groupTeams,
    selectedTeam,
    setSelectedTeam,
    openedGroup,
    setOpenedGroup,
}) => {
    return (
        <>
            <GroupInfoContainer>
                {openedGroup === groupLetter ? (
                    <>
                        <GroupRectangle />
                        <GroupLetter color="#04cfb6">{groupLetter}</GroupLetter>
                        {groupTeams.map((team, index) => (
                            <TeamContainer
                                index={index}
                                key={index}
                                selected={team.number === selectedTeam?.number}
                                onClick={() => setSelectedTeam(team)}
                            >
                                <TeamImage
                                    src={`https://thales-protocol.s3.eu-north-1.amazonaws.com/zebro_${team.name
                                        .toLocaleLowerCase()
                                        .split(' ')
                                        .join('_')}.png`}
                                />
                                <TeamNameWrapper>
                                    <TeamName index={index}>{team.name}</TeamName>
                                </TeamNameWrapper>
                            </TeamContainer>
                        ))}
                    </>
                ) : (
                    <>
                        <StyledGroupCollapsedRectangle onClick={() => setOpenedGroup(groupLetter)} />
                        <GroupLetter color="white">{groupLetter}</GroupLetter>
                        {groupTeams.map((team, index) => (
                            <TeamFlagContainer onClick={() => setOpenedGroup(groupLetter)} index={index} key={index}>
                                <TeamFlagImage
                                    selected={team.number === selectedTeam?.number}
                                    src={`logos/FIFA World Cup/${countriesFlagsNames[team.number - 1]}.png`}
                                />
                            </TeamFlagContainer>
                        ))}
                        <ArrowContainer onClick={() => setOpenedGroup(groupLetter)}>
                            <ArrowDown />
                        </ArrowContainer>
                    </>
                )}
            </GroupInfoContainer>
        </>
    );
};

const StyledGroupCollapsedRectangle = styled(GroupCollapsedRectangle)`
    cursor: pointer;
`;

export default Group;

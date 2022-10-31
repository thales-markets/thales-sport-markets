import React from 'react';
import styled from 'styled-components';
import { InfoContainer } from 'pages/Markets/Home/Parlay/components/styled-components';
import { ReactComponent as GroupRectangle } from 'assets/images/favorite-team/group-rectangle.svg';
import { Team } from '../ChooseNFT/ChooseNFT';

type GroupProps = {
    groupLetter: string;
    groupTeams: Team[];
};

const Group: React.FC<GroupProps> = ({ groupLetter, groupTeams }) => {
    return (
        <>
            <InfoContainer>
                <GroupRectangle />
                <GroupLetter>{groupLetter}</GroupLetter>
                {groupTeams.map((team, index) => (
                    <TeamContainer index={index} key={index}>
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
            </InfoContainer>
        </>
    );
};

const GroupLetter = styled.span`
    position: absolute;
    font-weight: 700;
    font-size: 25px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #04cfb6;
    left: 4%;
    top: 50%;
    transform: translateY(-50%);
`;

const TeamContainer = styled.div<{ index: number }>`
    position: absolute;
    left: ${(props) => (props.index + 1) * 21 - 10}%;
    width: 18%;
    border: 4px solid #6d152e;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    :hover {
        cursor: pointer;
        border: 4px solid #ff004b;
        box-shadow: 0px 0px 7px 5px #ac0033;
    }
`;

const TeamImage = styled.img`
    width: 100%;
    border-radius: 50%;
`;

const TeamNameWrapper = styled.div`
    position: relative;
`;

const TeamName = styled.span<{ index: number }>`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -22px;
    text-align: center;
    width: 100%;
`;

export default Group;

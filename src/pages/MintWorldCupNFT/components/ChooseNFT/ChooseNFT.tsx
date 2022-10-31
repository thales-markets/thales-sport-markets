import { useTranslation } from 'react-i18next';
import { groups, Team } from 'pages/MintWorldCupNFT/groups';
import { GroupsContainer, MintButtonContainer, StyledButton } from 'pages/MintWorldCupNFT/styled-components';
import React, { useState } from 'react';
import Group from '../Group';

const ChooseNFT: React.FC = () => {
    const { t } = useTranslation();

    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [openedGroup, setOpenedGroup] = useState<string>('A');

    return (
        <GroupsContainer>
            {groups.map((group) => (
                <Group
                    key={group.letter}
                    openedGroup={openedGroup}
                    setOpenedGroup={setOpenedGroup}
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    groupTeams={group.teams}
                    groupLetter={group.letter}
                />
            ))}

            <MintButtonContainer>
                <StyledButton disabled={!selectedTeam}>{t('mint-world-cup-nft.mint-nft-button')}</StyledButton>
            </MintButtonContainer>
        </GroupsContainer>
    );
};

export default ChooseNFT;

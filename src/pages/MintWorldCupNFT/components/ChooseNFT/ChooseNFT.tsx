import { useTranslation } from 'react-i18next';
import { groups, Team } from 'pages/MintWorldCupNFT/groups';
import { GroupsContainer, MintButtonContainer, StyledButton } from 'pages/MintWorldCupNFT/styled-components';
import React, { useState } from 'react';
import Group from '../Group';
import ConfirmationDialog from '../ConfirmationDialog';

type ChooseNFTProps = {
    setSelectedTab: (tabNumber: number) => void;
};

const ChooseNFT: React.FC<ChooseNFTProps> = ({ setSelectedTab }) => {
    const { t } = useTranslation();

    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [openedGroup, setOpenedGroup] = useState<string>('A');
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState<boolean>(false);

    return (
        <>
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
                    <StyledButton
                        disabled={!selectedTeam}
                        onClick={() => {
                            if (selectedTeam) {
                                setIsConfirmationDialogOpen(true);
                            }
                        }}
                    >
                        {t('mint-world-cup-nft.mint-this-zebro')}
                    </StyledButton>
                </MintButtonContainer>
            </GroupsContainer>
            {isConfirmationDialogOpen && (
                <ConfirmationDialog
                    setSelectedTab={setSelectedTab}
                    selectedTeam={selectedTeam}
                    closeDialog={() => setIsConfirmationDialogOpen(false)}
                />
            )}
        </>
    );
};

export default ChooseNFT;

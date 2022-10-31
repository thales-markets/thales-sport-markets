import { countries } from 'pages/MintWorldCupNFT/countries';
import { GroupsContainer } from 'pages/MintWorldCupNFT/styled-components';
import React from 'react';
import Group from '../Group';

export type Team = {
    number: number;
    name: string;
};

const ChooseNFT: React.FC = () => {
    return (
        <GroupsContainer>
            <Group
                groupTeams={[
                    { number: 1, name: countries[0] },
                    { number: 2, name: countries[1] },
                    { number: 3, name: countries[2] },
                    { number: 4, name: countries[3] },
                ]}
                groupLetter="A"
            />
            <Group
                groupTeams={[
                    { number: 5, name: countries[4] },
                    { number: 6, name: countries[5] },
                    { number: 7, name: countries[6] },
                    { number: 8, name: countries[7] },
                ]}
                groupLetter="B"
            />
            <Group
                groupTeams={[
                    { number: 9, name: countries[8] },
                    { number: 10, name: countries[9] },
                    { number: 11, name: countries[10] },
                    { number: 12, name: countries[11] },
                ]}
                groupLetter="C"
            />
            <Group
                groupTeams={[
                    { number: 13, name: countries[12] },
                    { number: 14, name: countries[13] },
                    { number: 15, name: countries[14] },
                    { number: 16, name: countries[15] },
                ]}
                groupLetter="D"
            />
            <Group
                groupTeams={[
                    { number: 17, name: countries[16] },
                    { number: 18, name: countries[17] },
                    { number: 19, name: countries[18] },
                    { number: 20, name: countries[19] },
                ]}
                groupLetter="E"
            />
            <Group
                groupTeams={[
                    { number: 21, name: countries[20] },
                    { number: 22, name: countries[21] },
                    { number: 23, name: countries[22] },
                    { number: 24, name: countries[23] },
                ]}
                groupLetter="F"
            />
            <Group
                groupTeams={[
                    { number: 25, name: countries[24] },
                    { number: 26, name: countries[25] },
                    { number: 27, name: countries[26] },
                    { number: 28, name: countries[27] },
                ]}
                groupLetter="G"
            />
            <Group
                groupTeams={[
                    { number: 29, name: countries[28] },
                    { number: 30, name: countries[29] },
                    { number: 31, name: countries[30] },
                    { number: 32, name: countries[31] },
                ]}
                groupLetter="H"
            />
        </GroupsContainer>
    );
};

export default ChooseNFT;

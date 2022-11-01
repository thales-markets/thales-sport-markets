import { countries } from './countries';

export type Group = {
    letter: string;
    teams: Team[];
};

export type Team = {
    number: number;
    name: string;
};

export const groups: Group[] = [
    {
        letter: 'A',
        teams: [
            { number: 1, name: countries[0] },
            { number: 2, name: countries[1] },
            { number: 3, name: countries[2] },
            { number: 4, name: countries[3] },
        ],
    },
    {
        letter: 'B',
        teams: [
            { number: 5, name: countries[4] },
            { number: 6, name: countries[5] },
            { number: 7, name: countries[6] },
            { number: 8, name: countries[7] },
        ],
    },
    {
        letter: 'C',
        teams: [
            { number: 9, name: countries[8] },
            { number: 10, name: countries[9] },
            { number: 11, name: countries[10] },
            { number: 12, name: countries[11] },
        ],
    },
    {
        letter: 'D',
        teams: [
            { number: 13, name: countries[12] },
            { number: 14, name: countries[13] },
            { number: 15, name: countries[14] },
            { number: 16, name: countries[15] },
        ],
    },
    {
        letter: 'E',
        teams: [
            { number: 17, name: countries[16] },
            { number: 18, name: countries[17] },
            { number: 19, name: countries[18] },
            { number: 20, name: countries[19] },
        ],
    },
    {
        letter: 'F',
        teams: [
            { number: 21, name: countries[20] },
            { number: 22, name: countries[21] },
            { number: 23, name: countries[22] },
            { number: 24, name: countries[23] },
        ],
    },
    {
        letter: 'G',
        teams: [
            { number: 25, name: countries[24] },
            { number: 26, name: countries[25] },
            { number: 27, name: countries[26] },
            { number: 28, name: countries[27] },
        ],
    },
    {
        letter: 'H',
        teams: [
            { number: 29, name: countries[28] },
            { number: 30, name: countries[29] },
            { number: 31, name: countries[30] },
            { number: 32, name: countries[31] },
        ],
    },
];

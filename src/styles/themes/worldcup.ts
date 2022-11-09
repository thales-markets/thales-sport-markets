import { Colors } from 'styles/common';

export default {
    background: {
        primary:
            'radial-gradient(49.17% 87.57% at 50.83% 45.95%, #8A1538 10.65%, #5C0C24 33.48%, #450619 55.31%, #31000F 81.38%)',
        secondary: '#8A1538',
        tertiary: '#8e2442',
        quaternary: Colors.BLUE,
    },
    textColor: {
        primary: Colors.WHITE,
        secondary: '#FF004B',
        tertiary: Colors.GRAY,
        quaternary: Colors.BLUE,
    },
    oddsColor: {
        primary: Colors.GREEN,
        secondary: Colors.RED,
        tertiary: Colors.BLUE,
        quaternary: Colors.YELLOW,
    },
    borderColor: {
        primary: 'rgba(238, 238, 228, 0.4)',
        secondary: Colors.WHITE,
        tertiary: '#8A1538',
        quaternary: Colors.BLUE,
    },
    winnerColors: {
        primary: Colors.GREEN,
        secondary: Colors.YELLOW,
        tertiary: Colors.BLUE,
    },
    button: {
        background: {
            primary: Colors.GREEN,
            secondary: '#EEEEE4',
            tertiary: Colors.GRAY_DARK,
        },
        textColor: {
            primary: Colors.GRAY_LIGHT,
            secondary: Colors.GRAY_DARK,
            tertiary: Colors.GRAY,
            quaternary: '#8A1538',
        },
        borderColor: {
            primary: Colors.GRAY_LIGHT,
            secondary: '#8A1538',
        },
    },
    input: {
        background: {
            primary: Colors.WHITE,
            selection: {
                primary: Colors.GRAY_LIGHT,
            },
        },
        textColor: {
            primary: Colors.GRAY_DARK,
        },
        borderColor: {
            primary: Colors.WHITE,
            secondary: Colors.GRAY_LIGHT,
            focus: {
                primary: Colors.GREEN,
            },
        },
    },
    nav: {
        background: '#8A1538',
        text: {
            primary: '#04cfb6',
            secondary: Colors.WHITE,
        },
    },
};

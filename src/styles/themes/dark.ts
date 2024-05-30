import { Colors } from 'styles/common';

export default {
    fontFamily: { primary: "'Roboto' !important", secondary: '', tertiary: '' },
    background: {
        primary: Colors.NAVY_BLUE_EXTRA_DARK,
        secondary: Colors.NAVY_BLUE,
        tertiary: Colors.NAVY_BLUE_LIGHT,
        quaternary: Colors.BLUE,
        quinary: Colors.NAVY_BLUE_DARK,
        senary: Colors.TORY_BLUE,
        septenary: Colors.PURPLE_LIGHT,
    },
    textColor: {
        primary: Colors.WHITE,
        secondary: Colors.NAVY_BLUE_LIGHT,
        tertiary: Colors.NAVY_BLUE,
        quaternary: Colors.BLUE,
        quinary: Colors.NAVY_BLUE_EXTRA_LIGHT,
        senary: Colors.BLACK,
        septenary: Colors.TORY_BLUE_LIGHT,
    },
    borderColor: {
        primary: Colors.NAVY_BLUE_LIGHT,
        secondary: Colors.WHITE,
        tertiary: Colors.GREEN,
        quaternary: Colors.BLUE,
        quinary: Colors.NAVY_BLUE,
        senary: Colors.TORY_BLUE,
    },
    button: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.NAVY_BLUE,
            tertiary: Colors.NAVY_BLUE_LIGHT,
            quaternary: Colors.BLUE,
            quinary: Colors.BLUE,
            senary: Colors.TORY_BLUE,
        },
        textColor: {
            primary: Colors.NAVY_BLUE_DARK,
            secondary: Colors.WHITE,
            tertiary: Colors.ORANGE,
            quaternary: Colors.BLUE,
            quinary: Colors.NAVY_BLUE,
        },
        borderColor: {
            primary: Colors.GREEN,
            secondary: Colors.BLUE,
            tertiary: Colors.NAVY_BLUE_DARK,
            quaternary: Colors.NAVY_BLUE_LIGHT,
            quinary: Colors.GRAY_DARK,
        },
    },
    input: {
        background: {
            primary: Colors.WHITE,
            secondary: Colors.NAVY_BLUE_DARK,
            tertiary: Colors.NAVY_BLUE_EXTRA_DARK,
            selection: {
                primary: Colors.NAVY_BLUE_LIGHT,
            },
        },
        textColor: {
            primary: Colors.NAVY_BLUE_DARK,
            secondary: Colors.BLUE,
            tertiary: Colors.WHITE,
        },
        borderColor: {
            primary: Colors.WHITE,
            secondary: Colors.NAVY_BLUE_LIGHT,
            tertiary: Colors.BLUE,
            focus: {
                primary: Colors.BLUE,
            },
        },
    },
    link: {
        textColor: {
            primary: Colors.BLUE,
            secondary: Colors.WHITE,
        },
    },
    error: {
        background: {
            primary: Colors.NAVY_BLUE,
        },
        textColor: {
            primary: Colors.RED,
        },
        borderColor: {
            primary: Colors.RED,
        },
    },
    warning: {
        background: {
            primary: Colors.NAVY_BLUE,
        },
        textColor: {
            primary: Colors.ORANGE,
        },
        borderColor: {
            primary: Colors.ORANGE,
        },
    },
    info: {
        background: {
            primary: Colors.NAVY_BLUE,
        },
        textColor: {
            primary: Colors.BLUE,
        },
        borderColor: {
            primary: Colors.BLUE,
        },
    },
    shadow: {
        navBar: '-64px 0px 38px 3px rgba(0,0,0,0.41)',
        toggle: `0px 0px 40px ${Colors.BLUE}`,
        notification: '0px 0px 20px rgba(63, 177, 213, 0.96)',
        positionWinner: '0px 0px 15px -7px rgba(63,209,255,1)',
        winner: '0px 0px 33px -7px rgba(63,209,255,1)',
    },
    status: {
        open: Colors.WHITE,
        win: Colors.GREEN,
        loss: Colors.RED,
        started: Colors.RED,
        canceled: Colors.RED,
        paused: Colors.RED,
        live: Colors.RED_DARK,
        sold: Colors.NAVY_BLUE_LIGHT,
        comingSoon: Colors.ORANGE,
        finished: Colors.NAVY_BLUE_LIGHT,
    },
    promotion: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.NAVY_BLUE_LIGHT,
        },
        textColor: {
            primary: Colors.NAVY_BLUE_DARK,
            secondary: Colors.WHITE,
        },
    },
    oddsContainerBackground: {
        primary: Colors.NAVY_BLUE,
        secondary: Colors.NAVY_BLUE_DARK,
        tertiary: Colors.NAVY_BLUE_EXTRA_DARK,
    },
    chart: {
        primary: Colors.PURPLE,
    },
    connectWalletModal: {
        secondaryText: Colors.WHITE,
        border: Colors.NAVY_BLUE_LIGHT,
        buttonBackground: Colors.NAVY_BLUE_LIGHT,
        modalBackground: Colors.NAVY_BLUE_DARK,
        hover: Colors.BLUE,
        hoverText: Colors.NAVY_BLUE_DARK,
        errorMessage: Colors.RED,
        warningBackground: Colors.RED,
        warningText: Colors.WHITE,
        totalBalanceBackground: Colors.GRAY_SECOND,
    },
    progressBar: {
        selected: Colors.BLUE,
        unselected: Colors.WHITE,
    },
};

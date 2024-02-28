import { Colors } from 'styles/common';

export default {
    background: {
        primary: Colors.GRAY_DARK,
        secondary: Colors.GRAY,
        tertiary: Colors.GRAY_LIGHT,
        quaternary: Colors.BLUE,
    },
    textColor: {
        primary: Colors.WHITE,
        secondary: Colors.GRAY_LIGHT,
        tertiary: Colors.GRAY,
        quaternary: Colors.BLUE,
    },
    borderColor: {
        primary: Colors.GRAY_LIGHT,
        secondary: Colors.WHITE,
        tertiary: Colors.GREEN,
        quaternary: Colors.BLUE,
    },
    button: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.GRAY,
            tertiary: Colors.GRAY_LIGHT,
            quaternary: Colors.BLUE,
            quinary: Colors.BLUE,
        },
        textColor: {
            primary: Colors.GRAY_DARK,
            secondary: Colors.WHITE,
            tertiary: Colors.ORANGE,
            quaternary: Colors.BLUE,
            quinary: Colors.GRAY,
        },
        borderColor: {
            primary: Colors.GREEN,
            secondary: Colors.BLUE,
            tertiary: Colors.GRAY_DARK,
        },
    },
    input: {
        background: {
            primary: Colors.WHITE,
            secondary: Colors.GRAY_DARK,
            selection: {
                primary: Colors.GRAY_LIGHT,
            },
        },
        textColor: {
            primary: Colors.GRAY_DARK,
            secondary: Colors.BLUE,
        },
        borderColor: {
            primary: Colors.WHITE,
            secondary: Colors.GRAY_LIGHT,
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
            primary: Colors.GRAY,
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
            primary: Colors.GRAY,
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
            primary: Colors.GRAY,
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
        sold: Colors.GRAY_LIGHT,
        comingSoon: Colors.ORANGE,
        finished: Colors.GRAY_LIGHT,
    },
    promotion: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.GRAY_LIGHT,
        },
        textColor: {
            primary: Colors.GRAY_DARK,
            secondary: Colors.WHITE,
        },
    },
    oddsContainerBackground: {
        primary: Colors.GRAY,
        secondary: Colors.GRAY_SECOND,
        tertiary: Colors.GRAY_RESOLVED,
    },
    oddsGradiendBackground: {
        primary: Colors.GRAY_GRADIENT_1,
        secondary: Colors.GRAY_GRADIENT_2,
        tertiary: Colors.GRAY_GRADIENT_3,
    },
    chart: {
        primary: Colors.PURPLE,
    },
    connectWalletModal: {
        secondaryText: Colors.WHITE,
        border: Colors.GRAY_LIGHT,
        buttonBackground: Colors.GRAY_LIGHT,
        modalBackground: Colors.GRAY_DARK,
        hover: Colors.BLUE,
        hoverText: Colors.GRAY_DARK,
        errorMessage: Colors.RED,
        warningBackground: Colors.RED,
        warningText: Colors.WHITE,
        totalBalanceBackground: Colors.GRAY_SECOND,
    },
    progressBar: {
        selected: Colors.BLUE,
        unselected: Colors.WHITE,
    },
    marchMadness: {
        background: {
            primary: '',
            secondary: '',
            tertiary: '',
            quaternary: '',
            quinary: '',
        },
        textColor: {
            primary: '',
            secondary: '',
            tertiary: '',
            quaternary: '',
            quinary: '',
        },
        borderColor: {
            primary: '',
            secondary: '',
            tertiary: '',
            quaternary: '',
            quinary: '',
        },
        button: {
            background: {
                primary: '',
                secondary: Colors.BLUE_GRADIENT_1,
                tertiary: '',
                quaternary: '',
                quinary: '',
            },
            textColor: {
                primary: '',
                secondary: Colors.WHITE,
                tertiary: '',
                quaternary: '',
                quinary: '',
            },
            borderColor: {
                primary: '',
                secondary: '',
                tertiary: '',
            },
        },
        link: {
            textColor: {
                primary: '',
                secondary: '',
            },
        },
        shadow: {
            modal: '',
            image: '',
        },
        status: {
            notSelected: '',
            win: '',
            loss: '',
            started: '',
            wrong: '',
            selected: '',
            share: '',
        },
    },
};

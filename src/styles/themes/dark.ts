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
        },
        textColor: {
            primary: Colors.GRAY_DARK,
            secondary: Colors.WHITE,
            tertiary: Colors.ORANGE,
            quaternary: Colors.BLUE,
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
    },
    oddsContainerBackground: {
        primary: Colors.GRAY,
        secondary: Colors.GRAY_SECOND,
        tertiary: Colors.GRAY_RESOLVED,
    },
    chart: {
        primary: Colors.PURPLE,
    },
};

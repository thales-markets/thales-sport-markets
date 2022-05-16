import { Colors } from 'styles/common';

export default {
    background: { primary: Colors.GRAY_DARK, secondary: Colors.GRAY, tertiary: Colors.GRAY_LIGHT },
    textColor: {
        primary: Colors.WHITE,
        secondary: Colors.GRAY_LIGHT,
        tertiary: Colors.GRAY,
    },
    oddsColor: {
        primary: Colors.GREEN,
        secondary: Colors.RED,
        tertiary: Colors.BLUE,
    },
    borderColor: {
        primary: Colors.GRAY_LIGHT,
        secondary: Colors.WHITE,
        tertiary: Colors.GRAY_DARK,
    },
    button: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.GRAY_LIGHT,
            tertiary: Colors.GRAY_DARK,
        },
        textColor: {
            primary: Colors.GRAY_LIGHT,
            secondary: Colors.GRAY_DARK,
            tertiary: Colors.GRAY,
        },
        borderColor: {
            primary: Colors.GRAY_LIGHT,
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
            primary: Colors.PURPLE_DARK,
        },
        borderColor: {
            primary: Colors.WHITE,
            secondary: Colors.GRAY_LIGHT,
            focus: {
                primary: Colors.GREEN,
            },
        },
    },
};

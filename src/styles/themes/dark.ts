import { Colors } from 'styles/common';

export default {
    background: { primary: Colors.GRAY_DARK, secondary: Colors.GRAY, tertiary: Colors.PURPLE },
    textColor: {
        primary: Colors.WHITE,
        secondary: Colors.GRAY_LIGHT,
        tertiary: Colors.GRAY_LIGHT,
    },
    borderColor: {
        primary: Colors.WHITE,
        secondary: Colors.GREEN,
        tertiary: Colors.PURPLE,
    },
    button: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.WHITE,
        },
        textColor: {
            primary: Colors.GRAY_LIGHT,
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

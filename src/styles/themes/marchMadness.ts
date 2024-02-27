import { Colors } from 'styles/common';
import darkTheme from './dark';

export default {
    ...darkTheme,
    background: {
        ...darkTheme.background,
        primary: Colors.BLACK_GRADIENT_1,
    },
    textColor: {
        ...darkTheme.textColor,
        secondary: Colors.BLUE_GRADIENT_1,
    },
    marchMadness: {
        background: {
            primary: Colors.BLACK_GRADIENT_1,
            secondary: Colors.BLUE_GRADIENT_2,
            tertiary: Colors.BLUE_DARK,
            quaternary: Colors.RED_GRADIENT_1,
            quinary: Colors.GRAY_GRADIENT_5,
        },
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.BLUE_GRADIENT_1,
            tertiary: Colors.BLUE_DARK,
            quaternary: Colors.RED_GRADIENT_1,
            quinary: Colors.GRAY_GRADIENT_5,
        },
        borderColor: {
            primary: Colors.BLUE_GRADIENT_1,
            secondary: Colors.BLUE_GRADIENT_2,
            tertiary: Colors.WHITE,
            quaternary: Colors.BLUE_DARK,
            quinary: Colors.GRAY_GRADIENT_5,
        },
        button: {
            background: {
                primary: Colors.WHITE,
                secondary: Colors.BLUE_GRADIENT_1,
                tertiary: Colors.GRAY_LIGHT,
                quaternary: Colors.BLUE_GRADIENT_1_DISABLED,
                quinary: Colors.BLUE_LIGHT,
            },
            textColor: {
                primary: Colors.BLUE_DARK,
                secondary: Colors.WHITE,
                tertiary: Colors.GRAY_DARK,
                quaternary: Colors.BLUE,
                quinary: Colors.WHITE_GRADIENT_1,
            },
            borderColor: {
                primary: Colors.BLUE_GRADIENT_2,
                secondary: Colors.BLUE,
                tertiary: Colors.BLACK,
            },
        },
        link: {
            textColor: {
                primary: Colors.WHITE,
                secondary: Colors.BLUE_GRADIENT_2,
            },
        },
        shadow: {
            modal: `0px 0px 59px 11px ${Colors.GRAY_DARK}`,
            image: `0px 0px 100px -2px ${Colors.PURPLE_GRADIENT_1}`,
        },
        status: {
            notSelected: Colors.GRAY_GRADIENT_5,
            win: Colors.GREEN_GRADIENT_1,
            loss: Colors.GRAY_GRADIENT_4,
            started: Colors.BLUE_DARK,
            wrong: Colors.RED_GRADIENT_2,
            selected: Colors.BLUE_GRADIENT_2,
            share: Colors.WHITE_DISABLED,
        },
    },
};

import { Colors } from 'styles/common';
import darkTheme from './dark';

export default {
    ...darkTheme,
    fontFamily: {
        ...darkTheme.fontFamily,
        primary: "'Geogrotesque' !important",
        secondary: "'GeogrotesqueReg' !important",
        tertiary: "'Legacy' !important",
    },
    background: {
        ...darkTheme.background,
        primary: Colors.BLACK_GRADIENT_1,
        secondary: Colors.BLACK_GRADIENT_2,
    },
    textColor: {
        ...darkTheme.textColor,
        quaternary: Colors.WHITE,
    },
    borderColor: {
        ...darkTheme.borderColor,
        quaternary: Colors.MAIN_MARCH_MADNESS,
    },
    input: {
        ...darkTheme.input,
        borderColor: {
            ...darkTheme.input.borderColor,
            primary: Colors.MAIN_MARCH_MADNESS,
            tertiary: Colors.MAIN_MARCH_MADNESS,
            focus: {
                primary: Colors.MAIN_MARCH_MADNESS,
            },
        },
    },
    marchMadness: {
        background: {
            primary: Colors.BLACK_GRADIENT_1,
            secondary: Colors.BLUE_DARK,
            tertiary: Colors.GRAY_SECOND,
            quaternary: Colors.RED_GRADIENT_1,
            quinary: Colors.GRAY_GRADIENT_5,
            senary: Colors.MAIN_MARCH_MADNESS,
        },
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.BLACK,
            tertiary: Colors.BLUE_DARK,
            quaternary: Colors.RED_GRADIENT_1,
            quinary: Colors.GRAY_GRADIENT_5,
            senary: Colors.MAIN_MARCH_MADNESS,
        },
        borderColor: {
            primary: Colors.BLUE_GRADIENT_1,
            secondary: Colors.GRAY_SECOND,
            tertiary: Colors.WHITE,
            quaternary: Colors.BLUE_DARK,
            quinary: Colors.GRAY_GRADIENT_5,
            senary: Colors.MAIN_MARCH_MADNESS,
        },
        button: {
            background: {
                primary: Colors.WHITE,
                secondary: Colors.BLUE_GRADIENT_1,
                tertiary: Colors.GRAY_LIGHT,
                quaternary: Colors.GRAY_GRADIENT_6,
                quinary: Colors.BLUE_LIGHT,
                senary: Colors.MAIN_MARCH_MADNESS,
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
        dropdown: {
            textColor: { primary: Colors.WHITE },
        },
        link: {
            textColor: {
                primary: Colors.WHITE,
                secondary: Colors.BLUE_GRADIENT_2,
            },
        },
        shadow: {
            modal: `0px 0px 59px 11px ${Colors.GRAY_DARK}`,
            image: `0px 0px 50px ${Colors.PURPLE_GRADIENT_1}`,
        },
        status: {
            notSelected: Colors.BLACK,
            win: Colors.GREEN_GRADIENT_1,
            loss: Colors.BLACK,
            started: Colors.BLUE_DARK,
            wrong: Colors.RED_GRADIENT_2,
            selected: Colors.BLACK,
            share: Colors.WHITE_DISABLED,
        },
    },
};

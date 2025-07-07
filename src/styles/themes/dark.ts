import { Colors } from 'styles/common';

export default {
    fontFamily: { primary: "'Inter' !important", secondary: '', tertiary: '' },
    background: {
        primary: Colors.NAVY_BLUE_EXTRA_DARK,
        secondary: Colors.NAVY_BLUE,
        tertiary: Colors.NAVY_BLUE_LIGHT,
        quaternary: Colors.BLUE,
        quinary: Colors.NAVY_BLUE_DARK,
        senary: Colors.TORY_BLUE,
        septenary: Colors.PURPLE_LIGHT,
        octonary: Colors.YELLOW,
    },
    textColor: {
        primary: Colors.WHITE,
        secondary: Colors.NAVY_BLUE_LIGHT,
        tertiary: Colors.NAVY_BLUE,
        quaternary: Colors.BLUE,
        quinary: Colors.NAVY_BLUE_EXTRA_LIGHT,
        senary: Colors.BLACK,
        septenary: Colors.TORY_BLUE_LIGHT,
        octonary: Colors.PARTICLE,
    },
    borderColor: {
        primary: Colors.NAVY_BLUE_LIGHT,
        secondary: Colors.WHITE,
        tertiary: Colors.GREEN,
        quaternary: Colors.BLUE,
        quinary: Colors.NAVY_BLUE,
        senary: Colors.TORY_BLUE,
        septenary: Colors.RED,
    },
    button: {
        background: {
            primary: Colors.GREEN,
            secondary: Colors.NAVY_BLUE,
            tertiary: Colors.NAVY_BLUE_LIGHT,
            quaternary: Colors.BLUE,
            quinary: Colors.GOLD,
            senary: Colors.TORY_BLUE,
            septenary: Colors.RED,
            octonary: Colors.GRAY_TRANSPARENT,
        },
        textColor: {
            primary: Colors.NAVY_BLUE_DARK,
            secondary: Colors.WHITE,
            tertiary: Colors.ORANGE,
            quaternary: Colors.BLUE,
            quinary: Colors.NAVY_BLUE,
            senary: Colors.GRAY_LIGHT,
        },
        borderColor: {
            primary: Colors.GREEN,
            secondary: Colors.BLUE,
            tertiary: Colors.NAVY_BLUE_DARK,
            quaternary: Colors.NAVY_BLUE_LIGHT,
            quinary: Colors.GRAY_DARK,
            senary: Colors.GRAY_LIGHT,
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
    dropDown: {
        indicatorColor: { primary: Colors.NAVY_BLUE_LIGHT },
        menu: { background: { primary: Colors.NAVY_BLUE }, borderColor: { primary: Colors.NAVY_BLUE_LIGHT } },
        menuItem: {
            selectedColor: { primary: Colors.GRAY_LIGHT_OPACITY },
            hoverColor: { primary: Colors.NAVY_BLUE_LIGHT, secondary: Colors.GRAY_LIGHT_OPACITY },
        },
    },
    link: {
        textColor: {
            primary: Colors.BLUE,
            secondary: Colors.WHITE,
        },
    },
    success: {
        textColor: {
            primary: Colors.GREEN,
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
        notificationOpen: '0px 0px 20px rgba(241, 186, 32, 0.96)',
        positionWinner: '0px 0px 15px -7px rgba(63,209,255,1)',
        winner: '0px 0px 33px -7px rgba(63,209,255,1)',
        errorNotification: '0px 0px 20px rgba(226, 106, 120, 0.96)',
    },
    status: {
        open: Colors.WHITE,
        win: Colors.GREEN,
        loss: Colors.RED,
        started: Colors.RED,
        canceled: Colors.RED,
        paused: Colors.RED,
        live: Colors.RED_DARK,
        sgp: Colors.GREEN,
        system: Colors.ORANGE,
        sold: Colors.NAVY_BLUE_LIGHT,
        comingSoon: Colors.ORANGE,
        finished: Colors.NAVY_BLUE_LIGHT,
        pending: {
            textColor: {
                primary: Colors.BLUE,
            },
            background: {
                primary: Colors.BLUE + '33', // opacity 20%
            },
        },
        failed: {
            textColor: {
                primary: Colors.RED,
            },
            background: {
                primary: Colors.RED + '33', // opacity 20%
            },
        },
        success: {
            textColor: {
                primary: Colors.GREEN,
            },
            background: {
                primary: Colors.GREEN + '33', // opacity 20%
            },
        },
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
        candleUp: Colors.GREEN,
        candleDown: Colors.RED,
        labels: Colors.GRAY_LIGHT,
        priceLine: Colors.WHITE,
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
    overdrop: {
        background: {
            secondary: Colors.YELLOW_OPACITY_60,
            tertiary: 'rgba(60, 73, 138, 0.15)',
            quaternary: Colors.METALIC_BLUE,
            quinary: Colors.NAVY_BLUE_EXTRA_DARK,
            senary: Colors.LIGHTNING_YELLOW,
            septenary: Colors.METALIC_YELLOW,
            active: Colors.NAVY_BLUE_DARK,
            progressBar: Colors.YELLOW,
        },
        textColor: {
            primary: Colors.YELLOW,
            secondary: Colors.NAVY_BLUE_DARK,
            tertiary: Colors.CHINESE_BLUE,
            quaternary: Colors.NAVY_BLUE_EXTRA_DARK,
            quinary: Colors.TORY_BLUE_LIGHT,
            senary: Colors.OVERDROP_GREEN,
            septenary: Colors.METALIC_YELLOW,
            inactive: Colors.NAVY_BLUE_LIGHT,
        },
        borderColor: {
            primary: Colors.JONQUIL,
            secondary: `linear-gradient(160deg, #4e5fb1, #dba111)`,
            tertiary: Colors.GOLD,
        },
        badge: {
            background: {
                primary: Colors.JONQUIL,
                secondary: 'rgb(21, 27, 54, 0.3)',
            },
            textColor: {
                primary: Colors.SMOKEY_TOPAZ,
            },
        },
        button: {
            textColor: {
                primary: Colors.NAVY_BLUE,
            },
            background: {
                primary: Colors.METALIC_YELLOW,
            },
        },
    },
    icon: {
        background: {
            primary: Colors.WHITE,
        },
        textColor: {
            primary: Colors.BLACK,
        },
    },
    slider: {
        trackColor: Colors.GREEN,
        thumbColor: Colors.WHITE,
    },
    tag: {
        background: {
            primary: Colors.GREEN_LIGHT,
        },
        textColor: {
            primary: Colors.WHITE,
        },
    },
    toggle: {
        label: {
            primary: Colors.NAVY_BLUE_EXTRA_DARK,
            secondary: Colors.WHITE,
        },
    },
    speedMarkets: {
        background: { primary: Colors.DARK_KNIGHT },
        borderColor: { primary: Colors.BLUE_ESTATE },
        textColor: {
            primary: Colors.WHITE,
            active: Colors.BLUE,
            inactive: Colors.NAVY_BLUE_LIGHT,
        },
        button: {
            background: {
                primary: Colors.NAVY_BLUE,
                secondary: `linear-gradient(90deg, ${Colors.HONEYCOMB} 0%, ${Colors.GOLDENROD} 100%)`,
                active: Colors.BLUE,
                inactive: Colors.LIBERTY_BLUE,
            },
            textColor: {
                primary: Colors.WHITE,
                active: Colors.NAVY_BLUE_DARK,
                inactive: Colors.TORY_BLUE,
            },
        },
        dropDown: {
            background: { primary: Colors.NATO_BLUE },
            borderColor: { primary: Colors.CORSAIR },
            textColor: { primary: Colors.BLUE },
            indicatorColor: { primary: Colors.BLUE },
        },
        price: {
            up: Colors.GREEN,
            down: Colors.RED,
        },
        position: {
            up: {
                default: Colors.BLUE,
                selected: Colors.NAVY_BLUE_DARK,
            },
            down: {
                default: Colors.RED,
                selected: Colors.NAVY_BLUE_DARK,
            },
        },
    },
};

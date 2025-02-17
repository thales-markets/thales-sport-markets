import styled from 'styled-components';

export const FlexDiv = styled.div<{ gap?: number }>`
    display: flex;
    gap: ${(props) => (props.gap ? `${props.gap}px` : '0')};
`;

export const FlexDivCentered = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
`;

export const FlexDivSpaceBetween = styled(FlexDiv)`
    align-items: center;
    justify-content: space-between;
`;

export const FlexDivEnd = styled(FlexDiv)`
    justify-content: end;
`;

export const FlexDivStart = styled(FlexDiv)`
    justify-content: start;
`;

export const FlexDivRow = styled(FlexDiv)`
    justify-content: space-between;
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
    align-items: center;
`;

export const FlexDivColumn = styled(FlexDiv)`
    flex: 1;
    flex-direction: column;
`;

export const FlexDivColumnNative = styled(FlexDiv)`
    flex-direction: column;
`;

export const FlexDivColumnCentered = styled(FlexDivColumn)`
    justify-content: center;
`;

export const BoldContent = styled.span`
    font-weight: 600;
`;

export const Colors = {
    GRAY: '#303656',
    GRAY_LIGHT: '#5F6180',
    GRAY_LIGHT_OPACITY: '#5F618080',
    GRAY_DARK: '#1A1C2B',
    GRAY_TRANSPARENT: '#D9D9D91A',

    // specific shades for odds background display
    GRAY_SECOND: '#242842',
    GRAY_RESOLVED: 'rgb(36,41,64, 0.5)',
    GRAY_GRADIENT_1: '#23273e',
    GRAY_GRADIENT_2: '#2f3454',
    GRAY_GRADIENT_3: '#2c3250',

    WHITE: '#FFFFFF',

    BLACK: '#000000',

    GREEN: '#5FC694',

    BLUE: '#3FFFFF',

    RED: '#e26a78',
    RED_DARK: '#ca4c53',

    ORANGE: '#FAC439',

    PURPLE: '#8884d8',
    PURPLE_LIGHT: '#9A9AFF',

    NAVY_BLUE: '#1F274D',
    NAVY_BLUE_LIGHT: '#7983A9',
    NAVY_BLUE_EXTRA_LIGHT: '#9FA1BA',
    NAVY_BLUE_DARK: '#151B36',
    NAVY_BLUE_EXTRA_DARK: '#111325',

    TORY_BLUE: '#3C498A',
    TORY_BLUE_LIGHT: '#4E5FB1',

    // Overdrop
    YELLOW: '#F1BA20',
    LIGHTNING_YELLOW: '#F8C914',
    METALIC_YELLOW: '#FBCD0F',
    CHINESE_BLUE: '#5764A3',
    JONQUIL: '#F8C913',
    METALIC_BLUE: '#3D467F',
    SMOKEY_TOPAZ: '#7C3810',
    OVERDROP_GREEN: '#82EB9F',
    GOLD: '#E9B008',

    // March Madness
    GRAY_GRADIENT_4: '#606A78',
    GRAY_GRADIENT_5: '#9AAEB1',
    GRAY_GRADIENT_6: '#363f4c',
    WHITE_DISABLED: '#ffffff1a',
    WHITE_GRADIENT_1: '#f6f6fe',
    GREEN_GRADIENT_1: '#00957E',
    BLUE_DARK: '#021631',
    BLUE_LIGHT: '#c4def2',
    BLUE_GRADIENT_1: '#005EB8',
    BLUE_GRADIENT_2: '#0E94CB',
    RED_GRADIENT_1: '#C12B34',
    RED_GRADIENT_2: '#CA4C53',
    ORANGE_MARCH_MADNESS: '#F25623',
    PURPLE_GRADIENT_1: '#4d21db',
    BLACK_GRADIENT_1: '#000E21',
    BLACK_GRADIENT_2: '#191C33',
};

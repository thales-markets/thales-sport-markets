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

export const FlexDivColumnStart = styled(FlexDivColumn)`
    justify-content: center;
    align-items: flex-start;
`;

export const BoldContent = styled.span`
    font-weight: 600;
`;

export const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: white;
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
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
    GREEN_LIGHT: '#3CB55B',

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
    TORY_BLUE_LIGHT: '#5E8DF0',

    // Overdrop
    YELLOW: '#F1BA20',
    YELLOW_OPACITY_60: '#F1BA2099',
    LIGHTNING_YELLOW: '#F8C914',
    METALIC_YELLOW: '#FBCD0F',
    CHINESE_BLUE: '#5764A3',
    JONQUIL: '#F8C913',
    METALIC_BLUE: '#3D467F',
    SMOKEY_TOPAZ: '#7C3810',
    OVERDROP_GREEN: '#82EB9F',
    GOLD: '#E9B008',
    PARTICLE: '#d745ff',

    // Speed markets
    DARK_KNIGHT: '#161A36',
    BLUE_ESTATE: '#3b4887',
    LIBERTY_BLUE: '#10152E',
    HONEYCOMB: '#DCA212',
    GOLDENROD: '#F9CB15',
};

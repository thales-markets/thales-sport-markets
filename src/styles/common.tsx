import styled from 'styled-components';

export const FlexDiv = styled.div`
    display: flex;
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

export const Colors = {
    GRAY: '#303656',
    GRAY_LIGHT: '#5F6180',
    GRAY_DARK: '#1A1C2B',

    // specific shades for odds background display
    GRAY_SECOND: '#242842',
    GRAY_RESOLVED: 'rgb(36,41,64, 0.5)',
    GRAY_GRADIENT_1: '#23273e',
    GRAY_GRADIENT_2: '#2f3454',
    GRAY_GRADIENT_3: '#2c3250',
    GRAY_GRADIENT_4: '#606A78', // used for March Madness
    GRAY_GRADIENT_5: '#9AAEB1', // used for March Madness
    GRAY_GRADIENT_6: '#363f4c', // used for March Madness

    WHITE: '#FFFFFF',
    WHITE_DISABLED: '#ffffff1a', // used for March Madness
    WHITE_GRADIENT_1: '#f6f6fe', // used for March Madness

    GREEN: '#5FC694',
    GREEN_GRADIENT_1: '#00957E', // used for March Madness

    BLUE: '#3FD1FF',
    BLUE_DARK: '#021631', // used for March Madness
    BLUE_LIGHT: '#c4def2', // used for March Madness
    BLUE_GRADIENT_1: '#005EB8', // used for March Madness
    BLUE_GRADIENT_2: '#0E94CB', // used for March Madness

    RED: '#e26a78',
    RED_GRADIENT_1: '#C12B34', // used for March Madness
    RED_GRADIENT_2: '#CA4C53', // used for March Madness

    ORANGE: '#FAC439',
    ORANGE_MARCH_MADNESS: '#F25623', // used for March Madness

    PURPLE: '#8884d8',
    PURPLE_GRADIENT_1: '#4d21db', // used for March Madness

    BLACK: '#000000', // used for March Madness
    BLACK_GRADIENT_1: '#000E21', // used for March Madness
    BLACK_GRADIENT_2: '#191C33', // used for March Madness
};

export const QuizQuestionDifficultyMap = ['#4673BD', '#50CE99', '#F4CF73', '#FA9E2F', '#C3244A'];

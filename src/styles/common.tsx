import styled from 'styled-components';

export const FlexDiv = styled.div`
    display: flex;
`;

export const FlexDivCentered = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
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
    GRAY_SECOND: '#242842',
    GRAY_RESOLVED: 'rgb(36,41,64, 0.5)',

    WHITE: '#FFFFFF',

    GREEN: '#5FC694',

    BLUE: '#3FD1FF',

    RED: '#e26a78',

    ORANGE: '#FAC439',
};

export const QuizQuestionDifficultyMap = ['#4673BD', '#50CE99', '#F4CF73', '#FA9E2F', '#C3244A'];

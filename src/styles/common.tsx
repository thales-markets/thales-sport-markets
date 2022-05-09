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

export const FlexDivColumnCentered = styled(FlexDivColumn)`
    justify-content: center;
`;

export const Colors = {
    PURPLE: '#6c438a',
    PURPLE_LIGHT: '#c4b3d0',
    PURPLE_DARK: '#3B235F',
    GRAY: '#303656',
    GRAY_LIGHT: '#5F6180',
    GRAY_DARK: '#1A1C2B',
    WHITE: '#FFFFFF',
    GREEN: '#5FC694',
    BLUE: '#40a1d8',
    RED: '#e26a78',
};

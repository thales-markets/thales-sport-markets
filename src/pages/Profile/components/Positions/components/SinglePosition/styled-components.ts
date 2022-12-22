import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';
import { Value } from '../ParlayPosition/styled-components';

export const Wrapper = styled(FlexDivRow)`
    align-items: center;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 4px;
    padding: 7px 10px;
    width: 100%;
    margin-bottom: 5px;
    position: relative;
    @media (max-width: 768px) {
        padding: 7px 5px;
    }
`;

export const ResultContainer = styled(FlexDivRow)`
    align-items: center;
    margin-left: 15px;
    min-width: 100px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        margin-left: 5;
        flex-direction: column;
        min-width: 40px;
    }
`;

export const PositionContainer = styled(FlexDivRow)`
    align-items: center;
    margin-left: 15px;
    justify-content: flex-start;
    @media (max-width: 768px) {
        margin-left: 5px;
        flex-direction: column;
        min-width: 20px;
    }
`;

export const BoldValue = styled(Value)`
    font-weight: 700;
`;

export const ColumnDirectionInfo = styled(FlexDivColumnNative)`
    min-width: 100px;
    margin-left: 25px;
    :last-of-type {
        margin-left: 10px;
    }
    @media (max-width: 768px) {
        min-width: 40px;
    }
`;

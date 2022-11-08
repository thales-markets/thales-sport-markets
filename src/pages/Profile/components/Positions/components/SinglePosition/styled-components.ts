import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';
import { Value } from '../ParlayPosition/styled-components';

export const Wrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: flex-start;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 4px;
    padding: 7px 10px;
    width: 100%;
    margin-bottom: 5px;
    position: relative;
    @media (max-width: 768px) {
        justify-content: space-between;
    }
`;

export const GameParticipantsWrapper = styled(FlexDivRow)`
    align-items: center;
    @media (max-width: 768px) {
        width: 65%;
    }
`;

export const TeamContainer = styled(FlexDivRow)`
    align-items: center;
    justify-content: flex-start;
    width: 150px;
    @media (max-width: 768px) {
        flex-direction: column !important;
        font-size: 9px !important;
        justify-content: center;
        text-align: center;
        width: 50%;
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
        margin-left: 5;
        flex-direction: column;
        min-width: 20px;
    }
`;

export const BoldValue = styled(Value)`
    font-weight: 700;
`;

export const ClaimInfoContainer = styled(ResultContainer)`
    margin-right: 10px;
    @media (max-width: 768px) {
        margin-right: 5px;
        min-width: 50px;
        flex-direction: column;
    }
`;

export const ColumnDirectionInfo = styled(FlexDivColumnNative)`
    margin-left: 20px;
    @media (max-width: 768px) {
        min-width: 40px;
        margin-left: 15px;
    }
`;

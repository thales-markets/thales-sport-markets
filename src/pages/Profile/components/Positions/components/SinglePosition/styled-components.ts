import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';
import { Value } from '../ParlayPosition/styled-components';

export const Wrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: flex-start;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 4px;
    padding: 5px 10px;
    width: 100%;
    margin-bottom: 5px;
`;

export const TeamContainer = styled(FlexDivRow)`
    align-items: center;
    justify-content: flex-start;
    width: 150px;
`;

export const ResultContainer = styled(FlexDivRow)`
    align-items: center;
    margin-left: 15px;
`;

export const BoldValue = styled(Value)`
    font-weight: 700;
`;

export const ClaimInfoContainer = styled(ResultContainer)`
    margin-right: 10px;
`;

export const ColumnDirectionInfo = styled(FlexDivColumnNative)`
    margin-left: 20px;
`;

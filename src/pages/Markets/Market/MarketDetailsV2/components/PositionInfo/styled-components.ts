import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 15px;
    padding: 17px 20px;
`;

export const PositionItemContainer = styled(FlexDivRowCentered)`
    margin-bottom: 10px;
`;

export const Label = styled.span`
    font-size: 15px;
    font-weight: 400;
    color: ${MAIN_COLORS.TEXT.BLUE};
    text-transform: uppercase;
    margin-bottom: 10px;
`;

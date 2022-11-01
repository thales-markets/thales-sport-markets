import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
`;

// --> Category Elements
export const CategoryContainer = styled(FlexDiv)`
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin: 5px 0px;
`;

export const CategoryLabel = styled.span`
    font-weight: 700;
    font-size: 14px;
    line-height: 110%;
    color: ${MAIN_COLORS.TEXT.WHITE};
    text-transform: uppercase;
    cursor: pointer;
`;

export const CategoryIcon = styled.i`
    font-size: 20px;
    color: ${MAIN_COLORS.TEXT.DARK_GRAY};
    margin-right: 20px;
`;
//  ------------------------------------------------

export const ListContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

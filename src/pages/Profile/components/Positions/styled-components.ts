import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    min-width: 668px;
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
    font-size: 24px;
    color: ${MAIN_COLORS.TEXT.DARK_GRAY};
    margin-right: 20px;
`;

export const Arrow = styled.i`
    font-size: 18px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-left: 15px;
`;

//  ------------------------------------------------

export const EmptyContainer = styled(FlexDivRowCentered)`
    width: 100%;
    text-align: center;
    justify-content: center;
`;

export const ListContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    min-width: 668px;
    @media (max-width: 768px) {
        min-width: auto;
    }
`;

// --> Category Elements
export const CategoryContainer = styled(FlexDiv)`
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin: 20px 0px;
`;

export const CategoryLabel = styled.span`
    font-weight: 700;
    font-size: 14px;
    line-height: 110%;
    color: ${MAIN_COLORS.TEXT.WHITE};
    text-transform: uppercase;
    cursor: pointer;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const CategoryIcon = styled.i`
    font-size: 24px;
    color: ${MAIN_COLORS.TEXT.DARK_GRAY};
    margin-right: 20px;
    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

export const Arrow = styled.i`
    font-size: 18px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-left: 15px;
    @media (max-width: 768px) {
        font-size: 10px;
    }
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

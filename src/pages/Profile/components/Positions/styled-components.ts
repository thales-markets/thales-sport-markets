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
    flex-direction: column;
    align-items: start;
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

export const CategoryDisclaimer = styled.div`
    padding-top: 5px;
    margin-left: 45px;
    font-size: 13px;
    @media (max-width: 768px) {
        font-size: 11px;
        margin-left: 15px;
    }
`;

//  ------------------------------------------------

export const EmptyContainer = styled(FlexDivRowCentered)`
    width: 100%;
    text-align: center;
    justify-content: space-evenly;
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border-radius: 4px;
    height: 200px;
    flex-direction: column;
`;

export const EmptyTitle = styled.span`
    font-family: 'Nunito';
    font-weight: bold;
    color: #64d9fe;
    text-transform: uppercase;
    font-size: 16px;
    letter-spacing: 0.025em;
`;
export const EmptySubtitle = styled.span`
    font-family: 'Nunito';
    color: #64d9fe;
    font-size: 12px;
    width: 180px;
    letter-spacing: 0.025em;
`;

export const ListContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

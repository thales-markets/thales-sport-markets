import { ReactComponent as OvertimeTicket } from 'assets/images/parlay-empty.svg';
import styled, { CSSProperties } from 'styled-components';
import {
    FlexDivColumn,
    FlexDivColumnNative,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    min-width: 668px;
    @media (max-width: 950px) {
        min-width: auto;
    }
`;

export const CategoryContainer = styled(FlexDivSpaceBetween)`
    width: 100%;
    margin: 15px 0px;
    position: relative;
    color: ${(props) => props.theme.textColor.primary};
    align-items: center;
    cursor: pointer;
`;

export const CategoryInfo = styled(FlexDivStart)`
    align-items: center;
`;

export const CategoryLabel = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    @media (max-width: 767px) {
        font-size: 10px;
    }
`;

export const CategoryIcon = styled.i`
    font-size: 20px;
    margin-right: 15px;
    margin-top: -2px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 767px) {
        font-size: 15px;
        margin-right: 5px;
    }
`;

export const Arrow = styled.i`
    font-size: 16px;
    margin-right: 10px;
    text-transform: none;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 767px) {
        font-size: 10px;
        margin-right: 8px;
    }
`;

export const CategoryDisclaimer = styled.div`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => props.theme.status.loss};
    @media (max-width: 767px) {
        font-size: 10px;
        margin-left: 10px;
        margin-right: 10px;
    }
`;

export const EmptyContainer = styled(FlexDivRowCentered)`
    width: 100%;
    text-align: center;
    justify-content: space-evenly;
    background: ${(props) => props.theme.background.secondary};
    border-radius: 7px;
    height: 200px;
    flex-direction: column;
`;

export const EmptyTitle = styled.span`
    font-weight: bold;
    color: ${(props) => props.theme.textColor.quaternary};
    text-transform: uppercase;
    font-size: 16px;
    letter-spacing: 0.025em;
`;

export const StyledParlayEmptyIcon = styled(OvertimeTicket)`
    path {
        fill: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const EmptySubtitle = styled.span`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 12px;
    width: 180px;
    letter-spacing: 0.025em;
`;

export const ListContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

export const ClaimAllContainer = styled(FlexDivColumnNative)`
    min-width: 100px;
    align-items: end;
    justify-content: flex-end;
    margin-bottom: 10px;
    margin-right: 40px;
    @media (max-width: 767px) {
        min-width: 60px;
        margin-right: 30px;
    }
    button {
        margin-top: 2px;
        @media (max-width: 767px) {
            margin-top: 0px;
        }
    }
`;

export const additionalClaimButtonStyle: CSSProperties = {
    minWidth: '100px',
    maxWidth: '100px',
};

export const additionalClaimButtonStyleMobile: CSSProperties = {
    minWidth: '65px',
    maxWidth: '80px',
};

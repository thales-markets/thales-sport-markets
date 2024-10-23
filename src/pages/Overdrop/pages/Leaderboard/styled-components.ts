import styled from 'styled-components';
import { FlexDivEnd, FlexDivRow } from 'styles/common';

export const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center',
};

export const tableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '10px 0',
    flexDirection: 'column',
    gap: '3px',
    height: '50px',
    marginLeft: '5px',
};

export const StickyRow = styled.div`
    margin-top: 5px;
    margin-left: 5px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    border-radius: 25px;
    background-color: ${(props) => props.theme.overdrop.textColor.primary};
    color: black;
`;

export const StickyRowCardContainer = styled.div`
    [role='row'] {
        background-color: ${(props) => props.theme.overdrop.textColor.primary};
    }
    [role='row'] > div > div {
        color: black !important;
    }
`;

export const StickyContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;

export const StickyCell = styled.div<{ width?: string }>`
    width: ${(props) => props.width || '150px'};
    display: flex;
    text-align: center;
    justify-content: center;
    padding: 10px 0px;
    flex-direction: column;
    gap: 3px;
    height: 40px;
    font-size: 12px;
    font-weight: bold;
`;

export const Badge = styled.img`
    width: 55px;
    margin-left: -7px;
`;

export const AddressContainer = styled.div`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`;

export const TableContainer = styled.div`
    @media (max-width: 767px) {
        & > div > div {
            padding-top: 20px;
        }
        [role='row'] {
            padding: 10px 0px;
            margin-left: 20px;
            margin-bottom: 20px;
        }
        [id='level.smallBadgeHeader'] {
            display: none;
        }
        [id='level.smallBadge'] {
            position: absolute;
            top: -38px;
            left: -15px;
            justify-content: inherit;
        }
    }
`;

export const SearchFieldContainer = styled(FlexDivEnd)`
    padding-right: 10px;
    margin-bottom: 10px;
    input {
        border: 1px solid rgb(78, 95, 177);
        color: rgb(78, 95, 177);
        border-radius: 20px;
    }
    input::placeholder {
        color: rgb(78, 95, 177);
    }
    input:focus {
        border: 1px solid rgb(78, 95, 177) !important;
    }
    i::before {
        color: rgb(78, 95, 177);
    }
    @media (max-width: 767px) {
        & > div {
            padding-top: 0 !important;
        }
    }
`;

export const HeaderContainer = styled(FlexDivRow)`
    align-items: center;
`;

export const Disclaimer = styled.span`
    font-size: 12px;
    font-style: italic;
`;

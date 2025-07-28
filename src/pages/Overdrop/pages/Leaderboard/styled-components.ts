import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivEnd, FlexDivRow, FlexDivSpaceBetween } from 'styles/common';

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
    border-radius: 30px;
    padding: 4px 0;
    background: ${(props) => props.theme.overdrop.background.quinary};
    flex: 1;
    div {
        width: 100%;
    }
    input {
        width: 100%;
        border: none;
        color: rgb(78, 95, 177);
        border-radius: 20px;
    }
    input::placeholder {
        color: rgb(78, 95, 177);
    }
    input:focus {
        border: none !important;
    }
    i::before {
        color: rgb(78, 95, 177);
    }
    @media (max-width: 767px) {
        padding-top: 0 !important;
        & > div {
            padding-top: 0 !important;
        }
    }
`;

export const HeaderContainer = styled(FlexDivRow)`
    position: relative;
    align-items: center;
    padding: 10px;
    background: ${(props) => props.theme.overdrop.background.active};
    gap: 10px;
`;

export const MonthsContainer = styled(FlexDivRow)<{ visible?: boolean }>`
    position: relative;
    align-items: center;
    margin-bottom: 10px;
    padding: ${(props) => (props.visible ? '10px' : '0')};
    background: ${(props) => props.theme.overdrop.background.active};
    gap: 10px;
    @media (max-width: 767px) {
        overflow: auto;
    }
`;

export const MonthsInnerContainer = styled(FlexDivRow)`
    background: ${(props) => props.theme.overdrop.background.quinary};
    flex: 1;
    padding: 10px 20px;
    border-radius: 12px;
    text-transform: uppercase;
    @media (max-width: 767px) {
        padding-top: 0 !important;
    }
`;

export const MonthButton = styled.span<{ disabled?: boolean; selected?: boolean }>`
    font-weight: 500;
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    padding: 5px 15px;
    border-radius: 5px;
    background: ${(props) =>
        props.selected ? props.theme.button.background.quaternary : props.theme.overdrop.background.quinary};
    color: ${(props) => (props.selected ? props.theme.background.quinary : props.theme.textColor.primary)};
`;

export const Disclaimer = styled.span`
    margin: 10px;
    font-size: 12px;
    font-style: italic;
`;

export const DropdownButton = styled(FlexDivSpaceBetween)`
    background: ${(props) => props.theme.overdrop.background.octonary};
    padding: 8px;
    border-radius: 5px;
    width: 250px;
    cursor: pointer;
    @media (max-width: 767px) {
        width: 49%;
        padding-top: 0 !important;
    }
`;

export const DropdownContainer = styled.div`
    position: absolute;
    width: 250px;
    top: 50px;
    left: 10px;
    z-index: 1000;
`;

export const DropDown = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.secondary};
    color: white;
    border-radius: 5px;
    position: absolute;
    padding: 4px;
    width: 100%;
    gap: 2px;
`;

export const DropDownItem = styled(FlexDiv)<{ isSelected: boolean }>`
    padding: 7px 10px;
    cursor: ${(props) => (props.isSelected ? 'default' : 'pointer')};
    ${(props) => (props.isSelected ? `background: ${props.theme.dropDown.menuItem.selectedColor.primary};` : '')}
    border-radius: 5px;
    &:hover {
        ${(props) => (props.isSelected ? '' : `background: ${props.theme.dropDown.menuItem.hoverColor.primary};`)}
    }
`;

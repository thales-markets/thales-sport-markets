import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDiv)`
    margin-bottom: 10px;
    align-items: center;
    @media (max-width: 950px) {
        margin: 10px 5px;
    }
`;

export const NoScrollbarContainer = styled.div`
    width: 100%;
    overflow: hidden;
    & .react-horizontal-scrolling-menu--scroll-container {
        ::-webkit-scrollbar {
            display: none;
        }
    }
    & .react-horizontal-scrolling-menu--scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .react-horizontal-scrolling-menu--inner-wrapper {
        align-items: center;
    }
    .react-horizontal-scrolling-menu--arrow-left,
    .react-horizontal-scrolling-menu--arrow-right {
        min-width: 10px;
    }
`;

export const MarketTypeButton = styled.button<{ selected?: boolean }>`
    width: 100%;
    border-radius: 5px;
    border: 1px solid
        ${({ theme, selected }) => (selected ? theme.button.textColor.quaternary : theme.button.background.secondary)};
    height: 28px;
    margin-right: 5px;
    cursor: pointer;
    white-space: nowrap;
    width: fit-content;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 10px;
    background: ${({ theme }) => theme.button.background.secondary};
    color: ${({ theme, selected }) => (selected ? theme.button.textColor.quaternary : theme.textColor.secondary)};
    :focus {
        outline: none;
    }
    @media (max-width: 950px) {
        height: 22px;
        padding: 2px 10px;
    }
`;

export const ArrowIcon = styled.i<{ hide: boolean; hideBoth: boolean; isLeft?: boolean }>`
    cursor: pointer;
    font-size: 20px;
    transform: ${(props) => (props.isLeft ? 'rotate(90deg)' : 'rotate(270deg)')};
    color: ${(props) => props.theme.textColor.secondary};
    display: ${(props) => (props.hideBoth ? 'none' : 'block')};
    opacity: ${(props) => (props.hide ? '0.2' : '1')};
    padding: 0px 5px;
    @media (max-width: 950px) {
        font-size: 16px;
    }
`;

export const FilterIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 950px) {
        font-size: 18px;
    }
`;

export const SwitchContainer = styled(FlexDiv)`
    justify-content: center;
    @media (max-width: 950px) {
        display: none;
    }
`;

export const FilterContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
`;

export const ThreeWayIcon = styled.i<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'deafult' : 'pointer')};
    font-size: 20px;
    color: ${(props) => props.theme.textColor.secondary};
    opacity: ${(props) => (props.disabled ? '0.2' : '1')};
`;

export const SortSelector = styled(FlexDivCentered)`
    position: relative;
    height: 20px;
`;

export const SortMenu = styled(FlexDivColumn)`
    position: absolute;
    gap: 2px;
    top: 24px;
    right: 0px;
    width: 200px;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.dropDown.menu.borderColor.primary};
    background: ${(props) => props.theme.dropDown.menu.background.primary};
    z-index: 1000;
`;

export const SortMenuItem = styled.div<{ isSelected: boolean }>`
    padding: 7px 10px;
    border-radius: 8px;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    cursor: ${(props) => (props.isSelected ? 'default' : 'pointer')};
    ${(props) => (props.isSelected ? `background: ${props.theme.dropDown.menuItem.selectedColor.primary};` : '')}
    &:hover {
        ${(props) => (props.isSelected ? '' : `background: ${props.theme.dropDown.menuItem.hoverColor.primary};`)}
    }
`;

export const HeaderIcon = styled.i<{
    iconSize?: number;
    iconColor?: string;
}>`
    font-size: ${(props) => (props.iconSize ? props.iconSize : '20')}px;
    color: ${(props) => (props.iconColor ? props.iconColor : props.theme.textColor.secondary)};
`;

export const TimeContainer = styled(FlexDivRowCentered)`
    position: relative;
    cursor: pointer;
`;

export const SettingsContainer = styled(FlexDivRowCentered)`
    position: relative;
    width: 130px;
    cursor: pointer;
`;

export const Divider = styled.div`
    width: 2px;
    background-color: ${(props) => props.theme.textColor.secondary};
    height: 24px;
`;

export const SortIndicator = styled.i`
    font-size: 18px;
    text-transform: none;
    color: ${(props) => props.theme.dropDown.indicatorColor.primary};
    cursor: pointer;
`;

export const DropdownContainer = styled.div`
    position: absolute;
    width: 180px;
    top: 24px;
    right: 0;
    z-index: 1000;
`;

export const DropDown = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.secondary};
    color: white;
    border-radius: 5px;
    position: absolute;
    margin-top: 2px;
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

export const Label = styled.div`
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: white;
    display: block;
    text-transform: capitalize;
`;

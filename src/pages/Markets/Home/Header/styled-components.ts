import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Container = styled(FlexDiv)`
    max-width: 806px;
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
    min-width: 30px;
    justify-content: center;
    margin-left: 20px;
    @media (max-width: 950px) {
        display: none;
    }
`;

export const ThreeWayIcon = styled.i<{ disabled: boolean; fontSize: number }>`
    cursor: ${(props) => (props.disabled ? 'deafult' : 'pointer')};
    font-size: ${(props) => props.fontSize}px;
    color: ${(props) => props.theme.textColor.secondary};
    opacity: ${(props) => (props.disabled ? '0.2' : '1')};
`;

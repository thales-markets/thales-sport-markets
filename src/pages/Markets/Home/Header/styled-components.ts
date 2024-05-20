import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Container = styled(FlexDiv)`
    max-width: 806px;
    margin-top: 10px;
    margin-bottom: 10px;
    align-items: center;
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
`;

export const MarketTypesContainer = styled(FlexDiv)`
    width: 100%;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    ::-webkit-scrollbar {
        display: none;
    }
`;

export const MarketTypeButton = styled.button<{ selected?: boolean }>`
    width: 100%;
    border-radius: 5px;
    border: none;
    height: 30px;
    margin-right: 5px;
    cursor: pointer;
    white-space: nowrap;
    width: fit-content;
    font-weight: bold;
    padding: 2px 10px;
    background: ${({ theme, selected }) =>
        selected ? theme.button.background.quaternary : theme.button.background.secondary};
    color: ${({ theme, selected }) => (selected ? theme.textColor.senary : theme.textColor.secondary)};
    :focus {
        outline: none;
    }
`;

export const ArrowIcon = styled.i<{ hide: boolean; flip?: boolean; hideBoth?: boolean }>`
    cursor: pointer;
    font-size: 25px;
    transform: ${(props) => (props.flip ? 'rotate(180deg)' : 'none')};
    color: ${(props) => props.theme.textColor.secondary};
    opacity: ${(props) => (props.hide ? '0' : '1')};
    display: ${(props) => (props.hideBoth ? 'none' : 'block')};
`;

export const ThreeWayIcon = styled.i`
    cursor: pointer;
    font-size: 20px;
    color: ${(props) => props.theme.textColor.secondary};
    margin: 0 5px;
`;

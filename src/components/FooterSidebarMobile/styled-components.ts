import styled from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';

export const Container = styled(FlexDiv)`
    position: fixed;
    bottom: 3%;
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
    height: 40px;
    color: ${(props) => props.theme.background.primary};
    background: ${(props) => props.theme.background.septenary};
    border-radius: 40px;
    justify-content: space-around;
    z-index: 3;
`;

export const ItemContainer = styled(FlexDiv)`
    justify-content: center;
    align-self: center;
    position: relative;
`;

export const ItemIcon = styled.i<{ parlay?: boolean; iteration?: number; fontSize?: number }>`
    font-size: ${(props) => props.fontSize || 33}px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => props.theme.background.primary};

    &.pulse {
        animation: pulsing 1s ease-in;
        animation-iteration-count: ${(props) =>
            props.iteration && props.iteration > 0
                ? props.iteration == 1
                    ? props.iteration + 1 + ';'
                    : props.iteration + ';'
                : ''};

        @keyframes pulsing {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    }
`;

export const DropdownContainer = styled.div`
    position: absolute;
    width: 180px;
    left: 20px;
    top: 146px;
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
`;

export const DropDownItem = styled(FlexDiv)`
    padding: 7px 10px 9px 10px;
    cursor: pointer;
    &:hover {
        background: ${(props) => props.theme.background.tertiary};
        border-radius: 5px;
    }
`;

export const Label = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: white;
    display: block;
    text-transform: capitalize;
`;

export const ParlayNumber = styled.span`
    font-weight: 800;
    font-size: 14px;
    line-height: 14px;
    color: ${(props) => props.theme.background.primary};
    display: block;
    text-transform: capitalize;
    position: absolute;
    bottom: 11px;
    left: 8px;
    background: ${(props) => props.theme.background.septenary};
    padding: 0 2px;
`;

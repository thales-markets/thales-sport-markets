import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Container = styled(FlexDiv)`
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
    height: 48px;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.secondary};
    justify-content: space-around;
    z-index: 11;
`;

export const ItemContainer = styled(FlexDiv)`
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    align-self: center;
    position: relative;
`;

export const ItemLabel = styled.p`
    font-size: 10px;
    font-weight: 600;
`;

export const ItemIcon = styled.i<{ parlay?: boolean; iteration?: number; fontSize?: number }>`
    font-size: ${(props) => props.fontSize || 20}px;
    font-weight: 400;
    text-transform: none;
    margin: auto;
    color: ${(props) => props.theme.textColor.primary};

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

export const ParlayNumber = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${(props) => props.theme.background.primary};
    display: block;
    text-transform: capitalize;
    position: absolute;
    bottom: 15px;
    left: 6px;
    background: ${(props) => props.theme.background.septenary};
    padding: 3px 5px;
`;

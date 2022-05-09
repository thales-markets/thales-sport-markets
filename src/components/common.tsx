import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

export const BondInfo = styled(FlexDivColumn)`
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
    text-align: justify;
    max-width: 500px;
    ul {
        list-style: initial;
    }
    li {
        line-height: 16px;
        margin-bottom: 8px;
    }
`;

export const Info = styled(FlexDivCentered)<{ fontSize?: number; marginTop?: number; marginBottom?: number }>`
    font-style: normal;
    font-weight: 300;
    font-size: ${(props) => props.fontSize || 15}px;
    line-height: 120%;
    white-space: nowrap;
    margin-top: ${(props) => props.marginTop || 0}px;
    margin-bottom: ${(props) => props.marginBottom || 0}px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const InfoLabel = styled.span`
    margin-right: 4px;
`;

export const InfoContent = styled.span`
    font-weight: 700;
`;

export const MainInfo = styled(Info)`
    font-weight: bold;
    font-size: 25px;
    line-height: 35px;
`;

export const Positions = styled(FlexDivColumn)`
    margin-bottom: 20px;
    align-items: center;
`;

export const PositionContainer = styled(FlexDivColumn)`
    margin-bottom: 15px;
    cursor: pointer;
    align-items: center;
    color: ${(props) => props.theme.textColor.primary};
    :hover:not(.disabled):not(.maturity) {
        transform: scale(1.05);
    }
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
    &.selected {
        color: ${(props) => props.theme.button.textColor.primary};
        background: ${(props) => props.theme.button.background.secondary};
        border: 1px solid ${(props) => props.theme.button.background.secondary};
        i {
            :before {
                color: ${(props) => props.theme.button.textColor.primary};
            }
        }
        div {
            color: ${(props) => props.theme.button.textColor.primary};
        }
    }
    &.maturity:not(.disabled) {
        cursor: default;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
    }
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 10px 20px;
    border-radius: 15px;
    width: 350px;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

export const Position = styled.span`
    align-self: center;
    display: block;
    position: relative;
`;

export const PositionLabel = styled.span<{ hasPaddingLeft?: boolean }>`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 30px;
    text-align: center;
    padding-left: ${(props) => (props.hasPaddingLeft ? 35 : 0)}px;
`;

export const Checkmark = styled.span`
    :after {
        content: '';
        position: absolute;
        left: 10px;
        top: 12px;
        width: 8px;
        height: 22px;
        border: solid ${(props) => props.theme.borderColor.primary};
        border-width: 0 4px 4px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

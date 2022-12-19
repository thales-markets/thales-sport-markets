import Tooltip from 'components/Tooltip';
import { MAIN_COLORS } from 'constants/ui';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

type SymbolProps = {
    symbolText: string;
    symbolColor?: string;
    symbolBottomText?: {
        text?: string;
        tooltip?: string;
        textStyle?: CSSProperties;
    };
    symbolUpperText?: {
        text?: string;
        tooltip?: string;
        textStyle?: CSSProperties;
    };
    selected?: boolean;
    disabled?: boolean;
    additionalStyle?: CSSProperties;
    glow?: boolean;
    flexDirection?: string;
    onClick?: () => void;
};

const PositionSymbol: React.FC<SymbolProps> = ({
    symbolText,
    symbolColor,
    symbolBottomText,
    symbolUpperText,
    selected,
    disabled,
    additionalStyle,
    glow,
    flexDirection,
    onClick,
}) => {
    const notClickable = !onClick;

    return (
        <Wrapper
            disabled={disabled}
            flexDirection={flexDirection}
            notClickable={notClickable}
            onClick={() => {
                onClick && onClick();
            }}
        >
            <Symbol
                glow={glow}
                color={symbolColor}
                style={additionalStyle}
                selected={selected}
                notClickable={notClickable}
                flexDirection={flexDirection}
                disabled={disabled}
            >
                {symbolText}
                {symbolUpperText && <UpperText style={symbolUpperText.textStyle}>{symbolUpperText.text}</UpperText>}
            </Symbol>
            {symbolBottomText && (
                <BottomText style={symbolBottomText.textStyle} flexDirection={flexDirection} color={symbolColor}>
                    {symbolBottomText.text}
                    {symbolBottomText.tooltip && (
                        <Tooltip overlay={<>{symbolBottomText.tooltip}</>} iconFontSize={11} marginLeft={3} />
                    )}
                </BottomText>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)<{ disabled?: boolean; flexDirection?: string; notClickable?: boolean }>`
    cursor: ${(props) => (props.disabled || props.notClickable ? 'default' : 'pointer')};
    align-items: center;
    flex-direction: ${(props) => (props.flexDirection ? props.flexDirection : 'row')};
`;

const Symbol = styled(FlexDivCentered)<{
    glow?: boolean;
    color?: string;
    selected?: boolean;
    disabled?: boolean;
    notClickable?: boolean;
    flexDirection?: string;
}>`
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 60%;
    color: ${(props) => (props.selected ? MAIN_COLORS.TEXT.BLUE : props.color || MAIN_COLORS.TEXT.WHITE)};
    font-size: 12px;
    font-weight: 400;
    line-height: 100%;
    opacity: ${(props) => (props.disabled ? 0.4 : 1)};
    border: ${(props) =>
        `3px solid ${
            props.glow
                ? props.color || MAIN_COLORS.BORDERS.WHITE
                : props.selected
                ? MAIN_COLORS.BORDERS.BLUE
                : MAIN_COLORS.BORDERS.GRAY
        }`};
    box-shadow: ${(props) => (props.glow ? `0 0 6px 2px ${props.color || MAIN_COLORS.BORDERS.WHITE}` : '')};
    margin: ${(props) => (props.flexDirection === 'column' ? '0 10px' : '0 0')};
    @media (hover: hover) {
        :hover {
            border-color: ${(props) => (props.disabled || props.notClickable ? '' : MAIN_COLORS.BORDERS.BLUE)};
            color: ${(props) => (props.disabled || props.notClickable ? '' : MAIN_COLORS.BORDERS.BLUE)};
        }
    }
    // @media (max-width: 575px) {
    //     width: 25px;
    //     height: 25px;
    // }
`;

const BottomText = styled.span<{
    flexDirection?: string;
    color?: string;
}>`
    font-size: 12px;
    margin-top: ${(props) => (props.flexDirection === 'column' ? 2 : 0)}px;
    margin-right: ${(props) => (props.flexDirection === 'column' ? 0 : 10)}px;
    color: ${(props) => props.color || MAIN_COLORS.TEXT.WHITE};
`;

const UpperText = styled(FlexDivCentered)`
    position: absolute;
    top: -7px;
    left: 15px;
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    border-radius: 60%;
    font-weight: 700;
    background: ${MAIN_COLORS.LIGHT_GRAY};
    padding: 2px;
`;

export default PositionSymbol;

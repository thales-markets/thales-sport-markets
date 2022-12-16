import Tooltip from 'components/Tooltip';
import { MAIN_COLORS } from 'constants/ui';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

type SymbolProps = {
    symbolText: string;
    symbolColor?: string;
    symbolFontSize?: number;
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
    symbolFontSize,
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
                fontSize={symbolFontSize}
            >
                {symbolText}
                {symbolUpperText && (
                    <UpperText style={symbolUpperText.textStyle}>
                        <span>{symbolUpperText.text}</span>
                    </UpperText>
                )}
            </Symbol>
            {symbolBottomText && (
                <BottomText style={symbolBottomText.textStyle} flexDirection={flexDirection}>
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
    fontSize?: number;
}>`
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 60%;
    color: ${(props) => (props.selected ? MAIN_COLORS.TEXT.BLUE : props.color || MAIN_COLORS.TEXT.WHITE)};
    font-size: ${(props) => props.fontSize || 12}px;
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
    :hover {
        border: ${(props) => (props.disabled || props.notClickable ? '' : `3px solid ${MAIN_COLORS.BORDERS.BLUE}`)};
        color: ${(props) => (props.disabled || props.notClickable ? '' : MAIN_COLORS.BORDERS.BLUE)};
    }
    @media (max-width: 575px) {
        width: 25px;
        height: 25px;
    }
`;

const BottomText = styled.span<{
    flexDirection?: string;
}>`
    font-size: 13px;
    margin-top: ${(props) => (props.flexDirection === 'column' ? 2 : 0)}px;
    margin-right: ${(props) => (props.flexDirection === 'column' ? 0 : 10)}px;
    @media (max-width: 575px) {
        font-size: 12px;
    }
`;

const UpperText = styled(FlexDivCentered)`
    position: absolute;
    top: -7px;
    right: -18px;
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    border-radius: 60%;
    font-weight: 700;
    background: #252940;
    padding: 2px;
`;

export default PositionSymbol;

import Tooltip from 'components/Tooltip';
import { MAIN_COLORS } from 'constants/ui';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

type SymbolProps = {
    symbolText: string;
    symbolColor?: string;
    tooltip?: (() => React.ReactNode) | React.ReactNode;
    symbolAdditionalText?: {
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
    tooltip,
    symbolColor,
    symbolAdditionalText,
    symbolUpperText,
    selected,
    disabled,
    additionalStyle,
    glow,
    flexDirection,
    onClick,
}) => {
    const notClickable = !onClick;

    const getSymbol = () => (
        <Symbol
            glow={glow}
            color={symbolColor}
            style={additionalStyle}
            selected={selected}
            notClickable={notClickable}
            flexDirection={flexDirection}
            disabled={disabled}
            onClick={() => {
                onClick && onClick();
            }}
        >
            {symbolText}
            {symbolUpperText && <UpperText style={symbolUpperText.textStyle}>{symbolUpperText.text}</UpperText>}
        </Symbol>
    );

    return (
        <Wrapper flexDirection={flexDirection}>
            {tooltip ? <Tooltip overlay={tooltip} component={getSymbol()} /> : getSymbol()}
            {symbolAdditionalText && (
                <BottomText style={symbolAdditionalText.textStyle} flexDirection={flexDirection} color={symbolColor}>
                    {symbolAdditionalText.text}
                    {symbolAdditionalText.tooltip && (
                        <Tooltip overlay={<>{symbolAdditionalText.tooltip}</>} iconFontSize={11} marginLeft={3} />
                    )}
                </BottomText>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)<{ flexDirection?: string }>`
    align-items: center;
    flex-direction: ${(props) => (props.flexDirection ? props.flexDirection : 'row')};
    font-size: 12px;
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
    cursor: ${(props) => (props.disabled || props.notClickable ? 'default' : 'pointer')};
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
    margin: ${(props) => (props.flexDirection === 'column' ? '0 9px' : '0 0')};
    @media (hover: hover) {
        :hover {
            border-color: ${(props) => (props.disabled || props.notClickable ? '' : MAIN_COLORS.BORDERS.BLUE)};
            color: ${(props) => (props.disabled || props.notClickable ? '' : MAIN_COLORS.BORDERS.BLUE)};
        }
    }
    @media (max-width: 575px) {
        margin: ${(props) => (props.flexDirection === 'column' ? '0 8px' : '0 0')};
    }
`;

const BottomText = styled.span<{
    flexDirection?: string;
    color?: string;
}>`
    margin-top: ${(props) => (props.flexDirection === 'column' ? 2 : 0)}px;
    margin-right: ${(props) => (props.flexDirection === 'column' ? 0 : 10)}px;
    color: ${(props) => props.color || MAIN_COLORS.TEXT.WHITE};
`;

const UpperText = styled(FlexDivCentered)`
    position: absolute;
    top: -7px;
    left: 15px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    border-radius: 60%;
    font-weight: 700;
    background: ${MAIN_COLORS.LIGHT_GRAY};
    padding: 2px;
    font-size: 11px;
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

export default PositionSymbol;

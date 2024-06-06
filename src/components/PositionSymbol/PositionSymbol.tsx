import Tooltip from 'components/Tooltip';
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
    justifyContent?: string;
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
    justifyContent,
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
        <Wrapper flexDirection={flexDirection} justifyContent={justifyContent}>
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

const Wrapper = styled(FlexDivColumn)<{ flexDirection?: string; justifyContent?: string }>`
    align-items: center;
    flex-direction: ${(props) => (props.flexDirection ? props.flexDirection : 'row')};
    ${(props) => (props.justifyContent ? `justify-content: ${props.justifyContent};` : '')};
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
    min-width: 30px;
    width: max-content;
    height: 30px;
    border-radius: 60%;
    color: ${(props) =>
        props.selected ? props.theme.textColor.quaternary : props.color || props.theme.textColor.primary};
    cursor: ${(props) => (props.disabled || props.notClickable ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? 0.4 : 1)};
    border: ${(props) =>
        `3px solid ${
            props.glow
                ? props.color || props.theme.textColor.secondary
                : props.selected
                ? props.theme.borderColor.quaternary
                : props.theme.borderColor.primary
        }`};
    box-shadow: ${(props) => (props.glow ? `0 0 6px 2px ${props.color || props.theme.borderColor.secondary}` : '')};
    margin: ${(props) => (props.flexDirection === 'column' ? '0 9px' : '0 0')};
    @media (hover: hover) {
        :hover {
            border-color: ${(props) =>
                props.disabled || props.notClickable ? '' : props.theme.borderColor.quaternary};
            color: ${(props) => (props.disabled || props.notClickable ? '' : props.theme.borderColor.quaternary)};
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
    color: ${(props) => props.color || props.theme.textColor.primary};
`;

const UpperText = styled(FlexDivCentered)`
    position: absolute;
    top: -7px;
    left: 15px;
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 60%;
    font-weight: 600;
    background: ${(props) => props.theme.background.secondary};
    padding: 2px;
    font-size: 11px;
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

export default PositionSymbol;

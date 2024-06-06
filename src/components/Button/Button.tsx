import React, { CSSProperties } from 'react';
import styled from 'styled-components';

type ButtonProps = {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    onClick?: any;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    disabled?: boolean;
    additionalStyles?: CSSProperties;
    children?: any;
};

const Button: React.FC<ButtonProps> = ({
    width,
    height,
    padding,
    textColor,
    backgroundColor,
    borderColor,
    margin,
    onClick,
    disabled,
    additionalStyles,
    fontSize,
    fontWeight,
    lineHeight,
    children,
}) => {
    return (
        <Wrapper
            width={width}
            height={height}
            padding={padding}
            margin={margin}
            textColor={textColor}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            onClick={onClick}
            disabled={disabled}
            fontSize={fontSize}
            fontWeight={fontWeight}
            lineHeight={lineHeight}
            style={additionalStyles}
        >
            {children}
        </Wrapper>
    );
};

const Wrapper = styled.button<{
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
}>`
    display: flex;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
    width: ${(props) => props.width || 'auto'};
    min-height: ${(props) => props.height || '28px'};
    border: 1px solid ${(props) => props.borderColor || props.theme.button.borderColor.primary};
    border-radius: 5px;
    ${(props) => (props.style?.fontFamily ? `font-family: ${props.style?.fontFamily};` : '')}
    font-weight: ${(props) => props.fontWeight || '600'};
    font-size: ${(props) => props.fontSize || '15px'};
    line-height: ${(props) => props.lineHeight || 'initial'};
    cursor: pointer;
    color: ${(props) => props.textColor || props.theme.button.textColor.primary};
    background: ${(props) => props.backgroundColor || props.theme.button.background.primary};
    margin: ${(props) => props.margin || ''};
    padding: ${(props) => props.padding || '3px 30px'};
    outline: none;
    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

export default Button;

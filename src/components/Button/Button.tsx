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
}>`
    display: flex;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
    width: ${(props) => props.width || 'auto'};
    min-height: ${(props) => props.height || '28px'};
    border: 1px solid ${(props) => props.borderColor || props.theme.button.borderColor.primary};
    border-radius: 5px;
    font-weight: ${(props) => props.fontWeight || '700'};
    font-size: ${(props) => props.fontSize || '15px'};
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

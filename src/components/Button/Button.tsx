import React, { CSSProperties } from 'react';
import styled from 'styled-components';

type ButtonType = 'primary' | 'secondary' | undefined;

type ButtonProps = {
    type?: ButtonType;
    disabled?: boolean;
    onClick?: any;
    style?: CSSProperties;
    fontSize?: number;
};

const Button: React.FC<ButtonProps> = ({ type, disabled, onClick, fontSize, children, ...rest }) => {
    return (
        <StyledButton disabled={disabled} onClick={onClick} buttonType={type} fontSize={fontSize} {...rest}>
            {children}
        </StyledButton>
    );
};

const StyledButton = styled.button<{ buttonType: ButtonType; fontSize?: number }>`
    background: ${(props) =>
        props.buttonType === 'secondary'
            ? props.theme.button.background.secondary
            : props.theme.button.background.primary};
    padding: 1px 20px 0px 20px;
    border-radius: 30px;
    font-style: normal;
    font-weight: bold;
    font-size: ${(props) => props.fontSize || 18}px;
    color: ${(props) => props.theme.button.textColor.primary};
    text-align: center;
    border: none;
    outline: none;
    text-transform: none;
    cursor: pointer;
    min-height: 28px;
    width: fit-content;
    white-space: nowrap;
    &:hover {
        opacity: 0.8;
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export default Button;

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
    background: ${(props) => props.theme.button.background.secondary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 5px;
    padding: 1px 20px 1px 20px;
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => props.fontSize || 18}px;
    text-align: center;
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

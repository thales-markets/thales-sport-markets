import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

type CheckboxProps = {
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    checked: boolean;
    label?: string;
    checkboxSize?: string;
    labelFontSize?: string;
    textColor?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
    value,
    onChange,
    className,
    disabled,
    checked,
    label,
    checkboxSize,
    labelFontSize,
    textColor,
    ...rest
}) => {
    return (
        <Container
            className={`${className || ''} ${disabled ? 'disabled' : ''}`}
            fontSize={labelFontSize}
            color={textColor}
        >
            {label}
            <Input
                {...rest}
                type="checkbox"
                checked={checked}
                value={value}
                onChange={onChange}
                className={className}
                disabled={disabled}
            />
            <Checkmark className="checkmark" checkboxSize={checkboxSize} color={textColor} />
        </Container>
    );
};

const Input = styled.input`
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
`;

const Container = styled.label<{ fontSize?: string; color?: string }>`
    display: block;
    position: relative;
    padding-left: 25px;
    cursor: pointer;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-style: normal;
    font-size: ${(props) => (props.fontSize ? props.fontSize : '18px')};
    line-height: 20px;
    text-transform: uppercase;
    color: ${(props) => (props?.color ? props.color : props.theme.textColor.primary)};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    input:checked ~ .checkmark {
        background-color: transparent;
    }
    input:checked ~ .checkmark:after {
        display: block;
    }
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
    align-self: start;
    white-space: nowrap;
`;

const Checkmark = styled.span<{ checkboxSize?: string; color?: string }>`
    position: absolute;
    top: 0;
    left: 0;
    height: ${(props) => (props?.checkboxSize ? props.checkboxSize : '19px')};
    width: ${(props) => (props?.checkboxSize ? props.checkboxSize : '19px')};
    border: 2px solid ${(props) => (props?.color ? props.color : props.theme.borderColor.secondary)};
    background-color: transparent;
    border-radius: 3px;
    :after {
        content: '';
        position: absolute;
        display: none;
        left: 5px;
        top: -1px;
        width: 4px;
        height: 12px;
        border: solid ${(props) => (props?.color ? props.color : props.theme.borderColor.secondary)};
        border-width: 0 2px 2px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

export default Checkbox;

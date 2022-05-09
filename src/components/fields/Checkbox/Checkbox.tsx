import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

type CheckboxProps = {
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    checked: boolean;
    label?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ value, onChange, className, disabled, checked, label, ...rest }) => {
    return (
        <Container className={disabled ? 'disabled' : ''}>
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
            <Checkmark className="checkmark" />
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

const Container = styled.label`
    display: block;
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    font-style: normal;
    font-weight: bold;
    font-size: 40px;
    line-height: 55px;
    color: ${(props) => props.theme.textColor.primary};
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
    align-self: center;
    white-space: nowrap;
`;

const Checkmark = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    height: 29px;
    width: 29px;
    border: 3px solid ${(props) => props.theme.borderColor.primary};
    background-color: transparent;
    border-radius: 5px;
    margin-top: 12px;
    :after {
        content: '';
        position: absolute;
        display: none;
        left: 7px;
        top: -2px;
        width: 6px;
        height: 19px;
        border: solid ${(props) => props.theme.borderColor.primary};
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

export default Checkbox;

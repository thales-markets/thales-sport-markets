import Tooltip from 'components/Tooltip';
import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

type RadioButtonProps = {
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    checked: boolean;
    label?: string;
    tooltip?: string;
};

const RadioButton: React.FC<RadioButtonProps> = ({
    value,
    onChange,
    className,
    disabled,
    checked,
    label,
    tooltip,
    ...rest
}) => {
    return (
        <Container className={disabled ? 'disabled' : ''}>
            {label}
            <Input
                {...rest}
                type="radio"
                checked={checked}
                value={value}
                onChange={onChange}
                className={className}
                disabled={disabled}
            />
            <Checkmark className="checkmark" checked={checked} />
            {tooltip && <Tooltip overlay={<OverlayContainer>{tooltip}</OverlayContainer>} />}
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
    display: flex;
    position: relative;
    padding-left: 32px;
    cursor: pointer;
    font-style: normal;
    font-weight: 600;
    font-size: 19px;
    line-height: 25px;
    min-height: 35px;
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
    margin-bottom: 6px;
    align-self: start;
`;

const Checkmark = styled.span<{ checked: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    border: 4px solid ${(props) => (props.checked ? props.theme.borderColor.tertiary : props.theme.borderColor.primary)};
    background-color: transparent;
    border-radius: 50%;
    margin-top: 0px;
    :after {
        content: '';
        position: absolute;
        display: none;
        left: 3px;
        top: 3px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${(props) => props.theme.button.background.primary};
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

const OverlayContainer = styled(FlexDivColumn)`
    text-align: justify;
`;

export default RadioButton;

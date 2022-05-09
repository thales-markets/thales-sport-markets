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
            <Checkmark className="checkmark" />
            {tooltip && (
                <Tooltip
                    overlay={<OverlayContainer>{tooltip}</OverlayContainer>}
                    iconFontSize={23}
                    marginLeft={4}
                    top={-2}
                />
            )}
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
    padding-left: 25px;
    cursor: pointer;
    font-style: normal;
    font-weight: normal;
    font-size: 25px;
    line-height: 35px;
    height: 35px;
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
`;

const Checkmark = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    border: 4px solid ${(props) => props.theme.borderColor.primary};
    background-color: transparent;
    border-radius: 50%;
    margin-top: 6px;
    :after {
        content: '';
        position: absolute;
        display: none;
        left: 2px;
        top: 2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${(props) => props.theme.borderColor.primary};
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

const OverlayContainer = styled(FlexDivColumn)`
    text-align: justify;
`;

export default RadioButton;

import Tooltip from 'components/Tooltip';
import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { FieldContainer, FieldLabel, TextAreaInput } from '../common';

type TextAreaInputProps = {
    value: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    showValidation?: boolean;
    validationMessage?: string;
    tooltip?: string;
    inputPadding?: string;
    margin?: string;
    inputFontSize?: string;
    width?: string;
    height?: string;
    iconClass?: string;
    borderColor?: string;
    onIconClick?: () => void;
    validationPlacement?: string;
};

const TextInput: React.FC<TextAreaInputProps> = ({
    value,
    label,
    placeholder,
    disabled,
    onChange,
    showValidation,
    validationMessage,
    tooltip,
    inputPadding,
    margin,
    inputFontSize,
    width,
    height,
    iconClass,
    borderColor,
    onIconClick,
    ...rest
}) => {
    return (
        <FieldContainer margin={margin}>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && <Tooltip overlay={tooltip} />}:
                </FieldLabel>
            )}
            <Tooltip overlay={showValidation ? validationMessage || '' : ''} isValidation={showValidation}>
                <TextAreaInput
                    {...rest}
                    readOnly={!onChange}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={showValidation ? 'error' : ''}
                    title=""
                    padding={inputPadding}
                    fontSize={inputFontSize}
                    width={width}
                    height={height}
                    borderColor={borderColor}
                />
            </Tooltip>
            <RightContainer>
                {onIconClick && (
                    <Icon
                        className={
                            disabled ? `${iconClass || 'icon icon--search'} disabled` : iconClass || 'icon icon--search'
                        }
                        onClick={onIconClick}
                    />
                )}
            </RightContainer>
        </FieldContainer>
    );
};

const RightContainer = styled(FlexDivCentered)`
    position: absolute;
    right: 0;
    bottom: 10px;
`;

const Icon = styled.i`
    font-size: 15px;
    color: ${(props) => props.theme.borderColor.secondary};
    padding-right: 10px;
    cursor: pointer;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export default TextInput;

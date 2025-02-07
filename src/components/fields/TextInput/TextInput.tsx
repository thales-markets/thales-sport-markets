import Tooltip from 'components/Tooltip';
import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { FieldContainer, FieldLabel, Input } from '../common';

type TextInputProps = {
    value: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: any;
    showValidation?: boolean;
    validationMessage?: string;
    tooltip?: string;
    inputPadding?: string;
    margin?: string;
    inputFontSize?: string;
    width?: string;
    height?: string;
    iconClass?: string;
    onIconClick?: () => void;
    validationPlacement?: string;
    background?: string;
    fontWeight?: string;
    color?: string;
    borderColor?: string;
};

const TextInput: React.FC<TextInputProps> = ({
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
    onIconClick,
    ...rest
}) => {
    return (
        <FieldContainer margin={margin}>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && <Tooltip overlay={tooltip} iconFontSize={14} marginLeft={4} />}:
                </FieldLabel>
            )}
            <Tooltip overlay={showValidation ? validationMessage || '' : ''} isValidation={showValidation}>
                <StyledInput
                    {...rest}
                    readOnly={!onChange}
                    value={value}
                    type="text"
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={showValidation ? 'error' : ''}
                    title=""
                    padding={inputPadding}
                    fontSize={inputFontSize}
                    width={width}
                    height={height}
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

const StyledInput = styled(Input)<{ padding?: string; readOnly: boolean }>`
    padding: ${(props) => props.padding || '5px 10px 5px 10px'};
    &:focus {
        ${(props) => (props.readOnly ? `border: 1px solid ${props.theme.input.borderColor.primary};` : '')}
    }
`;

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

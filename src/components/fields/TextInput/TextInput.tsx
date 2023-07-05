import Tooltip from 'components/Tooltip';
import React from 'react';
import styled from 'styled-components';
import { FieldContainer, FieldLabel, Input } from '../common';
import MuiTooltip from '@material-ui/core/Tooltip';
import { FlexDivCentered } from 'styles/common';

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
                    {tooltip && <Tooltip overlay={tooltip} />}:
                </FieldLabel>
            )}
            <ValidationTooltip open={showValidation} title={validationMessage || ''} placement={'top'} arrow={true}>
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
            </ValidationTooltip>
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

const ValidationTooltip = styled((props) => <MuiTooltip classes={{ popper: props.className }} {...props} />)`
    & .MuiTooltip-tooltip {
        min-width: 100%;
        max-width: 300px;
        margin-bottom: 7px;
        background-color: ${(props) => props.theme.error.background.primary};
        color: ${(props) => props.theme.error.textColor.primary};
        border: 1.5px solid ${(props) => props.theme.error.borderColor.primary};
        border-radius: 2px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
    }
    & .MuiTooltip-arrow {
        &:before {
            border: 1.5px solid ${(props) => props.theme.error.borderColor.primary};
            background-color: ${(props) => props.theme.error.background.primary};
            box-sizing: border-box;
        }
        width: 13px;
        height: 10px;
        bottom: -3px !important;
    }
`;

export default TextInput;

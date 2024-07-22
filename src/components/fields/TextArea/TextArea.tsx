import MuiTooltip from '@material-ui/core/Tooltip';
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
    validationPlacement,
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
            <ValidationTooltip
                open={showValidation}
                title={showValidation ? validationMessage || '' : ''}
                placement={validationPlacement || 'top'}
                arrow={true}
                PopperProps={{ style: { zIndex: '2004' } }}
            >
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
        margin-bottom: ${(props) => (props.placement === 'top' ? '7px' : '0px')} !important;
        margin-top: ${(props) => (props.placement === 'top' ? '0px' : '7px')} !important;
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
        bottom: ${(props) => (props.placement === 'top' ? '-3px' : 'auto')} !important;
        top: ${(props) => (props.placement === 'top' ? 'auto' : '-3px')} !important;
    }
`;

export default TextInput;

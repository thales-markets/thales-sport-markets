import FieldValidationMessage from 'components/FieldValidationMessage';
import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { FieldContainer, FieldNote, Input } from '../common';
import SimpleLoader from './SimpleLoader';

type SwapNumericInputProps = {
    value: string | number;
    label: string;
    balanceLabel: string;
    note?: string;
    placeholder?: string;
    disabled?: boolean;
    step?: string;
    max?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
    showValidation?: boolean;
    validationMessage?: string;
    readOnly?: boolean;
    isGettingQuote?: boolean;
    autoFocus?: boolean;
};

const INVALID_CHARS = ['-', '+', 'e'];

const SwapNumericInput: React.FC<SwapNumericInputProps> = ({
    value,
    label,
    balanceLabel,
    note,
    placeholder,
    disabled,
    step,
    max,
    onChange,
    showValidation,
    validationMessage,
    readOnly,
    isGettingQuote,
    ...rest
}) => {
    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        let trimmedValue = value;
        if (value.indexOf('.') > -1) {
            const numberOfDecimals = value.split('.')[1].length;
            if (numberOfDecimals > DEFAULT_TOKEN_DECIMALS) {
                trimmedValue = value.substring(0, value.length - 1);
            }
        }

        onChange(e, trimmedValue.replace(/,/g, '.').replace(/[e+-]/gi, ''));
    };

    return (
        <StyledFieldContainer className="field-container">
            {readOnly ? (
                <StyledOutput disabled={disabled}>
                    {isGettingQuote ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        value
                    )}
                </StyledOutput>
            ) : (
                <StyledInput
                    {...rest}
                    value={value}
                    type="number"
                    onChange={handleOnChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={showValidation ? 'error' : ''}
                    onKeyDown={(e) => {
                        if (INVALID_CHARS.includes(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    min="0"
                    max={max || 'any'}
                    step={step || 'any'}
                />
            )}
            <Label readOnly={readOnly} disabled={disabled}>
                {label}:
            </Label>
            <BalanceLabel readOnly={readOnly} disabled={disabled}>
                {balanceLabel}
            </BalanceLabel>
            <FieldValidationMessage showValidation={showValidation} message={validationMessage} />
            {note && <FieldNote>{note}</FieldNote>}
        </StyledFieldContainer>
    );
};

const StyledFieldContainer = styled(FieldContainer)`
    width: 100%;
`;

const StyledInput = styled(Input)`
    text-align: end;
    height: 70px;
    padding: 35px 20px 15px 20px;
    font-size: 20px;
`;

const StyledOutput = styled.div<{ disabled?: boolean }>`
    text-align: end;
    height: 70px;
    padding: 32px 20px 15px 20px;
    border-radius: 12px;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    opacity: ${(props) => (props.disabled ? 0.4 : 1)};
`;

const Label = styled.label<{ readOnly?: boolean; disabled?: boolean }>`
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 14px;
    color: ${(props) => (props.readOnly ? props.theme.textColor.primary : props.theme.input.textColor.primary)};
    padding: 10px 0 0 20px;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    opacity: ${(props) => (props.disabled && props.readOnly ? 0.4 : 1)};
`;

const BalanceLabel = styled(Label)<{ readOnly?: boolean; disabled?: boolean }>`
    padding: 10px 20px 0 0;
    left: auto;
    right: 0;
    color: ${(props) => (props.readOnly ? props.theme.textColor.primary : props.theme.input.textColor.primary)};
    opacity: ${(props) => (props.disabled && props.readOnly ? 0.4 : 1)};
`;

const LoaderContainer = styled(FlexDivColumn)`
    position: relative;
`;

export default SwapNumericInput;

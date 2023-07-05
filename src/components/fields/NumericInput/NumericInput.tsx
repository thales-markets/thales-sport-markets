import Tooltip from 'components/Tooltip';
import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FieldContainer, FieldLabel, Input } from '../common';
import MuiTooltip from '@material-ui/core/Tooltip';
import { FlexDivCentered } from 'styles/common';

type NumericInputProps = {
    value: string | number;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    step?: string;
    max?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
    showValidation?: boolean;
    validationMessage?: string;
    currencyComponent?: any;
    currencyLabel?: string;
    tooltip?: string;
    onMaxButton?: any;
    info?: string;
    inputPadding?: string;
    margin?: string;
    inputFontSize?: string;
    width?: string;
    height?: string;
    enableCurrencyComponentOnly?: boolean;
};

const INVALID_CHARS = ['-', '+', 'e'];

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    label,
    placeholder,
    disabled,
    step,
    max,
    onChange,
    showValidation,
    validationMessage,
    currencyComponent,
    currencyLabel,
    tooltip,
    onMaxButton,
    info,
    inputPadding,
    margin,
    inputFontSize,
    width,
    height,
    enableCurrencyComponentOnly,
    ...rest
}) => {
    const { t } = useTranslation();

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
        <FieldContainer margin={margin}>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && <Tooltip overlay={tooltip} />}:
                </FieldLabel>
            )}
            {info && (
                <InfoWrapper>
                    <InfoText>{info}</InfoText>
                </InfoWrapper>
            )}
            <ValidationTooltip open={showValidation} title={validationMessage || ''} placement={'top'} arrow={true}>
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
                    title=""
                    padding={inputPadding}
                    fontSize={inputFontSize}
                    width={width}
                    height={height}
                />
            </ValidationTooltip>
            <RightContainer>
                {onMaxButton && (
                    <MaxButton disabled={disabled} onClick={onMaxButton}>
                        {t('markets.market-details.max')}
                    </MaxButton>
                )}
                {currencyLabel && (
                    <CurrencyLabel className={disabled ? 'currency-label disabled' : 'currency-label'}>
                        {currencyLabel}
                    </CurrencyLabel>
                )}
                {currencyComponent && (
                    <CurrencyComponentContainer
                        className={disabled && !enableCurrencyComponentOnly ? 'disabled' : ''}
                        hasSeparator={onMaxButton}
                    >
                        {currencyComponent}
                    </CurrencyComponentContainer>
                )}
            </RightContainer>
        </FieldContainer>
    );
};

const StyledInput = styled(Input)<{ padding?: string }>`
    padding: ${(props) => props.padding || '5px 120px 5px 10px'};
`;

const RightContainer = styled(FlexDivCentered)`
    position: absolute;
    right: 0;
    bottom: 4px;
`;

const CurrencyLabel = styled.label`
    font-size: 15px;
    line-height: 20px;
    color: ${(props) => props.theme.input.textColor.primary};
    padding-left: 8px;
    padding-right: 10px;
    pointer-events: none;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const MaxButton = styled.button`
    background: ${(props) => props.theme.button.background.quaternary};
    border: none;
    font-weight: 700;
    font-size: 10px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    &:disabled {
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

const CurrencyComponentContainer = styled(FlexDivCentered)<{ hasSeparator?: boolean }>`
    ${(props) => (props.hasSeparator ? `border-left: 2px solid ${props.theme.input.borderColor.primary};` : '')}
    line-height: 15px;
    padding-right: 2px;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const InfoWrapper = styled.div`
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    background: ${(props) => props.theme.background.primary};
    padding: 0 5px;
    z-index: 1;
`;

const InfoText = styled.span`
    font-size: 13px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
`;

export default NumericInput;

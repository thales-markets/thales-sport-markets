import Tooltip from 'components/Tooltip';
import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FieldContainer, FieldLabel, Input } from '../common';
import MuiTooltip from '@material-ui/core/Tooltip';
import { FlexDivCentered } from 'styles/common';
import { ReactComponent as BalanceIcon } from 'assets/images/balance-icon.svg';

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
    readonly?: boolean;
    inputType?: 'text' | 'number';
    currencyLabel?: string;
    tooltip?: string;
    onMaxButton?: any;
    balance?: string;
    isBalanceLoading?: boolean;
    info?: string;
    inputPadding?: string;
    margin?: string;
    inputFontSize?: string;
    inputFontWeight?: string;
    inputTextAlign?: string;
    width?: string;
    height?: string;
    enableCurrencyComponentOnly?: boolean;
    validationPlacement?: string;
    borderColor?: string;
    containerWidth?: string;
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
    readonly,
    inputType,
    currencyLabel,
    tooltip,
    onMaxButton,
    balance,
    isBalanceLoading,
    info,
    inputPadding,
    margin,
    inputFontSize,
    inputFontWeight,
    inputTextAlign,
    width,
    height,
    enableCurrencyComponentOnly,
    validationPlacement,
    borderColor,
    containerWidth,
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
        <FieldContainer margin={margin} width={containerWidth}>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && <Tooltip overlay={tooltip} />}:
                </FieldLabel>
            )}
            {balance && (
                <BalanceContainer>
                    <StyledBalanceIcon />
                    {isBalanceLoading ? '-' : balance}
                </BalanceContainer>
            )}
            {info && (
                <InfoWrapper>
                    <InfoText>{info}</InfoText>
                </InfoWrapper>
            )}
            <ValidationTooltip
                open={showValidation}
                title={showValidation ? validationMessage || '' : ''}
                placement={validationPlacement || 'top'}
                arrow={true}
            >
                <StyledInput
                    readOnly={readonly}
                    {...rest}
                    value={value}
                    type={inputType ? inputType : 'number'}
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
                    fontWeight={inputFontWeight}
                    textAlign={inputTextAlign}
                    width={width}
                    height={height}
                    borderColor={borderColor}
                />
            </ValidationTooltip>
            <RightContainer height={height} currencyLabel={!!currencyLabel}>
                {onMaxButton && (
                    <MaxButton disabled={disabled} onClick={onMaxButton}>
                        {t('markets.market-details.max')}
                    </MaxButton>
                )}
                {currencyLabel && (
                    <CurrencyLabel
                        className={disabled ? 'currency-label disabled' : 'currency-label'}
                        hasSeparator={onMaxButton}
                    >
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

const StyledInput = styled(Input)<{ padding?: string; readonly?: boolean }>`
    cursor: ${(props) => (props.readOnly ? 'pointer' : '')};
    padding: ${(props) => props.padding || '5px 100px 5px 10px'};
`;

const RightContainer = styled(FlexDivCentered)<{ height?: string; currencyLabel?: boolean }>`
    position: absolute;
    right: 0;
    bottom: 0;
    height: ${(props) => props.height || '30px'};
    padding-right: ${(props) => (props.currencyLabel ? '10px' : '0px')};
`;

const CurrencyLabel = styled.label<{ hasSeparator?: boolean }>`
    border-left: ${(props) => (props.hasSeparator ? `2px solid ${props.theme.input.borderColor.tertiary}` : 'none')};
    font-size: 15px;
    line-height: 20px;
    color: ${(props) => props.theme.input.textColor.primary};
    padding-left: 8px;
    pointer-events: none;
    &.disabled {
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
    margin-right: 8px;
    border-radius: 2px;
    line-height: 12px;
    &:disabled {
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

const BalanceContainer = styled(FlexDivCentered)`
    position: absolute;
    right: 0;
    bottom: 36px;
    font-weight: normal;
    font-size: 11px;
    line-height: 15px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const StyledBalanceIcon = styled(BalanceIcon)`
    height: 13px;
    margin: 0 2px 1px 0;
    path {
        fill: ${(props) => props.theme.textColor.quaternary};
    }
`;

const CurrencyComponentContainer = styled(FlexDivCentered)<{ hasSeparator?: boolean }>`
    ${(props) => (props.hasSeparator ? `border-left: 2px solid ${props.theme.input.borderColor.tertiary};` : '')}
    line-height: 22px;
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

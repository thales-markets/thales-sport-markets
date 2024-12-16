import React from 'react';
import Select, { CSSObjectWithLabel } from 'react-select';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';

type SelectOption = { value: number | string; label: string };

type SelectOptions = SelectOption[];

type SelectInputProps = {
    options: SelectOptions;
    handleChange: (value: number | undefined | null) => void;
    defaultValue?: number;
    value?: SelectOption;
    width?: number;
    isDisabled?: boolean;
    isPaginationStyle?: boolean;
};

const SelectInput: React.FC<SelectInputProps> = ({
    options,
    handleChange,
    defaultValue,
    value,
    width,
    isDisabled,
    isPaginationStyle,
}) => {
    const theme: ThemeInterface = useTheme();

    const selectedValue = (value ?? options[defaultValue || 0]) || Number(defaultValue);
    const optionsIndex = options.findIndex((option) => option.value === selectedValue.value);

    const customStyled = {
        menu: (provided: any, state: any) => ({
            ...provided,
            width: '100%',
            color: state.selectProps.menuColor,
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.button.borderColor.tertiary}`,
            marginTop: 5,
            borderRadius: 10,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            color: theme.textColor.primary,
            backgroundColor: state.isSelected ? theme.background.primary : 'transparent',
            opacity: state.isSelected && !state?.isFocused ? 0.7 : 0.9,
            cursor: 'pointer',
            fontFamily: theme.fontFamily.primary,
            '&:hover': {
                backgroundColor: theme.background.primary,
            },
        }),
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: theme.background.secondary,
            borderColor: theme.button.borderColor.tertiary,
            color: theme.textColor.primary,
            borderRadius: '10px',
            width: width,
            cursor: 'pointer',
            boxShadow: 'none',
            '&:hover': {
                border: `1px solid ${theme.borderColor.quaternary}`,
                boxShadow: 'none',
            },
            opacity: state.isDisabled ? 0.4 : 1,
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: theme.textColor.primary,
        }),
        singleValue: (provided: CSSObjectWithLabel) => ({
            ...provided,
            color: theme.textColor.primary,
            fontFamily: theme.fontFamily.primary,
            lineHeight: '120%',
        }),
        dropdownIndicator: (provided: CSSObjectWithLabel) => ({
            ...provided,
            color: theme.textColor.primary,
            [':hover']: {
                ...provided[':hover'],
                color: theme.textColor.primary,
            },
        }),
    };

    const paginationStyle = {
        menu: (provided: any, state: any) => ({
            ...provided,
            width: '100%',
            color: state.selectProps.menuColor,
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.button.borderColor.tertiary}`,
            marginTop: -40 - 32 * optionsIndex,
            borderRadius: 10,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            color: theme.textColor.primary,
            backgroundColor: state.isSelected ? theme.background.primary : 'transparent',
            opacity: state.isSelected && !state?.isFocused ? 0.7 : 0.9,
            cursor: 'pointer',
            fontFamily: theme.fontFamily.primary,
            '&:hover': {
                backgroundColor: theme.background.primary,
            },
        }),
        control: (provided: any, state: any) => ({
            ...provided,
            width: '52px',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            color: theme.textColor.primary,
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: 'none',
            '&:hover': {
                boxShadow: 'none',
            },
            opacity: state.isDisabled ? 0.4 : 1,
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: theme.textColor.primary,
        }),
        singleValue: (provided: CSSObjectWithLabel) => ({
            ...provided,
            width: 'min-content',
            marginLeft: '0',
            marginRight: '0',
            color: theme.textColor.primary,
            fontFamily: theme.fontFamily.primary,
            lineHeight: '100%',
        }),
        dropdownIndicator: () => ({
            width: '18px;',
            height: '18px;',
            '& > svg': {
                width: 18,
                height: 18,
            },
        }),
        valueContainer: (provided: CSSObjectWithLabel) => ({
            ...provided,
            padding: '2px',
            justifyContent: 'end',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };

    return (
        <Select
            value={selectedValue}
            options={options}
            styles={isPaginationStyle ? paginationStyle : customStyled}
            onChange={(props: any) => {
                handleChange(Number(props?.value));
            }}
            defaultValue={selectedValue}
            isSearchable={false}
            isDisabled={isDisabled}
        />
    );
};

export default SelectInput;

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
};

const SelectInput: React.FC<SelectInputProps> = ({ options, handleChange, defaultValue, value, width, isDisabled }) => {
    const theme: ThemeInterface = useTheme();

    const defaultOption = (value ?? options[defaultValue || 0]) || Number(defaultValue);

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
            backgroundColor: state?.isFocused || state.isSelected ? theme.background.primary : 'transparent',
            opacity: state.isSelected && !state?.isFocused ? 0.7 : 0.9,
            cursor: 'pointer',
            fontFamily: theme.fontFamily.primary,
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
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: theme.textColor.primary,
            [':hover']: {
                ...provided[':hover'],
                color: theme.textColor.primary,
            },
        }),
    };

    return (
        <Select
            value={defaultOption}
            options={options}
            styles={customStyled}
            onChange={(props: any) => {
                handleChange(Number(props?.value));
            }}
            defaultValue={defaultOption}
            isSearchable={false}
            isDisabled={isDisabled}
        />
    );
};

export default SelectInput;

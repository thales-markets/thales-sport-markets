import React from 'react';
import Select from 'react-select';

type SelectOptions = Array<{ value: number | string; label: string }>;

type SelectInputProps = {
    options: SelectOptions;
    handleChange: (value: number | undefined | null) => void;
    defaultValue?: number;
    width?: number;
};

const SelectInput: React.FC<SelectInputProps> = ({ options, handleChange, defaultValue, width }) => {
    const defaultOption = options[defaultValue ? defaultValue : 0];

    const customStyled = {
        menu: (provided: any, state: any) => ({
            ...provided,
            width: '100%',
            color: state.selectProps.menuColor,
            backgroundColor: '#2f3656',
            border: '1px solid #191C2B',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            color: state?.isFocused || state.isSelected ? '#191C2B' : '#FFFFFF',
            backgroundColor: state?.isFocused || state.isSelected ? '#FFFFFF' : '#191C2B',
            opacity: state.isSelected ? 0.7 : 1,
        }),
        control: (provided: any) => ({
            ...provided,
            backgroundColor: '#2f3656',
            borderColor: '#191C2B',
            color: '#FFFFFF',
            borderRadius: '15px',
            width: width,
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#FFFFFF',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: '#FFFFFF',
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: '#FFFFFF',
            [':hover']: {
                ...provided[':hover'],
                color: '#FFFFFF',
            },
        }),
    };

    return (
        <Select
            options={options}
            styles={customStyled}
            onChange={(_props) => {
                handleChange(Number(_props?.value));
            }}
            defaultValue={defaultOption}
        />
    );
};

export default SelectInput;

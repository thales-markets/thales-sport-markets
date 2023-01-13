import React from 'react';
import Select from 'react-select';

type SelectOptions = Array<{ value: number | string; label: string }>;

type SelectInputProps = {
    options: SelectOptions;
    handleChange: (value: number | undefined | null) => void;
    defaultValue?: number;
    width?: number;
    isDisabled?: boolean;
};

const SelectInput: React.FC<SelectInputProps> = ({ options, handleChange, defaultValue, width, isDisabled }) => {
    const defaultOption = options[defaultValue ? defaultValue : 0];

    const customStyled = {
        menu: (provided: any, state: any) => ({
            ...provided,
            width: '100%',
            color: state.selectProps.menuColor,
            backgroundColor: '#2f3656',
            border: '1px solid #191C2B',
            marginTop: 5,
            borderRadius: 10,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            color: '#FFFFFF',
            backgroundColor: state?.isFocused ? '#252940' : state.isSelected ? '#1e2134' : 'transparent',
            cursor: 'pointer',
        }),
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: '#2f3656',
            borderColor: '#191C2B',
            color: '#FFFFFF',
            borderRadius: '10px',
            width: width,
            cursor: 'pointer',
            boxShadow: 'none',
            '&:hover': {
                border: '1px solid #3fd1ff',
                boxShadow: 'none',
            },
            opacity: state.isDisabled ? 0.4 : 1,
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
            value={defaultOption}
            options={options}
            styles={customStyled}
            onChange={(props) => {
                handleChange(Number(props?.value));
            }}
            defaultValue={defaultOption}
            isSearchable={false}
            isDisabled={isDisabled}
        />
    );
};

export default SelectInput;

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
// import { FlexDivColumn } from 'styles/common';

type DatetimePickerProps = {
    startDate: Date | null;
    endDate: Date | null;
    onDateRangeChange: (dates: [Date | null, Date | null]) => void;
};

export const RangedDatepicker: React.FC<DatetimePickerProps> = ({ startDate, endDate, onDateRangeChange }) => {
    return (
        <DatePickerContainer>
            <ReactDatePicker
                selected={startDate}
                onChange={onDateRangeChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
            />
        </DatePickerContainer>
    );
};

const DatePickerContainer = styled.div`
    .react-datepicker {
        display: flex !important;
        box-sizing: border-box;
        border: none !important;
        background: ${(props) => props.theme.background.secondary} !important;
        border-radius: 6px;
        margin-top: 20px;
    }

    .react-datepicker__header {
        background: ${(props) => props.theme.background.secondary} !important;
        border-bottom: none !important;
    }

    .react-datepicker__current-month {
        color: ${(props) => props.theme.textColor.primary} !important;
        font-style: normal;
        font-weight: 300;
        padding-top: 5px;
    }

    .react-datepicker__day-names {
        color: ${(props) => props.theme.textColor.primary} !important;
        border-top: 2px solid #5f6180;
        margin-top: 10px;
        border-bottom: none !important;
    }

    .react-datepicker__day-name {
        color: ${(props) => props.theme.textColor.primary} !important;
    }

    .react-datepicker__day {
        color: ${(props) => props.theme.textColor.primary} !important;
        &:hover {
            border-radius: 30px !important;
            color: ${(props) => props.theme.textColor.tertiary} !important;
            background-color: ${(props) => props.theme.background.quaternary} !important;
        }
    }

    .react-datepicker__day--selected,
    .react-datepicker__day--in-selecting-range,
    .react-datepicker__day--keyboard-selected,
    .react-datepicker__day--in-range {
        border-radius: 30px !important;
        color: ${(props) => props.theme.textColor.tertiary} !important;
        background-color: ${(props) => props.theme.background.quaternary} !important;
        font-weight: 300;
    }

    .react-datepicker__navigation-icon {
        top: -4px;
        font-size: 10px;
        color: ${(props) => props.theme.textColor.primary} !important;
    }
`;

export default RangedDatepicker;

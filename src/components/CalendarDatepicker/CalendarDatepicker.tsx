import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { formatShortDate } from 'utils/formatters/date';
import { useTranslation } from 'react-i18next';

type CalendarDatepickerProps = {
    date: Date | number;
    setDate: (date: Date | number) => void;
    setDateParam: (value: any) => void;
};

const CalendarDatepicker: React.FC<CalendarDatepickerProps> = ({ date, setDate, setDateParam }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <DatePickerContainer data-matomo-category="filters" data-matomo-action="time-filter-custome">
            <DatepickerButton className={`${typeof date != 'number' ? 'blue' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {typeof date != 'number' ? convertAndFormat(date) : t('common.filter.date.choose')}
            </DatepickerButton>
            {isOpen && (
                <ReactDatePicker
                    selected={checkTypeOf(date)}
                    onSelect={(e) => {
                        if (e != null && typeof date != 'number') {
                            e.setHours(23, 59, 59, 999);
                            if (e.getTime() == date.getTime()) {
                                setDate(0);
                                setDateParam('');
                            }
                        }
                    }}
                    onChange={(e) => {
                        if (e != null) {
                            e.setHours(23, 59, 59, 999);
                            setDate(e);
                            setDateParam(e.toDateString());
                        }
                    }}
                    onClickOutside={() => setIsOpen(false)}
                    inline
                />
            )}
        </DatePickerContainer>
    );
};

const checkTypeOf = (date: any) => {
    if (typeof date != 'number') {
        return new Date(date);
    }

    return null;
};

const convertAndFormat = (date: any) => {
    return formatShortDate(new Date(date));
};

const DatePickerContainer = styled.div`
    position: relative;
    .react-datepicker {
        position: absolute;
        box-sizing: border-box;
        border: none !important;
        background: ${(props) => props.theme.background.secondary} !important;
        border-radius: 6px;
        margin-top: 4px;
        right: -29px;
        z-index: 1;
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
            opacity: 0.7;
        }
    }

    .react-datepicker__day--keyboard-selected {
        background-color: transparent !important;
        color: ${(props) => props.theme.textColor.primary} !important;
    }

    .react-datepicker__day--today {
        font-weight: 600;
        color: ${(props) => props.theme.textColor.quaternary} !important;
    }

    .react-datepicker__day--selected,
    .react-datepicker__day--in-selecting-range,
    .react-datepicker__day--in-range,
    .react-datepicker__day--range-end {
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

    .react-datepicker__day--outside-month {
        opacity: 0.4;
    }
`;

const DatepickerButton = styled.button`
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    background: transparent;
    border: none;
    text-transform: uppercase;
    padding: 0;
    color: ${(props) => props.theme.textColor.secondary};
    &.blue {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default CalendarDatepicker;

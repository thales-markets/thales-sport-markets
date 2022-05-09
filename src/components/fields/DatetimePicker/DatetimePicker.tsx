import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FieldContainer, FieldLabel, OverlayContainer } from '../common';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import Tooltip from 'components/Tooltip';

type DatetimePickerProps = ReactDatePickerProps & {
    label?: string;
    disabled?: boolean;
    minTime: Date;
    maxTime: Date;
    minDate: Date;
    maxDate: Date;
    tooltip?: string;
};

export const DatetimePicker: React.FC<DatetimePickerProps> = ({
    label,
    disabled,
    minTime,
    maxTime,
    minDate,
    maxDate,
    tooltip,
    ...rest
}) => {
    const { t } = useTranslation();

    return (
        <FieldContainer>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && (
                        <Tooltip
                            overlay={<OverlayContainer>{tooltip}</OverlayContainer>}
                            iconFontSize={23}
                            marginLeft={2}
                            top={0}
                        />
                    )}
                </FieldLabel>
            )}
            <DatePickerContainer className={disabled ? 'disabled' : ''}>
                <ReactDatePicker
                    dateFormat="MMM d, yyyy | HH:mm"
                    timeFormat="HH:mm"
                    minDate={minDate}
                    maxDate={maxDate}
                    minTime={minTime}
                    maxTime={maxTime}
                    placeholderText={t('common.select-date')}
                    autoComplete="off"
                    popperPlacement="bottom-start"
                    showTimeSelect
                    readOnly={disabled}
                    calendarStartDay={1}
                    {...rest}
                />
            </DatePickerContainer>
        </FieldContainer>
    );
};

const DatePickerContainer = styled(FlexDivColumn)`
    &.disabled {
        opacity: 0.4;
        cursor: default;
        pointer-events: none;
    }

    .react-datepicker__input-container {
        input {
            background: ${(props) => props.theme.input.background.primary};
            border: 2px solid ${(props) => props.theme.input.borderColor.primary};
            box-sizing: border-box;
            mix-blend-mode: normal;
            border-radius: 12px;
            height: 60px;
            padding: 20px 20px 20px 20px;
            outline: 0;
            font-style: normal;
            font-weight: normal;
            font-size: 18px;
            line-height: 25px;
            color: ${(props) => props.theme.input.textColor.primary};
            &::selection {
                background: ${(props) => props.theme.input.background.selection.primary};
            }
            &:focus {
                border: 2px solid ${(props) => props.theme.input.borderColor.focus.primary};
                box-sizing: border-box;
            }
            &:disabled {
                opacity: 0.4;
                cursor: default;
            }
            &.error {
                border: 2px solid #e53720;
            }
        }
    }

    .react-datepicker {
        display: flex !important;
        box-sizing: border-box;
        border: 1px solid ${(props) => props.theme.borderColor.primary} !important;
        background: ${(props) => props.theme.background.primary} !important;
        border-radius: 10px;
    }

    .react-datepicker__month-container {
        width: 300px;
        height: 260px;
        padding-top: 20px;
        border-radius: 10px 0 0 10px;
    }

    .react-datepicker__header {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
    }

    .react-datepicker__month {
        margin: 0;
    }

    .react-datepicker__current-month {
        font-weight: 600;
        font-size: 16px;
        line-height: 32px;
        letter-spacing: 0.35px;
        color: ${(props) => props.theme.textColor.primary} !important;
    }

    .react-datepicker__day-name {
        font-weight: bold;
        font-size: 10px;
        line-height: 16px;
        letter-spacing: 1px;
        color: ${(props) => props.theme.textColor.primary} !important;
        text-transform: uppercase;
    }

    .react-datepicker__day {
        font-weight: bold !important;
        font-size: 13px !important;
        height: 24px !important;
        letter-spacing: 0.4px;
        color: ${(props) => props.theme.textColor.primary} !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        :hover {
            background: ${(props) => props.theme.input.background.selection.primary} !important;
            color: ${(props) => props.theme.textColor.tertiary} !important;
        }
    }

    .react-datepicker__week,
    .react-datepicker__day-names {
        padding: 0 30px;
        margin-bottom: 0;
    }

    .react-datepicker__day--keyboard-selected {
        background: ${(props) => props.theme.background.tertiary} !important;
    }

    .react-datepicker__week .react-datepicker__day--selected,
    .react-datepicker__week .react-datepicker__day--range-start {
        background: ${(props) => props.theme.background.secondary} !important;
        color: ${(props) => props.theme.textColor.primary} !important;
        box-sizing: border-box;
        width: 1.7rem !important;
        margin: 0.166rem !important;
        padding: 0;
        z-index: 2 !important;
    }

    .react-datepicker__day--disabled {
        color: ${(props) => props.theme.textColor.primary} !important;
        opacity: 0.2;
    }

    .react-datepicker__day--in-range {
        position: relative;
        background: ${(props) => props.theme.button.background.primary} !important;
        z-index: 1 !important;
        color: ${(props) => props.theme.button.textColor.primary} !important;
    }

    .react-datepicker__day--in-range:first-child {
        border-top-left-radius: 16px !important;
        border-bottom-left-radius: 16px !important;
    }

    .react-datepicker__day--in-range:last-child {
        border-top-right-radius: 16px !important;
        border-bottom-right-radius: 16px !important;
    }

    .react-datepicker__navigation {
        top: 135px !important;
        width: 28px !important;
        height: 28px !important;
        border: none !important;
    }

    .react-datepicker__navigation--previous {
        left: 8px !important;
    }

    .react-datepicker__navigation--next {
        right: 140px !important;
    }

    .react-datepicker__time-container {
        border: none;
        width: 130px;
        height: 260px;
        background: transparent;
        .react-datepicker__time {
            height: 100% !important;
            background: transparent;
            border-radius: 10px;
        }
    }

    .react-datepicker-time__header {
        display: none;
    }

    .react-datepicker__time-box {
        width: 100% !important;
        padding-top: 15px;
        padding-bottom: 15px;
        height: 100% !important;
    }

    .react-datepicker__time-list {
        height: 100% !important;
        position: relative;
    }

    .react-datepicker__time-list-item {
        width: 94px !important;
        border: 0.5px solid ${(props) => props.theme.borderColor.primary} !important;
        border-radius: 10px !important;
        padding: 6px 10px !important;
        font-weight: bold;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 1px;
        margin: auto;
        margin-bottom: 3px !important;
        color: ${(props) => props.theme.textColor.primary} !important;
        :hover {
            background: ${(props) => props.theme.input.background.selection.primary} !important;
            color: ${(props) => props.theme.textColor.tertiary} !important;
        }
    }

    .react-datepicker__time-list-item--selected {
        background: ${(props) => props.theme.background.secondary} !important;
        color: ${(props) => props.theme.textColor.primary} !important;
        :hover {
            background: ${(props) => props.theme.background.secondary} !important;
            color: ${(props) => props.theme.textColor.primary} !important;
        }
    }

    li.react-datepicker__time-list-item--disabled {
        color: ${(props) => props.theme.textColor.primary} !important;
        opacity: 0.2 !important;
        background: transparent !important;
        :hover {
            color: ${(props) => props.theme.textColor.primary} !important;
            opacity: 0.2 !important;
            background: transparent !important;
        }
    }

    .react-datepicker-popper[data-placement^='bottom'] {
        padding-top: 2px !important;
    }

    .react-datepicker-popper[data-placement^='top'] {
        padding-bottom: 2px !important;
    }

    .react-datepicker-popper[data-placement^='bottom'] .react-datepicker__triangle {
        :before,
        :after {
            border-bottom-color: ${(props) => props.theme.background.tertiary} !important;
            border-top-color: ${(props) => props.theme.background.tertiary} !important;
            top: 0px !important;
            display: none;
        }
    }

    .react-datepicker-popper[data-placement^='top'] .react-datepicker__triangle {
        :before,
        :after {
            border-bottom-color: ${(props) => props.theme.background.tertiary} !important;
            border-top-color: ${(props) => props.theme.background.tertiary} !important;
            top: -8px !important;
            display: none;
        }
    }
`;

export default DatetimePicker;

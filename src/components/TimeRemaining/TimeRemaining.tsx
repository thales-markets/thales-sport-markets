import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import intervalToDuration from 'date-fns/intervalToDuration';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import { formattedDuration, formattedDurationFull } from 'utils/formatters/date';
import useInterval from 'hooks/useInterval';
import styled from 'styled-components';

type TimeRemainingProps = {
    end: Date | number;
    onEnded?: () => void;
    fontSize?: number;
    fontWeight?: number;
    showFullCounter?: boolean;
};

const ONE_SECOND_IN_MS = 1000;

export const TimeRemaining: React.FC<TimeRemainingProps> = ({
    end,
    onEnded,
    fontSize,
    fontWeight,
    showFullCounter,
}) => {
    const now = Date.now();
    const [timeElapsed, setTimeElapsed] = useState(now >= end);
    const [weeksDiff, setWeekDiff] = useState(Math.abs(differenceInWeeks(now, end)));
    const [showRemainingInWeeks, setShowRemainingInWeeks] = useState(weeksDiff > 4);
    const [countdownDisabled, setCountdownDisabled] = useState(timeElapsed || showRemainingInWeeks);

    const [timeInterval, setTimeInterval] = useState<number | null>(countdownDisabled ? null : ONE_SECOND_IN_MS);
    const [duration, setDuration] = useState<Duration>(intervalToDuration({ start: now, end }));
    const { t } = useTranslation();

    const dateTimeTranslationMap = {
        years: t('common.time-remaining.years'),
        year: t('common.time-remaining.year'),
        months: t('common.time-remaining.months'),
        month: t('common.time-remaining.month'),
        weeks: t('common.time-remaining.weeks'),
        week: t('common.time-remaining.week'),
        days: t('common.time-remaining.days'),
        day: t('common.time-remaining.day'),
        hours: t('common.time-remaining.hours'),
        hour: t('common.time-remaining.hour'),
        minutes: t('common.time-remaining.minutes'),
        minute: t('common.time-remaining.minute'),
        seconds: t('common.time-remaining.seconds'),
        second: t('common.time-remaining.second'),
        'days-short': t('common.time-remaining.days-short'),
        'hours-short': t('common.time-remaining.hours-short'),
        'minutes-short': t('common.time-remaining.minutes-short'),
        'seconds-short': t('common.time-remaining.seconds-short'),
    };

    useEffect(() => {
        if (onEnded && timeElapsed) {
            onEnded();
        }
    }, [onEnded, timeElapsed]);

    useMemo(() => {
        const today = Date.now();
        setTimeElapsed(today >= end);
        setWeekDiff(Math.abs(differenceInWeeks(today, end)));
        setShowRemainingInWeeks(Math.abs(differenceInWeeks(today, end)) > 4);
        setCountdownDisabled(today >= end || Math.abs(differenceInWeeks(today, end)) > 4);
        setDuration(intervalToDuration({ start: today, end }));
    }, [end]);

    useInterval(() => {
        if (now <= end) {
            setDuration(intervalToDuration({ start: now, end }));
        } else {
            setTimeElapsed(true);
            setTimeInterval(null);
        }
    }, timeInterval);

    return (
        <Container fontSize={fontSize} fontWeight={fontWeight} duration={duration}>
            {timeElapsed
                ? t('common.time-remaining.ended')
                : showRemainingInWeeks
                ? `${weeksDiff} ${t('common.time-remaining.weeks')}`
                : showFullCounter
                ? formattedDurationFull(duration, dateTimeTranslationMap)
                : formattedDuration(duration, dateTimeTranslationMap)}
        </Container>
    );
};

// const getColor = (duration: Duration) => {
//     if (duration.years || duration.months || duration.days) {
//         return `#f6f6fe`;
//     }
//     if (duration.hours) {
//         return `#FFCC00`;
//     }
//     if (duration.minutes && duration.minutes > 10) {
//         if (duration.minutes > 10) {
//             return `#FF8800`;
//         }
//     }
//     return '#D82418';
// };

const Container = styled.span<{ fontSize?: number; fontWeight?: number; duration: Duration; showBorder?: boolean }>`
    font-size: ${(props) => props.fontSize || 20}px;
    font-weight: ${(props) => props.fontWeight || 400};
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
`;

export default TimeRemaining;

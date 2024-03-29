import differenceInWeeks from 'date-fns/differenceInWeeks';
import intervalToDuration from 'date-fns/intervalToDuration';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { formattedDuration, formattedDurationFull } from 'utils/formatters/date';

type TimeRemainingProps = {
    end: Date | number;
    onEnded?: () => void;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    showFullCounter?: boolean;
};

const ONE_SECOND_IN_MS = 1000;

const TimeRemaining: React.FC<TimeRemainingProps> = ({
    end,
    onEnded,
    fontSize,
    fontWeight,
    color,
    showFullCounter,
}) => {
    const now = Date.now();
    const [timeElapsed, setTimeElapsed] = useState(now >= Number(end));
    const [weeksDiff, setWeekDiff] = useState(Math.abs(differenceInWeeks(now, end)));
    const [showRemainingInWeeks, setShowRemainingInWeeks] = useState(weeksDiff > 2);
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
        setTimeElapsed(today >= Number(end));
        setWeekDiff(Math.abs(differenceInWeeks(today, end)));
        setShowRemainingInWeeks(Math.abs(differenceInWeeks(today, end)) > 2);
        setCountdownDisabled(today >= Number(end) || Math.abs(differenceInWeeks(today, end)) > 4);
        setDuration(intervalToDuration({ start: today, end }));
    }, [end]);

    useInterval(() => {
        if (now <= Number(end)) {
            setDuration(intervalToDuration({ start: now, end }));
        } else {
            setTimeElapsed(true);
            setTimeInterval(null);
        }
    }, timeInterval);

    return (
        <Container fontSize={fontSize} fontWeight={fontWeight} duration={duration} color={color}>
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

const Container = styled.span<{ fontSize?: number; fontWeight?: number; duration: Duration; showBorder?: boolean }>`
    font-size: ${(props) => props.fontSize || 20}px;
    font-weight: ${(props) => props.fontWeight || 400};
    color: ${(props) => (props?.color ? props.color : props.theme.textColor.primary)};
    text-align: center;
`;

export default TimeRemaining;

import differenceInWeeks from 'date-fns/differenceInWeeks';
import intervalToDuration from 'date-fns/intervalToDuration';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { DEFAULT_DATETIME_TRANSLATION_MAP, formattedDuration, formattedDurationFullV2 } from 'utils/formatters/date';

type SpeedTimeRemainingProps = {
    end: Date | number;
    showFullCounter?: boolean;
    children?: React.ReactNode;
};

const ONE_SECOND_IN_MS = 1000;
const SHOW_WEEKS_THRESHOLD = 4;

const SpeedTimeRemaining: React.FC<SpeedTimeRemainingProps> = ({ end, showFullCounter, children }) => {
    const { t } = useTranslation();

    const now = Date.now();

    const [timeElapsed, setTimeElapsed] = useState(now >= Number(end));
    const [weeksDiff, setWeekDiff] = useState(Math.abs(differenceInWeeks(now, end)));
    const [showRemainingInWeeks, setShowRemainingInWeeks] = useState(weeksDiff > SHOW_WEEKS_THRESHOLD);
    const [countdownDisabled, setCountdownDisabled] = useState(timeElapsed || showRemainingInWeeks);
    const [timeInterval, setTimeInterval] = useState<number | null>(countdownDisabled ? null : ONE_SECOND_IN_MS);
    const [duration, setDuration] = useState<Duration>(intervalToDuration({ start: now, end }));

    useEffect(() => {
        const nowValue = Date.now();

        const timeElapsedValue = nowValue >= Number(end);
        setTimeElapsed(timeElapsedValue);

        const weekDiffValue = Math.abs(differenceInWeeks(nowValue, end));
        setWeekDiff(weekDiffValue);

        const showRemainingInWeeksValue = weekDiffValue > SHOW_WEEKS_THRESHOLD;
        setShowRemainingInWeeks(showRemainingInWeeksValue);

        const countdownDisabledValue = timeElapsedValue || showRemainingInWeeksValue;
        setCountdownDisabled(countdownDisabledValue);

        setTimeInterval(countdownDisabledValue ? null : ONE_SECOND_IN_MS);
        setDuration(intervalToDuration({ start: timeElapsed ? end : nowValue, end }));
    }, [end, timeElapsed]);

    useInterval(() => {
        const nowValue = Date.now();
        if (nowValue <= Number(end)) {
            setDuration(intervalToDuration({ start: nowValue, end }));
        } else {
            setTimeElapsed(true);
            setTimeInterval(null);
        }
    }, timeInterval);

    return (
        <>
            {children}
            <Time duration={duration}>
                {showRemainingInWeeks
                    ? `${weeksDiff} ${t('common.time-remaining.weeks')}`
                    : showFullCounter
                    ? formattedDurationFullV2(duration, ':', undefined)
                    : formattedDuration(duration, DEFAULT_DATETIME_TRANSLATION_MAP)}
            </Time>
        </>
    );
};

const MINUTES_COLOR_THRESHOLD = 1;
const getColor = (duration: Duration, theme: ThemeInterface) => {
    if (
        duration.years ||
        duration.months ||
        duration.days ||
        duration.hours ||
        (duration.minutes && duration.minutes >= MINUTES_COLOR_THRESHOLD)
    ) {
        return theme.speedMarkets.position.card.textColor.primary;
    }
    return theme.status.loss;
};

const Time = styled.span<{
    duration: Duration;
}>`
    display: inline-block;
    color: ${(props) => getColor(props.duration, props.theme)};
    font-size: 12px;
    font-weight: 400;
    border: none;
    text-align: center;
    white-space: pre;
`;

export default SpeedTimeRemaining;

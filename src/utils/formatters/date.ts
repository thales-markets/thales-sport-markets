import { Duration, format, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';

export const formattedDuration = (
    duration: Duration,
    dateTimeTranslationMap: any,
    showSeconds = true,
    delimiter = ' ',
    firstTwo = false
) => {
    const formatted = [];
    if (duration.years) {
        return `${duration.years} ${
            duration.years > 1 ? dateTimeTranslationMap['years'] : dateTimeTranslationMap['year']
        }`;
    }
    if (duration.months) {
        return `${duration.months} ${
            duration.months > 1 ? dateTimeTranslationMap['months'] : dateTimeTranslationMap['month']
        }`;
    }
    if (duration.days) {
        if (duration.days === 1 && duration.hours === 0) {
            return `24 ${dateTimeTranslationMap['hours']}`;
        }

        return `${duration.days} ${
            duration.days > 1 ? dateTimeTranslationMap['days'] : dateTimeTranslationMap['day']
        } ${
            duration.hours
                ? `${duration.hours} ${
                      duration.hours > 1 ? dateTimeTranslationMap['hours'] : dateTimeTranslationMap['hour']
                  }`
                : ''
        }`;
    }
    if (duration.hours) {
        return `${duration.hours} ${
            duration.hours > 1 ? dateTimeTranslationMap['hours'] : dateTimeTranslationMap['hour']
        } ${
            duration.minutes
                ? `${duration.minutes} ${
                      duration.minutes > 1 ? dateTimeTranslationMap['minutes'] : dateTimeTranslationMap['minute']
                  }`
                : ''
        }`;
    }
    if (duration.minutes) {
        if (duration.minutes > 9 || !showSeconds) {
            return `${duration.minutes} ${
                duration.minutes > 1 ? dateTimeTranslationMap['minutes'] : dateTimeTranslationMap['minute']
            }`;
        }
        formatted.push(`${duration.minutes}${dateTimeTranslationMap['minutes-short']}`);
    }
    if (duration.seconds != null) {
        formatted.push(`${duration.seconds}${dateTimeTranslationMap['seconds-short']}`);
    }
    return (firstTwo ? formatted.slice(0, 2) : formatted).join(delimiter);
};

export const formattedDurationFull = (
    duration: Duration,
    dateTimeTranslationMap: any,
    delimiter = ' ',
    firstTwo = false
) => {
    const formatted = [];
    formatted.push(`${duration.days}${dateTimeTranslationMap['days-short']}`);
    formatted.push(`${duration.hours}${dateTimeTranslationMap['hours-short']}`);
    formatted.push(`${duration.minutes}${dateTimeTranslationMap['minutes-short']}`);
    return (firstTwo ? formatted.slice(0, 2) : formatted).join(delimiter);
};

export const formatTimestampForPromotionDate = (timestamp: number) => {
    return format(new Date(secondsToMilliseconds(timestamp)), 'd MMM Y');
};

export function timeToLocal(originalTime: number) {
    const d = new Date(secondsToMilliseconds(originalTime));
    return millisecondsToSeconds(
        Date.UTC(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds(),
            d.getMilliseconds()
        )
    );
}

export const formatShortDateWithFullTime = (date: Date | number) => format(date, 'd MMM yyyy HH:mm:ss');

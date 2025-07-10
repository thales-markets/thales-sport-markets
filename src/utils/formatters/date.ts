import { Duration, format, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import i18n from 'i18n';

export const DEFAULT_DATETIME_TRANSLATION_MAP = {
    years: i18n.t('common.time-remaining.years'),
    year: i18n.t('common.time-remaining.year'),
    months: i18n.t('common.time-remaining.months'),
    month: i18n.t('common.time-remaining.month'),
    weeks: i18n.t('common.time-remaining.weeks'),
    week: i18n.t('common.time-remaining.week'),
    days: i18n.t('common.time-remaining.days'),
    day: i18n.t('common.time-remaining.day'),
    hours: i18n.t('common.time-remaining.hours'),
    hour: i18n.t('common.time-remaining.hour'),
    minutes: i18n.t('common.time-remaining.minutes'),
    minute: i18n.t('common.time-remaining.minute'),
    seconds: i18n.t('common.time-remaining.seconds'),
    second: i18n.t('common.time-remaining.second'),
    'days-short': i18n.t('common.time-remaining.days-short'),
    'hours-short': i18n.t('common.time-remaining.hours-short'),
    'minutes-short': i18n.t('common.time-remaining.minutes-short'),
    'seconds-short': i18n.t('common.time-remaining.seconds-short'),
    'months-short': i18n.t('common.time-remaining.months-short'),
};

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

export const formattedDurationFullV2 = (duration: Duration, delimiter = ' ', firstTwo = false) => {
    const formatted = [];

    if (delimiter === ' ') {
        duration?.months &&
            duration.months > 0 &&
            formatted.push(`${duration.months}${DEFAULT_DATETIME_TRANSLATION_MAP['months-short']}`);
        duration?.days &&
            duration.days > 0 &&
            formatted.push(`${duration.days}${DEFAULT_DATETIME_TRANSLATION_MAP['days-short']}`);
        duration?.hours &&
            duration.hours > 0 &&
            formatted.push(`${duration.hours}${DEFAULT_DATETIME_TRANSLATION_MAP['hours-short']}`);
        duration?.minutes &&
            duration.minutes > 0 &&
            formatted.push(`${duration.minutes}${DEFAULT_DATETIME_TRANSLATION_MAP['minutes-short']}`);
        duration?.months === 0 &&
            duration?.days === 0 &&
            duration?.hours === 0 &&
            duration?.minutes === 0 &&
            formatted.push(`${duration.seconds}${DEFAULT_DATETIME_TRANSLATION_MAP['seconds-short']}`);
    } else {
        const PADDING_LENGTH = 2;
        duration?.hours && duration.hours > 0 && formatted.push(String(duration.hours).padStart(PADDING_LENGTH, '0'));
        formatted.push(String(duration.minutes).padStart(PADDING_LENGTH, '0'));
        formatted.push(String(duration.seconds).padStart(PADDING_LENGTH, '0'));
    }

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

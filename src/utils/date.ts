export const getDayOfYearUTC = (date: Date) => {
    // Get UTC midnight of the given date
    const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
    const currentUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    // Difference in milliseconds, then convert to days and add 1
    const diff = currentUTC - startOfYear;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

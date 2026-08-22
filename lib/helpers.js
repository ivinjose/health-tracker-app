import { format, sub } from "date-fns";

/**
 * Returns a copy of `date` with hours, minutes, and seconds subtracted so the
 * clock sits at the start of that local calendar day.
 *
 * Milliseconds are not stripped. The original date is not mutated.
 *
 * @param {Date|number} date - A `Date` (or timestamp) whose local time of day should be cleared.
 * @returns {Date} A new date at local 00:00:00, preserving leftover milliseconds.
 */
export function getDateWithoutTime(date) {
    const timePassed = format(date.valueOf(), 'H:m:s').split(':').map(Number)
    const [hoursPassed, minutesPassed, secondsPassed] = timePassed;
    const dateWithoutTime = sub(date, {
        hours: hoursPassed,
        minutes: minutesPassed,
        seconds: secondsPassed
    });
    return dateWithoutTime;
}

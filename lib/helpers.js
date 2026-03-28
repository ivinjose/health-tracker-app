import { format, getDay, sub } from "date-fns";

const START_OF_WEEK = 0;
const END_OF_WEEK = 6;
const REMINDER_EVENT_DURATION_HOURS = 1;

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

/**
 * Generate an array of dates between startDate and endDate (inclusive)
 * Skips weekends (Saturday and Sunday)
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @param {boolean} skipWeekends - Whether to skip weekends
 * @returns {Date[]} Array of dates
 */
export function getDatesInBetween(startDate, endDate, skipWeekends = true) {
    const dates = [];
    const currentDate = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate()
    ));
    const end = new Date(Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate()
    ));

    while (currentDate <= end) {
        const day = getDay(currentDate);
        // Skip weekends
        if (skipWeekends && (day !== START_OF_WEEK && day !== END_OF_WEEK)) {
            dates.push(new Date(currentDate));
        } else if (!skipWeekends) {
            dates.push(new Date(currentDate));
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
}

/**
 * Format a Date for Google Calendar URL (local time).
 * @param {Date} date - The date to format
 * @returns {string} Formatted string in YYYYMMDDTHHmmss
 */
export function toGoogleCalendarDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}${m}${d}T${h}${min}${s}`;
}

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Build a Google Calendar "Add event" URL with pre-filled title, date/time, and optional description.
 * Use a base time + offset.
 *
 * @param {Object} options
 * @param {string} options.title - Event title
 * @param {string} [options.description] - Optional event description
 *
 * @param {Date} [options.dateTime] - Reference date/time (e.g. "booking opens" at 08:00 on this date)
 * @param {number} [options.hoursBefore] - Hours to subtract: 0 = exact time, 1 = 1hr before, 24 = 1 day before
 * @returns {string} Full URL to open in the browser
 */
export function buildGoogleCalendarUrlOld(options) {
    console.log("options", options);
    const { title, description } = options;
    let startDate;
    // let endDate;

    if (options.dateTime != null && options.hoursBefore != null) {
        startDate = new Date(options.dateTime.getTime() - options.hoursBefore * MS_PER_HOUR);
        // const durationHours = REMINDER_EVENT_DURATION_HOURS;
        // endDate = new Date(startDate.getTime() + durationHours * MS_PER_HOUR);
    } else {
        throw new Error(
            "buildGoogleCalendarUrl: provide baseDate and hoursBefore"
        );
    }

    const base = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${toGoogleCalendarDateString(startDate)}/${toGoogleCalendarDateString(startDate)}`,
    });
    if (description) params.set("details", description);
    return `${base}?${params.toString()}`;
}

/**
 * Google Calendar "create event" URL (web). Native apps should use expo-calendar instead.
 */
export function buildGoogleCalendarUrl(options) {
    const { title, description } = options;
    let startDate;

    if (options.dateTime != null && options.hoursBefore != null) {
        startDate = new Date(options.dateTime.getTime() - options.hoursBefore * MS_PER_HOUR);
    } else {
        throw new Error(
            "buildGoogleCalendarUrl: provide dateTime and hoursBefore"
        );
    }

    const base = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${toGoogleCalendarDateString(startDate)}/${toGoogleCalendarDateString(startDate)}`,
    });
    if (description) params.set("details", description);
    return `${base}?${params.toString()}`;
}

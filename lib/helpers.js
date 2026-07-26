import { format, sub } from "date-fns";

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

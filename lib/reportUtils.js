import { SORT_ORDER } from '@/constants/sort';
import { format } from 'date-fns';

/**
 * Returns the date string to show for a report.
 *
 * Uses `report.displayDate` when it is already set. Otherwise formats
 * `report.timestamp` as `MMM dd, yyyy`. Returns an empty string when
 * `timestamp` is `null` or `undefined`.
 *
 * @param {{ displayDate?: string, timestamp?: number|string|null }} [report]
 * @returns {string}
 */
export function getDisplayDate(report) {
	if (report?.displayDate) return report.displayDate;
	if (report?.timestamp == null) return '';
	return format(Number(report.timestamp), 'MMM dd, yyyy');
}

/**
 * Returns a new array of reports, each with a computed `displayDate`.
 *
 * Existing report fields are copied. If a report already has `displayDate`,
 * that value is kept.
 *
 * @param {Array<{ displayDate?: string, timestamp?: number|string|null }>} [reports=[]]
 * @returns {Array<Object>}
 */
export function withDisplayDates(reports = []) {
	return reports.map((report) => ({
		...report,
		displayDate: getDisplayDate(report),
	}));
}

/**
 * Returns a new array of reports sorted by numeric `timestamp`.
 *
 * Missing or non-numeric timestamps are treated as invalid and moved to the
 * end. `null` timestamps become `0` via `Number(null)`. The input array is
 * not mutated. Any `direction` other than `DESC` sorts ascending.
 *
 * @param {Array<{ timestamp?: number|string|null }>} [reports=[]]
 * @param {string} [direction='ASC'] - `ASC` for oldest first, `DESC` for newest first.
 * @returns {Array<Object>}
 */
export function sortReportsByTimestamp(reports = [], direction = SORT_ORDER.ASC) {
	const multiplier = direction === SORT_ORDER.DESC ? -1 : 1;
	return [...reports].sort((a, b) => {
		const aTime = Number(a?.timestamp);
		const bTime = Number(b?.timestamp);
		if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
		if (Number.isNaN(aTime)) return 1;
		if (Number.isNaN(bTime)) return -1;
		return (aTime - bTime) * multiplier;
	});
}

/**
 * Looks up the display label for an investigation value.
 *
 * @param {Array<{ value: string, label: string }>} [investigations=[]]
 * @param {string} investigation - The investigation `value` to match.
 * @returns {string} The matching label, or `investigation` itself when none is found.
 */
export function getInvestigationLabel(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.label ?? investigation;
}

/**
 * Looks up the unit of measure for an investigation value.
 *
 * @param {Array<{ value: string, unit?: string }>} [investigations=[]]
 * @param {string} investigation - The investigation `value` to match.
 * @returns {string} The matching unit, or an empty string when none is found.
 */
export function getInvestigationUnit(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.unit ?? '';
}

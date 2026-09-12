/**
 * Formats an investigation reading as `"label - value"` with an optional unit.
 *
 * When `unit` is truthy it is appended with a leading space (`" mg/dL"`).
 * Falsy units are omitted entirely.
 *
 * @param {string} label - Investigation name shown before the dash.
 * @param {string|number} value - Recorded reading.
 * @param {string} [unit] - Unit of measure; omitted when empty.
 * @returns {string}
 */
export function formatInvestigationReading(label, value, unit) {
	const unitPart = unit ? ` ${unit}` : '';
	return `${label} - ${value}${unitPart}`;
}

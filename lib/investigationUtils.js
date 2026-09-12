/**
 * Converts a human-readable label into a lowercase hyphenated slug.
 *
 * Non-alphanumeric runs become a single hyphen. Leading and trailing hyphens
 * are removed. Non-string values are coerced with `String()`.
 *
 * @param {string} [label=''] - The label to slugify.
 * @returns {string} A URL-safe slug, or an empty string when nothing remains.
 */
export function slugifyLabel(label = '') {
	return String(label)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Whether the slug field still follows the label.
 *
 * Empty text is ignored so programmatic TextInput updates do not count as edits.
 * Sync stops once the typed slug differs from the current generated value.
 *
 * @param {string} slug
 * @param {string} generatedSlug
 * @returns {boolean}
 */
export function shouldSyncInvestigationSlug(slug, generatedSlug) {
	return slug === '' || slug === generatedSlug;
}

/**
 * True when the user has focused the slug field and typed something other than
 * the current generated suggestion. Unfocused/programmatic updates must not lock.
 *
 * @param {string} slug
 * @param {string} generatedSlug
 * @param {boolean} slugFocused
 * @returns {boolean}
 */
export function shouldLockInvestigationSlug(slug, generatedSlug, slugFocused) {
	return Boolean(slugFocused) && !shouldSyncInvestigationSlug(slug, generatedSlug);
}

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

export const HOME_WIDGETS_KEY = 'home-widget-slugs';

export const DEFAULT_HOME_WIDGET_SLUGS = ['hba1c', 'hdl'];

/**
 * Normalizes a stored home-widget value into a unique list of slugs.
 *
 * Non-arrays return `null` so callers can fall back to defaults. Empty arrays
 * are valid (the user removed every graph). Strings are trimmed; blanks and
 * duplicates are dropped, preserving first-seen order.
 *
 * @param {unknown} value - Parsed JSON from storage.
 * @returns {string[]|null}
 */
export function normalizeHomeWidgetSlugs(value) {
	if (!Array.isArray(value)) return null;

	const seen = new Set();
	const slugs = [];
	for (const item of value) {
		if (typeof item !== 'string') continue;
		const slug = item.trim();
		if (!slug || seen.has(slug)) continue;
		seen.add(slug);
		slugs.push(slug);
	}
	return slugs;
}

/**
 * Picks black or white text for a `#RRGGBB` background.
 *
 * @param {string} [hex]
 * @returns {string}
 */
export function contrastTextColor(hex) {
	const normalized = String(hex || '').replace('#', '');
	if (normalized.length !== 6) return '#ffffff';
	const r = parseInt(normalized.slice(0, 2), 16) / 255;
	const g = parseInt(normalized.slice(2, 4), 16) / 255;
	const b = parseInt(normalized.slice(4, 6), 16) / 255;
	if ([r, g, b].some((channel) => Number.isNaN(channel))) return '#ffffff';
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance > 0.55 ? '#18181b' : '#ffffff';
}

/**
 * Resolves catalog rows for a list of label ids, skipping unknown ids.
 *
 * @param {Array<{ _id?: string }>} [catalog=[]]
 * @param {unknown} [ids=[]]
 * @returns {Array<{ _id: string, name?: string, color?: string }>}
 */
export function getLabelsByIds(catalog = [], ids = []) {
	if (!Array.isArray(ids) || ids.length === 0) return [];
	const byId = new Map(
		(catalog || []).map((item) => [String(item?._id ?? ''), item])
	);
	return ids
		.map((id) => byId.get(id != null ? String(id) : ''))
		.filter(Boolean);
}

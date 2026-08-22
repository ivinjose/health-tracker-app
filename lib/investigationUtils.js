export function slugifyLabel(label = '') {
	return String(label)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function formatInvestigationReading(label, value, unit) {
	const unitPart = unit ? ` ${unit}` : '';
	return `${label} - ${value}${unitPart}`;
}

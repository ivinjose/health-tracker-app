export const LABEL_COLORS = [
	{ name: 'Red', color: '#EF4444' },
	{ name: 'Orange', color: '#F97316' },
	{ name: 'Yellow', color: '#EAB308' },
	{ name: 'Green', color: '#22C55E' },
	{ name: 'Teal', color: '#14B8A6' },
	{ name: 'Blue', color: '#3B82F6' },
	{ name: 'Indigo', color: '#4F46E5' },
	{ name: 'Violet', color: '#8B5CF6' },
	{ name: 'Pink', color: '#EC4899' },
	{ name: 'Brown', color: '#92400E' },
	{ name: 'Slate', color: '#64748B' },
	{ name: 'Charcoal', color: '#27272A' },
];

export const DEFAULT_LABEL_COLOR = '#3B82F6';

export const LABEL_FILTER_MAX = 20;

export const LABEL_COLOR_VALUES = LABEL_COLORS.map((item) => item.color);

export const isAllowedLabelColor = (value) => LABEL_COLOR_VALUES.includes(value);

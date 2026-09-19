import { contrastTextColor, getLabelsByIds } from '../labelUtils';

describe('contrastTextColor', () => {
	it('uses dark text on a light fill and white on a dark fill', () => {
		expect(contrastTextColor('#EAB308')).toBe('#18181b');
		expect(contrastTextColor('#3B82F6')).toBe('#ffffff');
	});
});

describe('getLabelsByIds', () => {
	const catalog = [
		{ _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Fasting', color: '#3B82F6' },
		{ _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Clinic', color: '#22C55E' },
	];

	it('returns catalog rows in the given id order and skips unknown ids', () => {
		expect(
			getLabelsByIds(catalog, [
				'bbbbbbbbbbbbbbbbbbbbbbbb',
				'missing',
				'aaaaaaaaaaaaaaaaaaaaaaaa',
			])
		).toEqual([catalog[1], catalog[0]]);
	});

	it('returns an empty list when there are no ids', () => {
		expect(getLabelsByIds(catalog, [])).toEqual([]);
		expect(getLabelsByIds(catalog)).toEqual([]);
	});
});

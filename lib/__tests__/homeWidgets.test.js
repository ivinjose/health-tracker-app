import { DEFAULT_HOME_WIDGET_SLUGS, normalizeHomeWidgetSlugs } from '../homeWidgets';

describe('normalizeHomeWidgetSlugs', () => {
	it('returns null for non-arrays so callers can use defaults', () => {
		expect(normalizeHomeWidgetSlugs(undefined)).toBeNull();
		expect(normalizeHomeWidgetSlugs(null)).toBeNull();
		expect(normalizeHomeWidgetSlugs('hba1c')).toBeNull();
		expect(normalizeHomeWidgetSlugs({ slug: 'hba1c' })).toBeNull();
	});

	it('keeps an empty array so a cleared overview stays empty', () => {
		expect(normalizeHomeWidgetSlugs([])).toEqual([]);
	});

	it('trims strings and drops blanks, non-strings, and duplicates', () => {
		expect(
			normalizeHomeWidgetSlugs([' hba1c ', '', 'hdl', 'hba1c', 12, null, '  tsh  '])
		).toEqual(['hba1c', 'hdl', 'tsh']);
	});

	it('preserves first-seen order', () => {
		expect(normalizeHomeWidgetSlugs(['hdl', 'hba1c', 'hdl'])).toEqual(['hdl', 'hba1c']);
	});

	it('exports the previous hardcoded overview as the default', () => {
		expect(DEFAULT_HOME_WIDGET_SLUGS).toEqual(['hba1c', 'hdl']);
	});
});

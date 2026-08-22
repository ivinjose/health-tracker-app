import { formatInvestigationReading, slugifyLabel } from '../investigationUtils';

describe('slugifyLabel', () => {
	it('returns an empty string when called with no argument', () => {
		expect(slugifyLabel()).toBe('');
	});

	it('returns an empty string for a blank or whitespace-only label', () => {
		expect(slugifyLabel('')).toBe('');
		expect(slugifyLabel('   ')).toBe('');
	});

	it('lowercases, trims, and replaces non-alphanumeric runs with a single hyphen', () => {
		expect(slugifyLabel('  Blood Pressure  ')).toBe('blood-pressure');
		expect(slugifyLabel('HbA1c')).toBe('hba1c');
		expect(slugifyLabel('foo---bar')).toBe('foo-bar');
		expect(slugifyLabel('Vitamin D (25-OH)')).toBe('vitamin-d-25-oh');
	});

	it('strips leading and trailing hyphens produced by punctuation', () => {
		expect(slugifyLabel('---Hello---')).toBe('hello');
		expect(slugifyLabel('***Glucose***')).toBe('glucose');
	});

	it('keeps digits and already-hyphenated slugs', () => {
		expect(slugifyLabel('tsh-3rd-gen')).toBe('tsh-3rd-gen');
		expect(slugifyLabel('A1C 2024')).toBe('a1c-2024');
	});

	it('coerces non-string values through String() before slugifying', () => {
		expect(slugifyLabel(123)).toBe('123');
	});
});

describe('formatInvestigationReading', () => {
	it('joins label and value with a dash when no unit is provided', () => {
		expect(formatInvestigationReading('Glucose', 95)).toBe('Glucose - 95');
	});

	it('appends the unit with a leading space when the unit is truthy', () => {
		expect(formatInvestigationReading('Glucose', 95, 'mg/dL')).toBe('Glucose - 95 mg/dL');
	});

	it('omits the unit when it is an empty string, null, or undefined', () => {
		expect(formatInvestigationReading('TSH', '2.1', '')).toBe('TSH - 2.1');
		expect(formatInvestigationReading('TSH', '2.1', null)).toBe('TSH - 2.1');
		expect(formatInvestigationReading('TSH', '2.1', undefined)).toBe('TSH - 2.1');
	});

	it('stringifies numeric values in place and keeps string values as-is', () => {
		expect(formatInvestigationReading('Weight', 70.5, 'kg')).toBe('Weight - 70.5 kg');
		expect(formatInvestigationReading('Note', 'n/a', '')).toBe('Note - n/a');
	});
});

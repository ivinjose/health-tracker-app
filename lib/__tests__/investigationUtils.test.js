import { formatInvestigationReading } from '../investigationUtils';

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

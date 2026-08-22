import { SORT_ORDER } from '@/constants/sort';
import {
	getDisplayDate,
	getInvestigationLabel,
	getInvestigationUnit,
	sortReportsByTimestamp,
	withDisplayDates,
} from '../reportUtils';

const januaryFifth = new Date(2024, 0, 5, 12, 0, 0, 0);
const marchFirst = new Date(2024, 2, 1, 8, 0, 0, 0);

describe('getDisplayDate', () => {
	it('returns displayDate when it is already set, even if timestamp is present', () => {
		expect(
			getDisplayDate({
				displayDate: 'Custom date',
				timestamp: januaryFifth.getTime(),
			})
		).toBe('Custom date');
	});

	it('returns an empty string when timestamp is null or undefined', () => {
		expect(getDisplayDate({ timestamp: null })).toBe('');
		expect(getDisplayDate({ timestamp: undefined })).toBe('');
		expect(getDisplayDate({})).toBe('');
		expect(getDisplayDate(undefined)).toBe('');
	});

	it('formats a numeric timestamp as MMM dd, yyyy', () => {
		expect(getDisplayDate({ timestamp: januaryFifth.getTime() })).toBe('Jan 05, 2024');
		expect(getDisplayDate({ timestamp: marchFirst.getTime() })).toBe('Mar 01, 2024');
	});

	it('coerces a numeric timestamp string with Number() before formatting', () => {
		expect(getDisplayDate({ timestamp: String(januaryFifth.getTime()) })).toBe(
			'Jan 05, 2024'
		);
	});

	it('falls through to timestamp formatting when displayDate is falsy', () => {
		expect(getDisplayDate({ displayDate: '', timestamp: januaryFifth.getTime() })).toBe(
			'Jan 05, 2024'
		);
	});
});

describe('withDisplayDates', () => {
	it('returns an empty array when called with no argument', () => {
		expect(withDisplayDates()).toEqual([]);
	});

	it('adds displayDate to each report without mutating the original array or objects', () => {
		const reports = [{ id: 'a', timestamp: januaryFifth.getTime() }];
		const result = withDisplayDates(reports);

		expect(result).toEqual([
			{ id: 'a', timestamp: januaryFifth.getTime(), displayDate: 'Jan 05, 2024' },
		]);
		expect(result).not.toBe(reports);
		expect(reports[0]).not.toHaveProperty('displayDate');
	});

	it('keeps an existing displayDate instead of recomputing it', () => {
		const reports = [
			{ timestamp: januaryFifth.getTime(), displayDate: 'Already set' },
		];

		expect(withDisplayDates(reports)[0].displayDate).toBe('Already set');
	});
});

describe('sortReportsByTimestamp', () => {
	const older = { id: 'older', timestamp: januaryFifth.getTime() };
	const newer = { id: 'newer', timestamp: marchFirst.getTime() };

	it('sorts ascending by default without mutating the input', () => {
		const reports = [newer, older];
		const result = sortReportsByTimestamp(reports);

		expect(result.map((report) => report.id)).toEqual(['older', 'newer']);
		expect(reports.map((report) => report.id)).toEqual(['newer', 'older']);
	});

	it('sorts descending when direction is DESC', () => {
		const result = sortReportsByTimestamp([older, newer], SORT_ORDER.DESC);
		expect(result.map((report) => report.id)).toEqual(['newer', 'older']);
	});

	it('treats any direction other than DESC as ascending', () => {
		const result = sortReportsByTimestamp([newer, older], 'SIDEWAYS');
		expect(result.map((report) => report.id)).toEqual(['older', 'newer']);
	});

	it('returns an empty array when called with no reports', () => {
		expect(sortReportsByTimestamp()).toEqual([]);
	});

	it('moves reports with non-numeric timestamps to the end', () => {
		const missing = { id: 'missing' };
		const invalid = { id: 'invalid', timestamp: 'not-a-date' };
		const result = sortReportsByTimestamp([missing, newer, invalid, older]);

		expect(result.map((report) => report.id)).toEqual([
			'older',
			'newer',
			'missing',
			'invalid',
		]);
	});

	it('keeps relative order when both timestamps are non-numeric', () => {
		const first = { id: 'first', timestamp: 'nope' };
		const second = { id: 'second' };
		const result = sortReportsByTimestamp([first, second]);

		expect(result.map((report) => report.id)).toEqual(['first', 'second']);
	});

	it('treats a null timestamp as 0 because Number(null) is 0', () => {
		const zeroish = { id: 'null-ts', timestamp: null };
		const later = { id: 'later', timestamp: januaryFifth.getTime() };
		const result = sortReportsByTimestamp([later, zeroish]);

		expect(result.map((report) => report.id)).toEqual(['null-ts', 'later']);
	});

	it('accepts numeric timestamp strings', () => {
		const result = sortReportsByTimestamp([
			{ id: 'newer', timestamp: String(marchFirst.getTime()) },
			{ id: 'older', timestamp: String(januaryFifth.getTime()) },
		]);

		expect(result.map((report) => report.id)).toEqual(['older', 'newer']);
	});
});

const investigations = [
	{ value: 'glucose', label: 'Glucose', unit: 'mg/dL' },
	{ value: 'tsh', label: 'TSH', unit: 'mIU/L' },
	{ value: 'notes', label: 'Notes' },
];

describe('getInvestigationLabel', () => {
	it('returns the matching label when the value exists', () => {
		expect(getInvestigationLabel(investigations, 'glucose')).toBe('Glucose');
	});

	it('returns the raw investigation value when no match is found', () => {
		expect(getInvestigationLabel(investigations, 'missing')).toBe('missing');
	});

	it('uses an empty investigations list by default', () => {
		expect(getInvestigationLabel(undefined, 'glucose')).toBe('glucose');
	});
});

describe('getInvestigationUnit', () => {
	it('returns the matching unit when present', () => {
		expect(getInvestigationUnit(investigations, 'glucose')).toBe('mg/dL');
	});

	it('returns an empty string when the investigation has no unit', () => {
		expect(getInvestigationUnit(investigations, 'notes')).toBe('');
	});

	it('returns an empty string when no match is found', () => {
		expect(getInvestigationUnit(investigations, 'missing')).toBe('');
		expect(getInvestigationUnit(undefined, 'glucose')).toBe('');
	});
});

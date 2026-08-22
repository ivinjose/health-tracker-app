import { getDateWithoutTime } from '../helpers';

describe('getDateWithoutTime', () => {
	it('returns a new Date at local midnight for a datetime in the afternoon', () => {
		const input = new Date(2024, 2, 15, 14, 30, 45, 0);
		const result = getDateWithoutTime(input);

		expect(result).toBeInstanceOf(Date);
		expect(result).not.toBe(input);
		expect(result.getFullYear()).toBe(2024);
		expect(result.getMonth()).toBe(2);
		expect(result.getDate()).toBe(15);
		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
	});

	it('does not mutate the original date', () => {
		const input = new Date(2024, 5, 1, 9, 15, 30);
		const originalTime = input.getTime();

		getDateWithoutTime(input);

		expect(input.getTime()).toBe(originalTime);
	});

	it('leaves a date that is already at 00:00:00 unchanged in clock fields', () => {
		const input = new Date(2024, 0, 1, 0, 0, 0, 0);
		const result = getDateWithoutTime(input);

		expect(result.getTime()).toBe(input.getTime());
		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
	});

	it('preserves milliseconds because only hours, minutes, and seconds are subtracted', () => {
		const input = new Date(2024, 8, 22, 11, 45, 10, 123);
		const result = getDateWithoutTime(input);

		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
		expect(result.getMilliseconds()).toBe(123);
	});

	it('handles single-digit hours, minutes, and seconds', () => {
		const input = new Date(2025, 0, 2, 1, 2, 3, 0);
		const result = getDateWithoutTime(input);

		expect(result.getFullYear()).toBe(2025);
		expect(result.getMonth()).toBe(0);
		expect(result.getDate()).toBe(2);
		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
	});

	it('strips time from a late-evening date without changing the calendar day', () => {
		const input = new Date(2024, 11, 31, 23, 59, 59, 0);
		const result = getDateWithoutTime(input);

		expect(result.getFullYear()).toBe(2024);
		expect(result.getMonth()).toBe(11);
		expect(result.getDate()).toBe(31);
		expect(result.getHours()).toBe(0);
	});
});

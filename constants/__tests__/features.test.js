import { parseFeatureFlag } from '../features';

describe('parseFeatureFlag', () => {
	it('uses the fallback when the value is missing', () => {
		expect(parseFeatureFlag(undefined, true)).toBe(true);
		expect(parseFeatureFlag(null, false)).toBe(false);
		expect(parseFeatureFlag('', true)).toBe(true);
		expect(parseFeatureFlag('  ', false)).toBe(false);
	});

	it('parses true and false strings', () => {
		expect(parseFeatureFlag('true', false)).toBe(true);
		expect(parseFeatureFlag('TRUE', false)).toBe(true);
		expect(parseFeatureFlag('1', false)).toBe(true);
		expect(parseFeatureFlag('false', true)).toBe(false);
		expect(parseFeatureFlag('0', true)).toBe(false);
	});

	it('uses the fallback for unrecognized values', () => {
		expect(parseFeatureFlag('yes', false)).toBe(false);
		expect(parseFeatureFlag('no', true)).toBe(true);
	});
});

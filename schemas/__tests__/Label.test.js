import formSchema from '../Label';
import { DEFAULT_LABEL_COLOR } from '@/constants/labels';

describe('label form schema', () => {
	it('accepts a name and a palette color', () => {
		expect(formSchema.safeParse({ name: 'Fasting', color: DEFAULT_LABEL_COLOR }).success).toBe(
			true
		);
	});

	it('rejects a missing name', () => {
		expect(formSchema.safeParse({ name: '', color: DEFAULT_LABEL_COLOR }).success).toBe(false);
		expect(formSchema.safeParse({ name: '  ', color: DEFAULT_LABEL_COLOR }).success).toBe(false);
	});

	it('rejects a color outside the allowlist', () => {
		expect(formSchema.safeParse({ name: 'Fasting', color: '#000000' }).success).toBe(false);
		expect(formSchema.safeParse({ name: 'Fasting', color: '' }).success).toBe(false);
	});
});

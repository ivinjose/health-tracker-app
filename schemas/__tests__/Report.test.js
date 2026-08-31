import formSchema, { isEmptyDraft } from '../Report';

describe('isEmptyDraft', () => {
	it('is empty when investigation and value are missing', () => {
		expect(isEmptyDraft({})).toBe(true);
		expect(isEmptyDraft({ investigation: '', value: '' })).toBe(true);
		expect(isEmptyDraft({ investigation: '  ', value: '  ', date: new Date() })).toBe(
			true
		);
	});

	it('is not empty when investigation or value is present', () => {
		expect(isEmptyDraft({ investigation: 'hba1c', value: '' })).toBe(false);
		expect(isEmptyDraft({ investigation: '', value: '6.5' })).toBe(false);
		expect(isEmptyDraft({ investigation: 'hba1c', value: '6.5' })).toBe(false);
	});

	it('is empty when only remarks or date are set', () => {
		expect(isEmptyDraft({ remarks: 'fasted' })).toBe(true);
		expect(isEmptyDraft({ date: new Date(), remarks: 'fasted' })).toBe(true);
	});
});

describe('report form schema', () => {
	const validRow = {
		investigation: 'hba1c',
		value: '6.5',
		date: new Date(2026, 7, 22),
		remarks: '',
	};

	it('accepts a complete row without a report file', () => {
		expect(formSchema.safeParse(validRow).success).toBe(true);
		expect(formSchema.safeParse({ ...validRow, report: undefined }).success).toBe(true);
		expect(formSchema.safeParse({ ...validRow, report: null }).success).toBe(true);
	});

	it('rejects a missing investigation, value, or date', () => {
		expect(formSchema.safeParse({ ...validRow, investigation: '' }).success).toBe(false);
		expect(formSchema.safeParse({ ...validRow, value: '' }).success).toBe(false);
		expect(formSchema.safeParse({ ...validRow, date: undefined }).success).toBe(false);
	});

	it('accepts an optional pdf or image report file', () => {
		expect(
			formSchema.safeParse({
				...validRow,
				report: {
					uri: 'file:///tmp/a.pdf',
					name: 'a.pdf',
					size: 1024,
					type: 'application/pdf',
				},
			}).success
		).toBe(true);
		expect(
			formSchema.safeParse({
				...validRow,
				report: {
					uri: 'file:///tmp/b.jpg',
					fileName: 'b.jpg',
					type: 'image',
					kind: 'image',
				},
			}).success
		).toBe(true);
	});

	it('rejects an oversized or unsupported report file', () => {
		expect(
			formSchema.safeParse({
				...validRow,
				report: {
					uri: 'file:///tmp/a.pdf',
					name: 'a.pdf',
					size: 1024 * 1024 * 4,
					type: 'application/pdf',
				},
			}).success
		).toBe(false);
		expect(
			formSchema.safeParse({
				...validRow,
				report: {
					uri: 'file:///tmp/a.txt',
					name: 'a.txt',
					size: 12,
					type: 'text/plain',
				},
			}).success
		).toBe(false);
	});
});

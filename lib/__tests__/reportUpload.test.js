import {
	buildCreateReportRequest,
	getReportFileName,
	getReportFileSize,
	getReportMimeType,
	normalizePickedFile,
	toFormDataFile,
} from '../reportUpload';

describe('picked file helpers', () => {
	it('reads mime, name, and size from document-picker and image-picker shapes', () => {
		const documentAsset = {
			uri: 'file:///tmp/a.pdf',
			name: 'a.pdf',
			size: 20,
			mimeType: 'application/pdf',
		};
		expect(getReportMimeType(documentAsset)).toBe('application/pdf');
		expect(getReportFileName(documentAsset)).toBe('a.pdf');
		expect(getReportFileSize(documentAsset)).toBe(20);

		const photoAsset = {
			uri: 'file:///tmp/b.jpg',
			fileName: 'b.jpg',
			fileSize: 40,
			mimeType: 'image/jpeg',
		};
		expect(getReportMimeType(photoAsset)).toBe('image/jpeg');
		expect(getReportFileName(photoAsset)).toBe('b.jpg');
		expect(getReportFileSize(photoAsset)).toBe(40);
	});

	it('normalizes a picker asset to uri, name, size, and type', () => {
		expect(
			normalizePickedFile({
				uri: 'file:///tmp/a.png',
				name: 'a.png',
				size: 12,
				mimeType: 'image/png',
			})
		).toEqual({
			uri: 'file:///tmp/a.png',
			name: 'a.png',
			size: 12,
			type: 'image/png',
			file: undefined,
		});
	});

	it('returns a React Native FormData file part from a normalized pick', () => {
		expect(
			toFormDataFile({
				uri: 'file:///tmp/a.pdf',
				name: 'a.pdf',
				type: 'application/pdf',
			})
		).toEqual({
			uri: 'file:///tmp/a.pdf',
			name: 'a.pdf',
			type: 'application/pdf',
		});
	});
});

describe('buildCreateReportRequest', () => {
	const date = new Date(1700000000000);
	const base = {
		investigation: 'hba1c',
		value: '6.5',
		date,
		remarks: 'fasted',
	};

	it('throws when required fields are missing', () => {
		expect(() => buildCreateReportRequest({ ...base, investigation: '' })).toThrow(
			'Could not create report.'
		);
		expect(() => buildCreateReportRequest({ ...base, value: '' })).toThrow(
			'Could not create report.'
		);
		expect(() => buildCreateReportRequest({ ...base, date: undefined })).toThrow(
			'Could not create report.'
		);
	});

	it('sends JSON when no file is attached', () => {
		const { body, config } = buildCreateReportRequest(base);
		expect(config).toBeUndefined();
		expect(body).toEqual({
			investigation: 'hba1c',
			value: 6.5,
			timestamp: date.valueOf(),
			appointment: undefined,
			remarks: 'fasted',
		});
	});

	it('sends multipart when a file is attached', () => {
		const append = jest.spyOn(FormData.prototype, 'append');
		const file = {
			uri: 'file:///tmp/a.pdf',
			name: 'a.pdf',
			type: 'application/pdf',
			size: 12,
		};

		try {
			const { body, config } = buildCreateReportRequest({ ...base, report: file });
			expect(body).toBeInstanceOf(FormData);
			expect(config.headers['Content-Type']).toBe('multipart/form-data');
			expect(append).toHaveBeenCalledWith('investigation', 'hba1c');
			expect(append).toHaveBeenCalledWith('value', '6.5');
			expect(append).toHaveBeenCalledWith('timestamp', String(date.valueOf()));
			expect(append).toHaveBeenCalledWith('remarks', 'fasted');
			expect(append).toHaveBeenCalledWith(
				'report',
				expect.objectContaining({
					uri: file.uri,
					name: 'a.pdf',
					type: 'application/pdf',
				})
			);
		} finally {
			append.mockRestore();
		}
	});
});

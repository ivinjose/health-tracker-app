import {
	buildCreateReportRequest,
	buildUpdateReportRequest,
	existingReportFile,
	getReportFileLabel,
	getReportFileName,
	getReportFileSize,
	getReportMimeType,
	isExistingReportFile,
	isMissingReportFile,
	isPdfOrImage,
	isWithinUploadLimit,
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

	it('does not treat image-picker type "image" as a mime type', () => {
		expect(
			getReportMimeType({
				uri: 'file:///tmp/b.jpg',
				fileName: 'b.jpg',
				type: 'image',
				mimeType: 'image/jpeg',
			})
		).toBe('image/jpeg');
	});

	it('infers mime type from the filename when the picker omits it', () => {
		expect(
			getReportMimeType({
				uri: 'file:///tmp/scan.heic',
				fileName: 'scan.heic',
				type: 'image',
			})
		).toBe('image/heic');
		expect(
			getReportMimeType({
				uri: 'file:///tmp/lab.pdf',
				name: 'lab.pdf',
			})
		).toBe('application/pdf');
	});

	it('treats any image or pdf as an accepted report file, and missing as valid', () => {
		expect(isMissingReportFile(undefined)).toBe(true);
		expect(isMissingReportFile(null)).toBe(true);
		expect(isPdfOrImage(undefined)).toBe(true);
		expect(isPdfOrImage({ type: 'application/pdf', name: 'a.pdf' })).toBe(true);
		expect(isPdfOrImage({ type: 'image', kind: 'image', name: 'a.jpg' })).toBe(true);
		expect(isPdfOrImage({ mimeType: 'image/heic', fileName: 'a.heic' })).toBe(true);
		expect(isPdfOrImage({ type: 'text/plain', name: 'a.txt' })).toBe(false);
	});

	it('treats an existing server attachment as a keep-in-place sentinel', () => {
		expect(existingReportFile('')).toBeUndefined();
		expect(existingReportFile('profile-1_1_abc.png')).toEqual({
			existing: true,
			name: 'profile-1_1_abc.png',
		});
		expect(isExistingReportFile({ existing: true, name: 'profile-1_1_abc.png' })).toBe(true);
		expect(isExistingReportFile({ uri: 'file:///tmp/a.pdf', name: 'a.pdf' })).toBe(false);
		expect(getReportFileLabel({ existing: true, name: 'profile-1_1_abc.png' })).toBe(
			'Attached report'
		);
		expect(isPdfOrImage({ existing: true, name: 'profile-1_1_abc.png' })).toBe(true);
		expect(isWithinUploadLimit({ existing: true, name: 'profile-1_1_abc.png' })).toBe(true);
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
			kind: undefined,
			file: undefined,
		});
	});

	it('defaults image-picker assets without a mime type to an image', () => {
		expect(
			normalizePickedFile(
				{
					uri: 'file:///tmp/b.jpg',
					fileName: 'b.jpg',
					type: 'image',
				},
				{ kind: 'image' }
			)
		).toEqual({
			uri: 'file:///tmp/b.jpg',
			name: 'b.jpg',
			size: undefined,
			type: 'image/jpeg',
			kind: 'image',
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
		investigation: '6a8962dd0274ed29b52dd702',
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
			investigation: '6a8962dd0274ed29b52dd702',
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
			expect(append).toHaveBeenCalledWith('investigation', '6a8962dd0274ed29b52dd702');
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

describe('buildUpdateReportRequest', () => {
	const date = new Date(1700000000000);
	const base = {
		id: '6a8962dd0274ed29b52dd702',
		investigation: '6a8962dd0274ed29b52dd702',
		value: '6.5',
		date,
		remarks: 'fasted',
	};

	it('throws when required fields are missing', () => {
		expect(() => buildUpdateReportRequest({ ...base, id: '' })).toThrow(
			'Could not update report.'
		);
		expect(() => buildUpdateReportRequest({ ...base, investigation: '' })).toThrow(
			'Could not update report.'
		);
		expect(() => buildUpdateReportRequest({ ...base, value: '' })).toThrow(
			'Could not update report.'
		);
		expect(() => buildUpdateReportRequest({ ...base, date: undefined })).toThrow(
			'Could not update report.'
		);
	});

	it('sends JSON only when keeping an existing attachment', () => {
		const { body, config } = buildUpdateReportRequest({
			...base,
			report: existingReportFile('profile-1_1_abc.png'),
		});
		expect(config).toBeUndefined();
		expect(body).toEqual({
			investigation: '6a8962dd0274ed29b52dd702',
			value: 6.5,
			timestamp: date.valueOf(),
			remarks: 'fasted',
		});
		expect(body.removeFile).toBeUndefined();
	});

	it('sends removeFile when the attachment is cleared', () => {
		const { body, config } = buildUpdateReportRequest({ ...base, report: undefined });
		expect(config).toBeUndefined();
		expect(body).toEqual({
			investigation: '6a8962dd0274ed29b52dd702',
			value: 6.5,
			timestamp: date.valueOf(),
			remarks: 'fasted',
			removeFile: true,
		});
	});

	it('sends multipart when a new file is picked', () => {
		const append = jest.spyOn(FormData.prototype, 'append');
		const file = {
			uri: 'file:///tmp/a.pdf',
			name: 'a.pdf',
			type: 'application/pdf',
			size: 12,
		};

		try {
			const { body, config } = buildUpdateReportRequest({ ...base, report: file });
			expect(body).toBeInstanceOf(FormData);
			expect(config.headers['Content-Type']).toBe('multipart/form-data');
			expect(append).toHaveBeenCalledWith('investigation', '6a8962dd0274ed29b52dd702');
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
			expect(append).not.toHaveBeenCalledWith('removeFile', expect.anything());
		} finally {
			append.mockRestore();
		}
	});
});

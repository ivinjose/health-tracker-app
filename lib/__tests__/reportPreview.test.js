import {
	arrayBufferToBase64,
	buildPdfViewerHtml,
	createReportPreview,
	previewKindFromMime,
	revokeReportPreview,
} from '../reportPreview';

describe('arrayBufferToBase64', () => {
	it('encodes bytes from a Uint8Array and an ArrayBuffer', () => {
		const bytes = new Uint8Array([104, 105]);
		expect(arrayBufferToBase64(bytes)).toBe('aGk=');
		expect(arrayBufferToBase64(bytes.buffer)).toBe('aGk=');
	});

	it('encodes an empty payload', () => {
		expect(arrayBufferToBase64(new Uint8Array())).toBe('');
	});
});

describe('previewKindFromMime', () => {
	it('classifies pdf, image, and unknown types', () => {
		expect(previewKindFromMime('application/pdf')).toBe('pdf');
		expect(previewKindFromMime('image/png')).toBe('image');
		expect(previewKindFromMime('image/heic')).toBe('image');
		expect(previewKindFromMime('text/plain')).toBe('unknown');
		expect(previewKindFromMime(undefined)).toBe('unknown');
	});
});

describe('createReportPreview', () => {
	it('builds an image data URI from the filename extension', () => {
		const preview = createReportPreview(new Uint8Array([1, 2, 3]), 'scan.png');
		expect(preview.kind).toBe('image');
		expect(preview.mime).toBe('image/png');
		expect(preview.dataUri).toBe('data:image/png;base64,AQID');
		expect(preview.blobUrl).toBeUndefined();
	});

	it('builds a pdf preview with a data URI', () => {
		const preview = createReportPreview(new Uint8Array([1, 2, 3]), 'lab.pdf');
		expect(preview.kind).toBe('pdf');
		expect(preview.mime).toBe('application/pdf');
		expect(preview.dataUri).toBe('data:application/pdf;base64,AQID');
		expect(preview.base64).toBe('AQID');
		revokeReportPreview(preview);
	});

	it('returns unknown when the filename has no previewable type', () => {
		const preview = createReportPreview(new Uint8Array([1]), 'notes.bin');
		expect(preview.kind).toBe('unknown');
		expect(preview.mime).toBeUndefined();
		expect(preview.dataUri).toBeUndefined();
	});
});

describe('buildPdfViewerHtml', () => {
	it('embeds the base64 payload and pdf.js', () => {
		const html = buildPdfViewerHtml('AAAA');
		expect(html).toContain('AAAA');
		expect(html).toContain('pdf.js');
		expect(html).toContain('pdf.worker.min.js');
		expect(html).toContain('id="prev"');
		expect(html).toContain('id="next"');
	});
});

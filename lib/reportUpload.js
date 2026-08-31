export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
export const REPORT_PICKER_TYPES = ['application/pdf', 'image/*'];

function isMimeType(value) {
	return typeof value === 'string' && value.includes('/');
}

export function isMissingReportFile(file) {
	return file == null || file === '';
}

export function getReportFileName(file) {
	if (isMissingReportFile(file)) return '';
	return file.name || file.fileName || file.file?.name || '';
}

export function getReportFileSize(file) {
	if (isMissingReportFile(file)) return undefined;
	return file.size ?? file.fileSize ?? file.file?.size;
}

export function mimeFromFileName(name) {
	const ext = String(name || '').split('.').pop()?.toLowerCase();
	if (!ext || ext === String(name || '').toLowerCase()) return undefined;
	if (ext === 'pdf') return 'application/pdf';
	if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
	if (['png', 'gif', 'webp', 'heic', 'heif'].includes(ext)) return `image/${ext}`;
	return undefined;
}

export function getReportMimeType(file) {
	if (isMissingReportFile(file)) return undefined;
	if (isMimeType(file.type)) return file.type;
	if (isMimeType(file.mimeType)) return file.mimeType;
	if (isMimeType(file.file?.type)) return file.file.type;
	return mimeFromFileName(getReportFileName(file));
}

export function isPdfOrImage(file) {
	if (isMissingReportFile(file)) return true;
	const mime = (getReportMimeType(file) || '').toLowerCase();
	if (mime === 'application/pdf' || mime.startsWith('image/')) return true;
	return file.kind === 'image' || file.type === 'image';
}

export function isWithinUploadLimit(file) {
	if (isMissingReportFile(file)) return true;
	const size = getReportFileSize(file);
	if (size == null) return true;
	return size <= MAX_UPLOAD_SIZE;
}

export function normalizePickedFile(asset, { kind } = {}) {
	if (!asset) return undefined;
	const mime = getReportMimeType(asset);
	return {
		uri: asset.uri,
		name: getReportFileName(asset) || (kind === 'image' ? 'report.jpg' : 'report'),
		size: getReportFileSize(asset),
		type: mime || (kind === 'image' || asset.type === 'image' ? 'image/jpeg' : undefined),
		kind: kind || (asset.type === 'image' ? 'image' : undefined),
		file: asset.file,
	};
}

function isBrowserFile(value) {
	return typeof File !== 'undefined' && value instanceof File;
}

export function toFormDataFile(file) {
	if (isBrowserFile(file)) return file;
	if (isBrowserFile(file?.file)) return file.file;
	return {
		uri: file.uri,
		name: getReportFileName(file) || 'report',
		type: getReportMimeType(file) || 'application/octet-stream',
	};
}

export function multipartRequestConfig() {
	return {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		transformRequest: [
			(payload, headers) => {
				// Drop the header so the runtime can set the multipart boundary.
				if (headers && typeof headers.delete === 'function') {
					headers.delete('Content-Type');
				}
				return payload;
			},
		],
	};
}

export function buildCreateReportRequest(data) {
	const { investigation, value, date, remarks, appointment, report } = data;
	const parsedNumber = Number(value);

	if (!investigation || !parsedNumber || !date) {
		throw new Error('Could not create report.');
	}

	const fields = {
		investigation,
		value: parsedNumber,
		timestamp: date.valueOf(),
		appointment: appointment || undefined,
		remarks,
	};

	if (isMissingReportFile(report)) {
		return { body: fields, config: undefined };
	}

	const formData = new FormData();
	formData.append('investigation', investigation);
	formData.append('value', String(parsedNumber));
	formData.append('timestamp', String(date.valueOf()));
	if (appointment) {
		formData.append('appointment', appointment);
	}
	if (remarks) {
		formData.append('remarks', remarks);
	}

	const formFile = toFormDataFile(report);
	if (isBrowserFile(formFile)) {
		formData.append('report', formFile, getReportFileName(report) || 'report');
	} else {
		formData.append('report', formFile);
	}

	return { body: formData, config: multipartRequestConfig() };
}

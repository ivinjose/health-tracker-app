export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
export const ACCEPTED_FILE_TYPES = [
	'image/png',
	'image/jpeg',
	'image/jpg',
	'application/pdf',
];

export function getReportMimeType(file) {
	if (!file) return undefined;
	return file.type || file.mimeType || file.file?.type;
}

export function getReportFileName(file) {
	if (!file) return 'report';
	return file.name || file.fileName || file.file?.name || 'report';
}

export function getReportFileSize(file) {
	if (!file) return undefined;
	return file.size ?? file.fileSize ?? file.file?.size;
}

export function normalizePickedFile(asset) {
	if (!asset) return undefined;
	return {
		uri: asset.uri,
		name: getReportFileName(asset),
		size: getReportFileSize(asset),
		type: getReportMimeType(asset),
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
		name: getReportFileName(file),
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

	if (!report) {
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
		formData.append('report', formFile, getReportFileName(report));
	} else {
		formData.append('report', formFile);
	}

	return { body: formData, config: multipartRequestConfig() };
}

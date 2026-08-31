import { mimeFromFileName } from '@/lib/reportUpload';

const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

function toUint8Array(data) {
	if (data == null) {
		return new Uint8Array();
	}
	if (data instanceof Uint8Array) {
		return data;
	}
	if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
		return new Uint8Array(data);
	}
	if (ArrayBuffer.isView(data)) {
		return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	}
	throw new Error('Could not read report file.');
}

export function arrayBufferToBase64(data) {
	const bytes = toUint8Array(data);
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(bytes).toString('base64');
	}
	let binary = '';
	const chunkSize = 0x2000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}
	return btoa(binary);
}

export function previewKindFromMime(mime) {
	const normalized = String(mime || '').toLowerCase();
	if (normalized === 'application/pdf') return 'pdf';
	if (normalized.startsWith('image/')) return 'image';
	return 'unknown';
}

function createBlobUrl(bytes, mime) {
	if (
		!mime ||
		typeof document === 'undefined' ||
		typeof Blob === 'undefined' ||
		typeof URL === 'undefined' ||
		typeof URL.createObjectURL !== 'function'
	) {
		return undefined;
	}
	try {
		return URL.createObjectURL(new Blob([bytes], { type: mime }));
	} catch {
		return undefined;
	}
}

export function createReportPreview(data, filename) {
	const mime = mimeFromFileName(filename);
	const kind = previewKindFromMime(mime);
	const bytes = toUint8Array(data);
	const base64 = arrayBufferToBase64(bytes);
	const dataUri = mime ? `data:${mime};base64,${base64}` : undefined;
	const blobUrl = kind === 'pdf' ? createBlobUrl(bytes, mime) : undefined;

	return { kind, mime, base64, dataUri, blobUrl };
}

export function revokeReportPreview(preview) {
	if (
		preview?.blobUrl &&
		typeof URL !== 'undefined' &&
		typeof URL.revokeObjectURL === 'function'
	) {
		try {
			URL.revokeObjectURL(preview.blobUrl);
		} catch {
			// Expo's URL polyfill can throw outside a real browser.
		}
	}
}

export function buildPdfViewerHtml(base64) {
	const payload = String(base64 || '');
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3" />
	<style>
		html, body { margin: 0; padding: 0; height: 100%; background: #111; color: #fff; font-family: system-ui, sans-serif; }
		#toolbar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 8px 12px; background: #1c1c1e; }
		#toolbar button { font-size: 16px; padding: 6px 12px; }
		#page { min-width: 4.5em; text-align: center; font-size: 14px; }
		#stage { height: calc(100% - 48px); overflow: auto; display: flex; justify-content: center; padding: 8px; box-sizing: border-box; }
		canvas { max-width: 100%; height: auto; background: #fff; }
		#error { padding: 24px; text-align: center; }
	</style>
</head>
<body>
	<div id="toolbar">
		<button id="prev" type="button">Prev</button>
		<span id="page">1 / 1</span>
		<button id="next" type="button">Next</button>
	</div>
	<div id="stage"><canvas id="pdf"></canvas></div>
	<script src="${PDFJS_CDN}/pdf.min.js"></script>
	<script>
		(function () {
			var status = document.getElementById('page');
			function fail(message) {
				document.body.innerHTML = '<p id="error">' + message + '</p>';
			}
			if (typeof pdfjsLib === 'undefined') {
				fail('Could not load the PDF viewer.');
				return;
			}
			pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS_CDN}/pdf.worker.min.js';
			var raw;
			try {
				raw = atob('${payload}');
			} catch (err) {
				fail('Could not read this PDF.');
				return;
			}
			var bytes = new Uint8Array(raw.length);
			for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
			var canvas = document.getElementById('pdf');
			var ctx = canvas.getContext('2d');
			var pdfDoc = null;
			var pageNum = 1;

			function renderPage(num) {
				pdfDoc.getPage(num).then(function (page) {
					var viewport = page.getViewport({ scale: 1.25 });
					canvas.height = viewport.height;
					canvas.width = viewport.width;
					return page.render({ canvasContext: ctx, viewport: viewport }).promise;
				}).then(function () {
					status.textContent = num + ' / ' + pdfDoc.numPages;
					document.getElementById('prev').disabled = num <= 1;
					document.getElementById('next').disabled = num >= pdfDoc.numPages;
				}).catch(function () {
					fail('Could not render this PDF.');
				});
			}

			pdfjsLib.getDocument({ data: bytes }).promise.then(function (pdf) {
				pdfDoc = pdf;
				renderPage(pageNum);
			}).catch(function () {
				fail('Could not open this PDF.');
			});

			document.getElementById('prev').onclick = function () {
				if (pageNum <= 1) return;
				pageNum -= 1;
				renderPage(pageNum);
			};
			document.getElementById('next').onclick = function () {
				if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
				pageNum += 1;
				renderPage(pageNum);
			};
		})();
	</script>
</body>
</html>`;
}

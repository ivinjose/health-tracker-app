import { arrayBufferToBase64 } from '@/lib/reportPreview';
import { toFormDataFile, multipartRequestConfig } from '@/lib/reportUpload';
import { readBackupPreviewFromZip, INVALID_BUNDLE_MESSAGE } from '@/lib/backup';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

const ZIP_TYPES = [
	'application/zip',
	'application/x-zip-compressed',
	'application/octet-stream',
];

const safeFilename = (name) => {
	const raw = String(name || 'health-tracker-backup.zip');
	const base = raw.replace(/[/\\]/g, '');
	return base || 'health-tracker-backup.zip';
};

export async function saveBackupToDevice(data, filename) {
	const name = safeFilename(filename);
	if (Platform.OS === 'web') {
		if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
			throw new Error('Could not save backup.');
		}
		const blob = new Blob([data], { type: 'application/zip' });
		const url = URL.createObjectURL(blob);
		try {
			const link = document.createElement('a');
			link.href = url;
			link.download = name;
			link.click();
		} finally {
			URL.revokeObjectURL(url);
		}
		return;
	}

	const FileSystem = await import('expo-file-system/legacy');
	const Sharing = await import('expo-sharing');
	const path = `${FileSystem.cacheDirectory}${name}`;
	await FileSystem.writeAsStringAsync(path, arrayBufferToBase64(data), {
		encoding: FileSystem.EncodingType.Base64,
	});
	if (!(await Sharing.isAvailableAsync())) {
		throw new Error('Could not save backup.');
	}
	await Sharing.shareAsync(path, {
		mimeType: 'application/zip',
		UTI: 'public.zip-archive',
		dialogTitle: 'Save backup',
	});
}

export async function pickBackupZip() {
	const result = await DocumentPicker.getDocumentAsync({
		type: ZIP_TYPES,
		copyToCacheDirectory: true,
		multiple: false,
	});
	if (result.canceled) return null;
	return result.assets?.[0] || null;
}

export async function loadBackupPreviewFromAsset(asset) {
	if (!asset) {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}
	if (typeof File !== 'undefined' && asset instanceof File) {
		return readBackupPreviewFromZip(asset);
	}
	if (asset.file && typeof File !== 'undefined' && asset.file instanceof File) {
		return readBackupPreviewFromZip(asset.file);
	}
	if (asset.uri && Platform.OS !== 'web') {
		const FileSystem = await import('expo-file-system/legacy');
		const base64 = await FileSystem.readAsStringAsync(asset.uri, {
			encoding: FileSystem.EncodingType.Base64,
		});
		return readBackupPreviewFromZip(base64, { base64: true });
	}
	if (asset.uri && Platform.OS === 'web') {
		const response = await fetch(asset.uri);
		const buffer = await response.arrayBuffer();
		return readBackupPreviewFromZip(buffer);
	}
	throw new Error(INVALID_BUNDLE_MESSAGE);
}

export function buildRestoreFormData(asset) {
	const formData = new FormData();
	const name = asset?.name || asset?.fileName || 'backup.zip';
	if (typeof File !== 'undefined' && asset instanceof File) {
		formData.append('backup', asset, name);
		return formData;
	}
	if (typeof File !== 'undefined' && asset?.file instanceof File) {
		formData.append('backup', asset.file, name);
		return formData;
	}
	formData.append('backup', toFormDataFile({
		...asset,
		name,
		type: asset?.mimeType || asset?.type || 'application/zip',
	}));
	return formData;
}

export { multipartRequestConfig };

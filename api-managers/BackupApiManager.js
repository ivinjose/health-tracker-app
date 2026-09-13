import useAxiosPrivate from '../hooks/useAxiosPrivate';
import {
	filenameFromContentDisposition,
} from '../lib/backup';
import {
	buildRestoreFormData,
	multipartRequestConfig,
} from '../lib/backupDevice';

const getErrorMessage = (err, fallback) => {
	const data = err?.response?.data;
	if (data && typeof data === 'object' && typeof data.message === 'string') {
		return data.message;
	}
	if (typeof data === 'string' && data.trim()) {
		try {
			const parsed = JSON.parse(data);
			if (parsed && typeof parsed.message === 'string') return parsed.message;
		} catch {
			return fallback;
		}
	}
	if (data && typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
		try {
			const text = new TextDecoder().decode(data);
			const parsed = JSON.parse(text);
			if (parsed && typeof parsed.message === 'string') return parsed.message;
		} catch {
			return fallback;
		}
	}
	return fallback;
};

const BACKUP_TIMEOUT_MS = 120000;

const useBackupApiManager = () => {
	const axiosPrivate = useAxiosPrivate();
	const BACKUP_API = '/api/backup';

	const downloadBackup = async () => {
		try {
			const response = await axiosPrivate.get(BACKUP_API, {
				responseType: 'arraybuffer',
				timeout: BACKUP_TIMEOUT_MS,
			});
			const header = response.headers?.['content-disposition']
				|| response.headers?.['Content-Disposition']
				|| '';
			const filename = filenameFromContentDisposition(header) || 'health-tracker-backup.zip';
			return { data: response.data, filename };
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not create a backup.'));
		}
	};

	const restoreBackup = async (asset) => {
		if (!asset) {
			throw new Error('Please choose a backup file.');
		}
		try {
			const body = buildRestoreFormData(asset);
			const response = await axiosPrivate.post(`${BACKUP_API}/restore`, body, {
				...multipartRequestConfig(),
				timeout: BACKUP_TIMEOUT_MS,
			});
			return response.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not restore this backup.'));
		}
	};

	return { downloadBackup, restoreBackup };
};

export default useBackupApiManager;

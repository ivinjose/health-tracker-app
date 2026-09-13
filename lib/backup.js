import JSZip from 'jszip';
import { format } from 'date-fns';

export const BACKUP_SCHEMA_VERSION = 1;
export const INVALID_BUNDLE_MESSAGE = 'This backup file is not valid.';
export const BACKUP_FOLDER_PATTERN = /^health-tracker-backup-\d{8}T\d{6}Z$/;

export function filenameFromContentDisposition(header) {
	const value = String(header || '');
	const star = /filename\*=(?:UTF-8''|)([^;]+)/i.exec(value);
	if (star) {
		try {
			return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''));
		} catch {
			return star[1].trim().replace(/^["']|["']$/g, '');
		}
	}
	const quoted = /filename="([^"]+)"/i.exec(value);
	if (quoted) return quoted[1];
	const plain = /filename=([^;]+)/i.exec(value);
	if (plain) return plain[1].trim().replace(/^["']|["']$/g, '');
	return '';
}

export function parseExportedAt(value) {
	const raw = String(value || '').trim();
	if (!raw) return '';
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return '';
	return date.toISOString();
}

export function formatBackupMilestone(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	const clock = format(date, 'd MMM yyyy, h:mm a');
	const tz = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
		.formatToParts(date)
		.find((part) => part.type === 'timeZoneName')?.value;
	return tz ? `${clock} ${tz}` : clock;
}

const plural = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;

export function formatBackupCounts(counts) {
	if (!counts || typeof counts !== 'object') return '';
	const bits = [];
	if (counts.profiles != null) bits.push(plural(Number(counts.profiles), 'profile'));
	if (counts.reports != null) bits.push(plural(Number(counts.reports), 'report'));
	if (counts.files != null) bits.push(plural(Number(counts.files), 'file'));
	return bits.join(', ');
}

export function findManifestPath(paths) {
	const matches = (paths || [])
		.map((name) => String(name || '').replace(/\\/g, '/'))
		.filter((name) => {
			const parts = name.split('/').filter(Boolean);
			return (
				parts.length === 2
				&& parts[1] === 'manifest.json'
				&& BACKUP_FOLDER_PATTERN.test(parts[0])
			);
		});
	return matches.length === 1 ? matches[0] : '';
}

export async function readBackupPreviewFromZip(data, options) {
	let zip;
	try {
		zip = await JSZip.loadAsync(data, options);
	} catch {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}

	const manifestPath = findManifestPath(Object.keys(zip.files));
	if (!manifestPath) {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}

	const entry = zip.file(manifestPath);
	if (!entry) {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}

	let manifest;
	try {
		manifest = JSON.parse(await entry.async('string'));
	} catch {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}

	if (!manifest || typeof manifest !== 'object' || manifest.schemaVersion !== BACKUP_SCHEMA_VERSION) {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}

	const exportedAt = parseExportedAt(manifest.exportedAt);
	if (!exportedAt) {
		throw new Error(INVALID_BUNDLE_MESSAGE);
	}

	const counts = manifest.counts && typeof manifest.counts === 'object' ? manifest.counts : {};
	return {
		exportedAt,
		counts,
		milestoneLabel: formatBackupMilestone(exportedAt),
		countsLabel: formatBackupCounts(counts),
	};
}

export function isPrimaryProfile(profile, activeId) {
	if (!profile) return false;
	return String(profile.user) === String(profile.parent)
		&& String(profile.user) === String(activeId);
}

export function hasPrimaryAccess(profiles, activeId) {
	return (profiles || []).some((profile) => isPrimaryProfile(profile, activeId));
}

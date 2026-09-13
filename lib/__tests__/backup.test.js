import JSZip from 'jszip';
import {
	BACKUP_SCHEMA_VERSION,
	INVALID_BUNDLE_MESSAGE,
	filenameFromContentDisposition,
	findManifestPath,
	formatBackupCounts,
	hasPrimaryAccess,
	parseExportedAt,
	readBackupPreviewFromZip,
} from '../backup';

describe('filenameFromContentDisposition', () => {
	it('reads a quoted filename', () => {
		expect(
			filenameFromContentDisposition(
				'attachment; filename="health-tracker-backup-20260913T143022Z.zip"'
			)
		).toBe('health-tracker-backup-20260913T143022Z.zip');
	});

	it('returns empty when missing', () => {
		expect(filenameFromContentDisposition('')).toBe('');
	});
});

describe('parseExportedAt', () => {
	it('normalizes ISO strings', () => {
		expect(parseExportedAt('2026-09-13T14:30:22.123Z')).toBe('2026-09-13T14:30:22.123Z');
	});

	it('rejects garbage', () => {
		expect(parseExportedAt('nope')).toBe('');
		expect(parseExportedAt('')).toBe('');
	});
});

describe('formatBackupCounts', () => {
	it('joins profile, report, and file counts', () => {
		expect(formatBackupCounts({ profiles: 1, reports: 2, files: 0 })).toBe(
			'1 profile, 2 reports, 0 files'
		);
	});
});

describe('findManifestPath', () => {
	it('requires a stamped backup folder', () => {
		expect(
			findManifestPath([
				'health-tracker-backup-20260913T143022Z/manifest.json',
				'health-tracker-backup-20260913T143022Z/profiles.json',
			])
		).toBe('health-tracker-backup-20260913T143022Z/manifest.json');
		expect(findManifestPath(['manifest.json'])).toBe('');
	});
});

describe('hasPrimaryAccess', () => {
	it('is true only when the active profile is the account holder', () => {
		const profiles = [
			{ user: 'acct', parent: 'acct', name: 'Me' },
			{ user: 'kid', parent: 'acct', name: 'Kid' },
		];
		expect(hasPrimaryAccess(profiles, 'acct')).toBe(true);
		expect(hasPrimaryAccess(profiles, 'kid')).toBe(false);
	});
});

describe('readBackupPreviewFromZip', () => {
	const folder = 'health-tracker-backup-20260913T143022Z';

	const zipWithManifest = async (manifest) => {
		const zip = new JSZip();
		zip.file(`${folder}/manifest.json`, JSON.stringify(manifest));
		return zip.generateAsync({ type: 'nodebuffer' });
	};

	it('reads exportedAt and counts and does not expose the owner', async () => {
		const buffer = await zipWithManifest({
			schemaVersion: BACKUP_SCHEMA_VERSION,
			exportedAt: '2026-09-13T14:30:22.123Z',
			source: { username: 'userx@mail.com' },
			counts: { profiles: 3, reports: 42, files: 12 },
		});
		const preview = await readBackupPreviewFromZip(buffer);
		expect(preview.exportedAt).toBe('2026-09-13T14:30:22.123Z');
		expect(preview.countsLabel).toBe('3 profiles, 42 reports, 12 files');
		expect(preview.milestoneLabel).toContain('2026');
		expect(preview).not.toHaveProperty('username');
		expect(JSON.stringify(preview).includes('userx')).toBe(false);
	});

	it('rejects a missing exportedAt without posting', async () => {
		const buffer = await zipWithManifest({
			schemaVersion: BACKUP_SCHEMA_VERSION,
			source: { username: 'userx@mail.com' },
		});
		await expect(readBackupPreviewFromZip(buffer)).rejects.toThrow(INVALID_BUNDLE_MESSAGE);
	});
});

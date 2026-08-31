/**
 * Client feature flags.
 *
 * Override at build time with `EXPO_PUBLIC_*` env vars (`true`/`false`).
 * When the env var is unset, the default in this file is used.
 */
export function parseFeatureFlag(raw, fallback) {
	if (raw == null || String(raw).trim() === '') return fallback;
	const normalized = String(raw).trim().toLowerCase();
	if (normalized === 'true' || normalized === '1') return true;
	if (normalized === 'false' || normalized === '0') return false;
	return fallback;
}

const env = typeof process !== 'undefined' ? process.env : undefined;

export const FEATURE_REPORT_UPLOAD = parseFeatureFlag(
	env?.EXPO_PUBLIC_REPORT_UPLOAD,
	true
);

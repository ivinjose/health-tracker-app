import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { APPEARANCE_STORAGE_KEY, APP_APPEARANCE, resolveAppearanceName } from '@/lib/appearance';

/**
 * Reads the saved appearance name from localStorage (web) or SecureStore (native).
 *
 * Missing or unreadable values fall back to {@link APP_APPEARANCE}.
 *
 * @returns {Promise<string>} A known palette name (`light` or `dark`).
 */
export async function loadAppearanceName() {
	try {
		const value =
			Platform.OS === 'web'
				? localStorage.getItem(APPEARANCE_STORAGE_KEY)
				: await SecureStore.getItemAsync(APPEARANCE_STORAGE_KEY);
		return resolveAppearanceName(value ?? undefined);
	} catch {
		return APP_APPEARANCE;
	}
}

/**
 * Persists an appearance name so the next launch can restore it.
 *
 * Unknown names are resolved through {@link resolveAppearanceName} before writing.
 *
 * @param {string} name - Requested appearance name.
 * @returns {Promise<void>}
 */
export async function saveAppearanceName(name) {
	const resolved = resolveAppearanceName(name);
	try {
		if (Platform.OS === 'web') {
			localStorage.setItem(APPEARANCE_STORAGE_KEY, resolved);
		} else {
			await SecureStore.setItemAsync(APPEARANCE_STORAGE_KEY, resolved);
		}
	} catch {
		// Ignore storage errors
	}
}

import { APPEARANCE_STORAGE_KEY, APP_APPEARANCE } from '../appearance';
import { loadAppearanceName, saveAppearanceName } from '../appearanceStorage';

jest.mock('nativewind', () => ({
	vars: (channels) => channels,
}));

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
	getItemAsync: (...args) => mockGetItemAsync(...args),
	setItemAsync: (...args) => mockSetItemAsync(...args),
}));

const { Platform } = require('react-native');

describe('appearanceStorage', () => {
	const originalOs = Platform.OS;

	afterEach(() => {
		Platform.OS = originalOs;
		mockGetItemAsync.mockReset();
		mockSetItemAsync.mockReset();
		if (global.localStorage?.clear) {
			global.localStorage.clear();
		}
	});

	describe('native', () => {
		beforeEach(() => {
			Platform.OS = 'ios';
		});

		it('loads a stored palette name', async () => {
			mockGetItemAsync.mockResolvedValue('light');

			await expect(loadAppearanceName()).resolves.toBe('light');
			expect(mockGetItemAsync).toHaveBeenCalledWith(APPEARANCE_STORAGE_KEY);
		});

		it('falls back to APP_APPEARANCE when nothing is stored', async () => {
			mockGetItemAsync.mockResolvedValue(null);

			await expect(loadAppearanceName()).resolves.toBe(APP_APPEARANCE);
		});

		it('falls back to APP_APPEARANCE for unknown stored names', async () => {
			mockGetItemAsync.mockResolvedValue('midnight');

			await expect(loadAppearanceName()).resolves.toBe(APP_APPEARANCE);
		});

		it('falls back to APP_APPEARANCE when SecureStore throws', async () => {
			mockGetItemAsync.mockRejectedValue(new Error('unavailable'));

			await expect(loadAppearanceName()).resolves.toBe(APP_APPEARANCE);
		});

		it('saves a resolved palette name', async () => {
			mockSetItemAsync.mockResolvedValue(undefined);

			await saveAppearanceName('light');

			expect(mockSetItemAsync).toHaveBeenCalledWith(APPEARANCE_STORAGE_KEY, 'light');
		});

		it('saves APP_APPEARANCE when the requested name is unknown', async () => {
			mockSetItemAsync.mockResolvedValue(undefined);

			await saveAppearanceName('midnight');

			expect(mockSetItemAsync).toHaveBeenCalledWith(APPEARANCE_STORAGE_KEY, APP_APPEARANCE);
		});

		it('swallows SecureStore write errors', async () => {
			mockSetItemAsync.mockRejectedValue(new Error('unavailable'));

			await expect(saveAppearanceName('dark')).resolves.toBeUndefined();
		});
	});

	describe('web', () => {
		let store;

		beforeEach(() => {
			Platform.OS = 'web';
			store = {};
			global.localStorage = {
				getItem: (key) => (Object.hasOwn(store, key) ? store[key] : null),
				setItem: (key, value) => {
					store[key] = String(value);
				},
				clear: () => {
					store = {};
				},
			};
		});

		afterEach(() => {
			delete global.localStorage;
		});

		it('loads a stored palette name from localStorage', async () => {
			localStorage.setItem(APPEARANCE_STORAGE_KEY, 'light');

			await expect(loadAppearanceName()).resolves.toBe('light');
			expect(mockGetItemAsync).not.toHaveBeenCalled();
		});

		it('falls back to APP_APPEARANCE when localStorage is empty', async () => {
			await expect(loadAppearanceName()).resolves.toBe(APP_APPEARANCE);
			expect(mockGetItemAsync).not.toHaveBeenCalled();
		});

		it('saves a resolved palette name to localStorage', async () => {
			await saveAppearanceName('light');

			expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('light');
			expect(mockSetItemAsync).not.toHaveBeenCalled();
		});
	});
});

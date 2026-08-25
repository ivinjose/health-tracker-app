import {
	DEFAULT_HOME_WIDGET_SLUGS,
	HOME_WIDGETS_KEY,
	normalizeHomeWidgetSlugs,
} from '@/lib/homeWidgets';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

async function readStoredSlugs() {
	try {
		const raw =
			Platform.OS === 'web'
				? localStorage.getItem(HOME_WIDGETS_KEY)
				: await SecureStore.getItemAsync(HOME_WIDGETS_KEY);
		if (raw == null) return DEFAULT_HOME_WIDGET_SLUGS;
		return normalizeHomeWidgetSlugs(JSON.parse(raw)) ?? DEFAULT_HOME_WIDGET_SLUGS;
	} catch {
		return DEFAULT_HOME_WIDGET_SLUGS;
	}
}

async function writeStoredSlugs(slugs) {
	try {
		const raw = JSON.stringify(slugs);
		if (Platform.OS === 'web') {
			localStorage.setItem(HOME_WIDGETS_KEY, raw);
		} else {
			await SecureStore.setItemAsync(HOME_WIDGETS_KEY, raw);
		}
	} catch {
		// Ignore storage errors
	}
}

export default function useHomeWidgets() {
	const [slugs, setSlugs] = useState(DEFAULT_HOME_WIDGET_SLUGS);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let cancelled = false;
		readStoredSlugs().then((value) => {
			if (cancelled) return;
			setSlugs(value);
			setIsReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!isReady) return;
		writeStoredSlugs(slugs);
	}, [isReady, slugs]);

	const addWidget = useCallback((slug) => {
		setSlugs((current) => {
			const next = normalizeHomeWidgetSlugs([...current, slug]);
			return next ?? current;
		});
	}, []);

	const removeWidget = useCallback((slug) => {
		setSlugs((current) => current.filter((item) => item !== slug));
	}, []);

	return { slugs, addWidget, removeWidget, isReady };
}

import useReportsApiManager from '@/api-managers/ReportsApiManager';
import FormSheetModal from '@/components/FormSheetModal';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
	buildPdfViewerHtml,
	createReportPreview,
	revokeReportPreview,
} from '@/lib/reportPreview';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { createElement, useEffect, useMemo } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ViewReportDialog({ open, onOpenChange, filename, title }) {
	const theme = useTheme();
	const reportsApiManager = useReportsApiManager();

	const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
		queryKey: ['report-file', filename],
		queryFn: () => reportsApiManager.downloadReport(filename),
		enabled: open && Boolean(filename),
		staleTime: 5 * 60 * 1000,
	});

	const preview = useMemo(() => {
		if (!data) return null;
		try {
			return createReportPreview(data, filename);
		} catch {
			return { kind: 'unknown' };
		}
	}, [data, filename]);

	useEffect(() => {
		return () => {
			revokeReportPreview(preview);
		};
	}, [preview]);

	const busy = open && !data && (isLoading || isFetching);

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title={title || 'Report'}
			scrollable={false}
			padded={false}
		>
			{busy ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={theme.colors.tint} />
				</View>
			) : isError ? (
				<PreviewMessage
					message={error?.message || 'Could not load this report.'}
					destructive
					onRetry={() => refetch()}
				/>
			) : preview?.kind === 'image' && preview.dataUri ? (
				<Image
					source={{ uri: preview.dataUri }}
					contentFit="contain"
					style={{ flex: 1, width: '100%' }}
					accessibilityLabel="Report image"
				/>
			) : preview?.kind === 'pdf' ? (
				<PdfPreview preview={preview} />
			) : (
				<PreviewMessage message="This file type can't be previewed." />
			)}
		</FormSheetModal>
	);
}

function PdfPreview({ preview }) {
	if (Platform.OS === 'web') {
		const src = preview.blobUrl || preview.dataUri;
		if (!src) {
			return <PreviewMessage message="This file type can't be previewed." />;
		}
		return createElement('iframe', {
			src,
			title: 'Report PDF',
			style: { border: 'none', width: '100%', height: '100%', flex: 1 },
		});
	}

	return (
		<WebView
			originWhitelist={['*']}
			javaScriptEnabled
			domStorageEnabled
			setSupportMultipleWindows={false}
			mixedContentMode="always"
			source={{ html: buildPdfViewerHtml(preview.base64) }}
			style={{ flex: 1, backgroundColor: 'transparent' }}
		/>
	);
}

function PreviewMessage({ message, destructive = false, onRetry }) {
	return (
		<View className="flex-1 items-center justify-center gap-3 px-6">
			<Text className={destructive ? 'text-center text-destructive' : 'text-center text-muted-foreground'}>
				{message}
			</Text>
			{onRetry ? (
				<Button variant="outline" onPress={onRetry}>
					<Text>Try again</Text>
				</Button>
			) : null}
		</View>
	);
}

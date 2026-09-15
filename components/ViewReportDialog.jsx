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
import {
	getReportFileName,
	getReportMimeType,
	isExistingReportFile,
	isLocalReportFile,
	readReportFileBytes,
} from '@/lib/reportUpload';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { createElement, useEffect, useMemo } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ViewReportDialog({
	open,
	onOpenChange,
	filename,
	file,
	title,
	onRemove,
	removeDisabled = false,
}) {
	const theme = useTheme();
	const reportsApiManager = useReportsApiManager();
	const localFile = isLocalReportFile(file) ? file : undefined;
	const serverName = filename || (isExistingReportFile(file) ? file.name : undefined);
	const previewName = getReportFileName(localFile) || serverName;
	const mimeHint = localFile ? getReportMimeType(localFile) : undefined;

	const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
		queryKey: localFile
			? ['report-file-local', localFile.uri, getReportFileName(localFile)]
			: ['report-file', serverName],
		queryFn: () =>
			localFile
				? readReportFileBytes(localFile)
				: reportsApiManager.downloadReport(serverName),
		enabled: open && (Boolean(localFile) || Boolean(serverName)),
		staleTime: 5 * 60 * 1000,
	});

	const preview = useMemo(() => {
		if (!data) return null;
		try {
			return createReportPreview(data, previewName, mimeHint);
		} catch {
			return { kind: 'unknown' };
		}
	}, [data, previewName, mimeHint]);

	useEffect(() => {
		return () => {
			revokeReportPreview(preview);
		};
	}, [preview]);

	const busy = open && !data && (isLoading || isFetching);

	const handleRemove = onRemove
		? () => {
				onRemove();
				onOpenChange(false);
			}
		: undefined;

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title={title || (localFile && previewName) || 'Report'}
			scrollable={false}
			padded={false}
			onDelete={handleRemove}
			deleteDisabled={removeDisabled}
			deleteAccessibilityLabel="Remove attached report"
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

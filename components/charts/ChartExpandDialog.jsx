import LineChart from '@/components/charts/LineChart';
import { getLandscapeLayout } from '@/components/charts/chartUtils';
import FormSheetModal from '@/components/FormSheetModal';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SHEET_HEADER_ALLOWANCE = 96;
const OVERLAY_LEGEND_HEIGHT = 48;

function OverlayLegend({ labels, width, height }) {
	const theme = useTheme();
	const colors = [theme.chart.line, theme.chart.lineSecondary];

	return (
		<View
			className="flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 px-3"
			style={{ width, height }}
		>
			{labels.map((label, index) => (
				<View key={`${label}-${index}`} className="flex-row items-center gap-2">
					<View
						style={{
							width: 10,
							height: 10,
							borderRadius: 5,
							backgroundColor: colors[index % colors.length],
						}}
					/>
					<Text className="text-sm text-foreground" numberOfLines={1}>
						{label}
					</Text>
				</View>
			))}
		</View>
	);
}

export default function ChartExpandDialog({
	open,
	onOpenChange,
	title,
	data = [],
	isLoading = false,
	yAxisKey,
	yAxisKeys,
	unit,
	units,
	seriesLabels,
}) {
	const theme = useTheme();
	const window = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [bodySize, setBodySize] = useState({ width: 0, height: 0 });
	const showLegend = seriesLabels?.length > 1;
	const availableWidth = Math.max(
		Math.round(window.width - insets.left - insets.right),
		200
	);
	const availableHeight = Math.max(
		Math.round(
			window.height
				- insets.top
				- insets.bottom
				- SHEET_HEADER_ALLOWANCE
		),
		200
	);
	const bodyWidth = bodySize.width > 0
		? Math.min(bodySize.width, availableWidth)
		: availableWidth;
	const bodyHeight = bodySize.height > 0
		? Math.min(bodySize.height, availableHeight)
		: availableHeight;
	const layout = getLandscapeLayout(bodyWidth, bodyHeight);
	const legendHeight = showLegend ? OVERLAY_LEGEND_HEIGHT : 0;
	const plotHeight = Math.max(layout.chartHeight - legendHeight, 0);

	useEffect(() => {
		if (!open) {
			setBodySize({ width: 0, height: 0 });
		}
	}, [open]);

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			scrollable={false}
			padded={false}
		>
			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={theme.colors.tint} />
				</View>
			) : !data.length ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-sm text-muted-foreground">No chart data</Text>
				</View>
			) : (
				<View
					className="overflow-hidden"
					style={{
						flex: 1,
						height: availableHeight,
						maxHeight: availableHeight,
						paddingBottom: insets.bottom,
					}}
				>
					<View
						className="overflow-hidden"
						style={{ flex: 1 }}
						onLayout={(event) => {
							const { width, height } = event.nativeEvent.layout;
							const nextWidth = Math.round(width);
							const nextHeight = Math.round(height);
							setBodySize((current) =>
								current.width === nextWidth && current.height === nextHeight
									? current
									: { width: nextWidth, height: nextHeight }
							);
						}}
					>
						{layout.chartWidth > 0 && layout.chartHeight > 0 ? (
							<View
								style={{
									width: bodyWidth,
									height: bodyHeight,
									overflow: 'hidden',
								}}
							>
								<View style={[layout.style, { flexDirection: 'column' }]}>
									{showLegend ? (
										<OverlayLegend
											labels={seriesLabels}
											width={layout.chartWidth}
											height={legendHeight}
										/>
									) : null}
									<LineChart
										data={data}
										yAxisKey={yAxisKey}
										yAxisKeys={yAxisKeys}
										unit={unit}
										units={units}
										seriesLabels={seriesLabels}
										width={layout.chartWidth}
										height={plotHeight}
										showNodeValues
									/>
								</View>
							</View>
						) : null}
					</View>
				</View>
			)}
		</FormSheetModal>
	);
}

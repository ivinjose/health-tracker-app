import ChartExpandButton from '@/components/charts/ChartExpandButton';
import ChartExpandDialog from '@/components/charts/ChartExpandDialog';
import ChartLegend from '@/components/charts/ChartLegend';
import LineChart from '@/components/charts/LineChart';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { View } from 'react-native';

export default function ExpandableChart({
	data = [],
	title,
	headerRight,
	yAxisKey,
	yAxisKeys,
	unit,
	units,
	seriesLabels = [],
	showNodeValues = true,
	expandTitle,
	expandData,
	expandLoading = false,
	showLegend,
	showExpandButton = true,
	onExpandOpenChange,
	emptyMessage,
}) {
	const [expandOpen, setExpandOpen] = useState(false);
	const legendVisible = showLegend ?? seriesLabels.length > 1;
	const canExpand = showExpandButton && data.length > 0;
	const dialogTitle = expandTitle ?? title;
	const dialogData = expandData ?? data;
	const showHeader = Boolean(title || headerRight || showExpandButton);

	const setOpen = (next) => {
		setExpandOpen(next);
		onExpandOpenChange?.(next);
	};

	return (
		<View>
			{showHeader ? (
				<View className="mb-3 flex-row items-center gap-2">
					{title ? (
						<Text className="min-w-0 flex-1 text-base font-semibold text-foreground">
							{title}
						</Text>
					) : (
						<View className="min-w-0 flex-1" />
					)}
					{headerRight}
					{canExpand ? (
						<ChartExpandButton onPress={() => setOpen(true)} />
					) : showExpandButton ? (
						<View className="h-8 w-8" />
					) : null}
				</View>
			) : null}

			{legendVisible ? (
				<View className="mb-3">
					<ChartLegend labels={seriesLabels} />
				</View>
			) : null}

			<LineChart
				data={data}
				yAxisKey={yAxisKey}
				yAxisKeys={yAxisKeys}
				unit={unit}
				units={units}
				seriesLabels={seriesLabels}
				showNodeValues={showNodeValues}
				emptyMessage={emptyMessage}
			/>

			{canExpand ? (
				<ChartExpandDialog
					open={expandOpen}
					onOpenChange={setOpen}
					title={dialogTitle}
					data={dialogData}
					isLoading={expandLoading}
					yAxisKey={yAxisKey}
					yAxisKeys={yAxisKeys}
					unit={unit}
					units={units}
					seriesLabels={seriesLabels}
				/>
			) : null}
		</View>
	);
}

import ChartExpandButton from '@/components/charts/ChartExpandButton';
import ChartExpandDialog from '@/components/charts/ChartExpandDialog';
import LineChart from '@/components/charts/LineChart';
import { useTheme } from '@/components/ThemeProvider';
import { getInvestigationLabel, getInvestigationUnit } from '@/lib/reportUtils';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function CompareGraph({
	data,
	investigations = [],
	investigationOptions = [],
}) {
	const theme = useTheme();
	const [expandOpen, setExpandOpen] = useState(false);

	if (!investigations[0] || !investigations[1]) {
		return null;
	}

	const labels = investigations.map((investigation) =>
		getInvestigationLabel(investigationOptions, investigation)
	);
	const units = investigations.map((investigation) =>
		getInvestigationUnit(investigationOptions, investigation)
	);
	const colors = [theme.chart.line, theme.chart.lineSecondary];
	const title = `Compare ${labels[0]} and ${labels[1]}`;
	const legend = (
		<View className="flex-row flex-wrap gap-x-4 gap-y-2">
			{labels.map((label, index) => (
				<View key={investigations[index]} className="flex-row items-center gap-2">
					<View
						style={{
							width: 10,
							height: 10,
							borderRadius: 5,
							backgroundColor: colors[index],
						}}
					/>
					<Text className="text-sm text-foreground">{label}</Text>
				</View>
			))}
		</View>
	);

	return (
		<View className="overflow-hidden rounded-lg border border-border bg-card p-4">
			<View className="mb-3 flex-row items-center gap-2">
				<Text className="min-w-0 flex-1 text-base font-semibold text-foreground">
					{title}
				</Text>
				{data.length > 0 ? (
					<ChartExpandButton onPress={() => setExpandOpen(true)} />
				) : null}
			</View>
			<View className="mb-3">{legend}</View>
			<LineChart
				data={data}
				yAxisKeys={investigations}
				seriesLabels={labels}
				units={units}
				showNodeValues
			/>
			<ChartExpandDialog
				open={expandOpen}
				onOpenChange={setExpandOpen}
				title={title}
				data={data}
				yAxisKeys={investigations}
				seriesLabels={labels}
				units={units}
			/>
		</View>
	);
}

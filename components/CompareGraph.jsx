import LineChart from '@/components/charts/LineChart';
import { useTheme } from '@/components/ThemeProvider';
import { getInvestigationLabel, getInvestigationUnit } from '@/lib/reportUtils';
import { Text, View } from 'react-native';

export default function CompareGraph({
	data,
	investigations = [],
	investigationOptions = [],
}) {
	const theme = useTheme();

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

	return (
		<View className="overflow-hidden rounded-lg border border-border bg-card p-4">
			<Text className="mb-3 text-base font-semibold text-foreground">
				Compare {labels[0]} and {labels[1]}
			</Text>
			<View className="mb-3 flex-row flex-wrap gap-x-4 gap-y-2">
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
			<LineChart
				data={data}
				yAxisKeys={investigations}
				seriesLabels={labels}
				units={units}
				showNodeValues
			/>
		</View>
	);
}

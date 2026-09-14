import ExpandableChart from '@/components/charts/ExpandableChart';
import { getInvestigationLabel, getInvestigationUnit } from '@/lib/reportUtils';
import { View } from 'react-native';

export default function CompareGraph({
	data,
	investigations = [],
	investigationOptions = [],
}) {
	if (!investigations[0] || !investigations[1]) {
		return null;
	}

	const labels = investigations.map((investigation) =>
		getInvestigationLabel(investigationOptions, investigation)
	);
	const units = investigations.map((investigation) =>
		getInvestigationUnit(investigationOptions, investigation)
	);
	const title = `Compare ${labels[0]} and ${labels[1]}`;

	return (
		<View className="overflow-hidden rounded-lg border border-border bg-card p-4">
			<ExpandableChart
				data={data}
				title={title}
				yAxisKeys={investigations}
				seriesLabels={labels}
				units={units}
			/>
		</View>
	);
}

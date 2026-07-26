import CompareChart from '@/components/charts/CompareChart';
import { Text, View } from 'react-native';

export default function CompareGraph({ data, investigations = [] }) {
	if (!investigations[0] || !investigations[1]) {
		return null;
	}

	return (
		<View className="overflow-hidden rounded-lg border border-border bg-card p-4">
			<Text className="mb-4 text-base font-semibold text-foreground">
				Compare {investigations[0]} and {investigations[1]}
			</Text>
			<CompareChart
				data={data}
				xAxisKey="displayDate"
				yAxisKeys={investigations}
			/>
		</View>
	);
}

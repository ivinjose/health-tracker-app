import { getSeriesColors } from '@/components/charts/chartUtils';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function ChartLegend({
	labels = [],
	className,
	style,
	numberOfLines,
}) {
	const theme = useTheme();
	const colors = getSeriesColors(theme);

	return (
		<View
			className={className ?? 'flex-row flex-wrap gap-x-4 gap-y-2'}
			style={style}
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
					<Text className="text-sm text-foreground" numberOfLines={numberOfLines}>
						{label}
					</Text>
				</View>
			))}
		</View>
	);
}

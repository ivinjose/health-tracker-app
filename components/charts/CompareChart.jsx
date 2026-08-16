import { useTheme } from '@/components/ThemeProvider';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';

import {
	CHART_HEIGHT,
	CHART_PADDING,
	buildMultiLinePoints,
	getChartWidth,
} from './chartUtils';

export default function CompareChart({ data = [], xAxisKey, yAxisKeys = [], width }) {
	const theme = useTheme();
	const chartWidth = width ?? getChartWidth();
	const lineColors = [theme.chart.line, theme.chart.lineSecondary];

	if (!data.length || yAxisKeys.length === 0) {
		return null;
	}

	const { series, innerHeight } = buildMultiLinePoints({
		data,
		xKey: xAxisKey,
		yKeys: yAxisKeys,
		chartWidth,
	});

	const labelPoints = series[0]?.points ?? [];
	const labelStep = Math.max(1, Math.ceil(labelPoints.length / 4));

	return (
		<View style={{ height: CHART_HEIGHT, width: chartWidth }}>
			<Svg width={chartWidth} height={CHART_HEIGHT}>
				<Line
					x1={CHART_PADDING.left}
					y1={CHART_PADDING.top + innerHeight}
					x2={chartWidth - CHART_PADDING.right}
					y2={CHART_PADDING.top + innerHeight}
					stroke={theme.chart.axis}
					strokeWidth={1}
				/>
				{series.map((line, lineIndex) => {
					const validPoints = line.points.filter(
						(point) => point.y != null && !Number.isNaN(point.value)
					);
					const polylinePoints = validPoints
						.map((point) => `${point.x},${point.y}`)
						.join(' ');
					const stroke = lineColors[lineIndex % lineColors.length];

					return (
						<G key={line.key}>
							{polylinePoints ? (
								<Polyline
									points={polylinePoints}
									fill="none"
									stroke={stroke}
									strokeWidth={2}
								/>
							) : null}
							{validPoints.map((point, index) => (
								<Circle
									key={`${line.key}-${index}`}
									cx={point.x}
									cy={point.y}
									r={4}
									fill={stroke}
								/>
							))}
						</G>
					);
				})}
				{labelPoints.map((point, index) =>
					index % labelStep === 0 || index === labelPoints.length - 1 ? (
						<SvgText
							key={`x-label-${index}`}
							x={point.x}
							y={CHART_HEIGHT - 10}
							fontSize={10}
							fill={theme.chart.label}
							textAnchor="middle"
						>
							{String(point.item[xAxisKey] ?? '').slice(0, 8)}
						</SvgText>
					) : null
				)}
			</Svg>
		</View>
	);
}

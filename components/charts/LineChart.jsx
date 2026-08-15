import { useTheme } from '@/components/ThemeProvider';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import {
	CHART_HEIGHT,
	CHART_PADDING,
	buildLinePoints,
	getChartWidth,
} from './chartUtils';

export default function LineChart({ data = [], xAxisKey, yAxisKey, width }) {
	const theme = useTheme();
	const lineColor = theme.chart.line;
	const axisColor = theme.chart.axis;
	const labelColor = theme.chart.label;
	const chartWidth = width ?? getChartWidth();

	if (!data.length) {
		return (
			<View
				style={{ height: CHART_HEIGHT, width: chartWidth }}
				className="items-center justify-center"
			>
				<Text className="text-sm text-muted-foreground">No chart data</Text>
			</View>
		);
	}

	const { points, innerHeight } = buildLinePoints({
		data,
		xKey: xAxisKey,
		yKey: yAxisKey,
		chartWidth,
	});
	const validPoints = points.filter((point) => !Number.isNaN(point.value));
	const polylinePoints = validPoints.map((point) => `${point.x},${point.y}`).join(' ');
	const labelStep = Math.max(1, Math.ceil(validPoints.length / 4));

	return (
		<View style={{ height: CHART_HEIGHT, width: chartWidth }}>
			<Svg width={chartWidth} height={CHART_HEIGHT}>
				<Line
					x1={CHART_PADDING.left}
					y1={CHART_PADDING.top + innerHeight}
					x2={chartWidth - CHART_PADDING.right}
					y2={CHART_PADDING.top + innerHeight}
					stroke={axisColor}
					strokeWidth={1}
				/>
				{polylinePoints ? (
					<Polyline
						points={polylinePoints}
						fill="none"
						stroke={lineColor}
						strokeWidth={2}
					/>
				) : null}
				{validPoints.map((point, index) => (
					<Circle key={`point-${index}`} cx={point.x} cy={point.y} r={4} fill={lineColor} />
				))}
				{validPoints.map((point, index) =>
					index % labelStep === 0 || index === validPoints.length - 1 ? (
						<SvgText
							key={`label-${index}`}
							x={point.x}
							y={CHART_HEIGHT - 10}
							fontSize={10}
							fill={labelColor}
							textAnchor="middle"
						>
							{String(point.item[xAxisKey] ?? '').slice(0, 8)}
						</SvgText>
					) : null
				)}
				{validPoints.map((point, index) => (
					<SvgText
						key={`value-${index}`}
						x={point.x}
						y={point.y - 8}
						fontSize={10}
						fill={labelColor}
						textAnchor="middle"
					>
						{String(point.value)}
					</SvgText>
				))}
			</Svg>
		</View>
	);
}

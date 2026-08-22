import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import {
	CHART_HEIGHT,
	CHART_PADDING,
	buildLinePoints,
	getChartAxisDate,
	getChartTooltipDate,
	getXLabelAnchor,
	formatAxisValue,
	getYAxisTicks,
} from './chartUtils';

const TOOLTIP_WIDTH = 120;
const HIT_RADIUS = 16;

function getTooltipLeft(pointX, chartWidth) {
	const margin = 4;
	const left = pointX - TOOLTIP_WIDTH / 2;
	return Math.max(margin, Math.min(left, chartWidth - TOOLTIP_WIDTH - margin));
}

export default function LineChart({
	data = [],
	yAxisKey = 'value',
	width,
	unit = '',
}) {
	const theme = useTheme();
	const lineColor = theme.chart.line;
	const axisColor = theme.chart.axis;
	const labelColor = theme.chart.label;
	const [measuredWidth, setMeasuredWidth] = useState(0);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [tooltipHeight, setTooltipHeight] = useState(56);
	const chartWidth = width ?? measuredWidth;

	useEffect(() => {
		setSelectedIndex(null);
	}, [data]);

	const handleLayout = (event) => {
		if (width) return;
		const nextWidth = Math.round(event.nativeEvent.layout.width);
		if (nextWidth > 0 && nextWidth !== measuredWidth) {
			setMeasuredWidth(nextWidth);
		}
	};

	if (!data.length) {
		return (
			<View
				style={{ height: CHART_HEIGHT, width: width ?? '100%' }}
				className="items-center justify-center"
			>
				<Text className="text-sm text-muted-foreground">No chart data</Text>
			</View>
		);
	}

	const padding = { ...CHART_PADDING, left: 36 };
	const { points, innerHeight, minY, maxY, meanY } = chartWidth
		? buildLinePoints({
			data,
			yKey: yAxisKey,
			chartWidth,
			padding,
		})
		: { points: [], innerHeight: 0, minY: 0, maxY: 1, meanY: 0 };
	const validPoints = points.filter((point) => !Number.isNaN(point.value));
	const polylinePoints = validPoints.map((point) => `${point.x},${point.y}`).join(' ');
	const yTicks = getYAxisTicks(minY, maxY, meanY, padding.top, innerHeight);
	const selectedPoint = selectedIndex != null ? validPoints[selectedIndex] : null;
	const selectedItem = selectedPoint?.item;
	const selectedDate = selectedItem ? getChartTooltipDate(selectedItem) : '';
	const tooltipLeft = selectedPoint ? getTooltipLeft(selectedPoint.x, chartWidth) : 0;
	const showTooltipAbove = selectedPoint ? selectedPoint.y > tooltipHeight + 18 : true;
	const tooltipTop = selectedPoint
		? showTooltipAbove
			? selectedPoint.y - tooltipHeight - 10
			: selectedPoint.y + 14
		: 0;

	return (
		<View
			style={{ height: CHART_HEIGHT, width: width ?? '100%' }}
			onLayout={handleLayout}
		>
			{chartWidth > 0 ? (
				<>
					<Svg width={chartWidth} height={CHART_HEIGHT}>
						<Rect
							x={0}
							y={0}
							width={chartWidth}
							height={CHART_HEIGHT}
							fill="transparent"
							onPress={() => setSelectedIndex(null)}
						/>
						<Line
							x1={padding.left}
							y1={padding.top}
							x2={padding.left}
							y2={padding.top + innerHeight}
							stroke={axisColor}
							strokeWidth={1}
						/>
						<Line
							x1={padding.left}
							y1={padding.top + innerHeight}
							x2={chartWidth - padding.right}
							y2={padding.top + innerHeight}
							stroke={axisColor}
							strokeWidth={1}
						/>
						{yTicks.map((tick, index) => (
							<G key={`y-tick-${index}`}>
								<Line
									x1={padding.left - 4}
									y1={tick.y}
									x2={padding.left}
									y2={tick.y}
									stroke={axisColor}
									strokeWidth={1}
								/>
								<SvgText
									x={padding.left - 8}
									y={tick.y + 3}
									fontSize={10}
									fill={labelColor}
									textAnchor="end"
								>
									{formatAxisValue(tick.value)}
								</SvgText>
							</G>
						))}
						{polylinePoints ? (
							<Polyline
								points={polylinePoints}
								fill="none"
								stroke={lineColor}
								strokeWidth={2}
							/>
						) : null}
						{validPoints.map((point, index) => {
							const selected = index === selectedIndex;
							return (
								<G key={`point-${index}`}>
									<Circle
										cx={point.x}
										cy={point.y}
										r={HIT_RADIUS}
										fill="transparent"
										onPress={() =>
											setSelectedIndex((current) => (current === index ? null : index))
										}
									/>
									{selected ? (
										<Circle
											cx={point.x}
											cy={point.y}
											r={8}
											fill={lineColor}
											opacity={0.18}
										/>
									) : null}
									<Circle
										cx={point.x}
										cy={point.y}
										r={selected ? 5 : 4}
										fill={lineColor}
									/>
									<SvgText
										x={point.x}
										y={point.y - 10}
										fontSize={10}
										fontWeight="600"
										fill={lineColor}
										textAnchor={getXLabelAnchor(index, validPoints.length)}
									>
										{String(point.value)}
									</SvgText>
								</G>
							);
						})}
						{validPoints.map((point, index) => (
							<SvgText
								key={`label-${index}`}
								x={point.x}
								y={CHART_HEIGHT - 10}
								fontSize={10}
								fill={labelColor}
								textAnchor={getXLabelAnchor(index, validPoints.length)}
							>
								{getChartAxisDate(point.item)}
							</SvgText>
						))}
					</Svg>
					{selectedItem ? (
						<View
							onLayout={(event) => {
								const nextHeight = Math.round(event.nativeEvent.layout.height);
								if (nextHeight > 0 && nextHeight !== tooltipHeight) {
									setTooltipHeight(nextHeight);
								}
							}}
							pointerEvents="none"
							style={{
								position: 'absolute',
								left: tooltipLeft,
								top: tooltipTop,
								width: TOOLTIP_WIDTH,
								borderRadius: 8,
								borderWidth: 1,
								borderColor: axisColor,
								backgroundColor: theme.colors.card,
								paddingHorizontal: 10,
								paddingVertical: 8,
								shadowColor: theme.colors.foreground,
								shadowOpacity: 0.12,
								shadowRadius: 6,
								shadowOffset: { width: 0, height: 2 },
								elevation: 3,
							}}
						>
							<Text className="text-xs font-semibold" style={{ color: lineColor }}>
								{selectedPoint.value}
								{unit ? ` ${unit}` : ''}
							</Text>
							{selectedDate ? (
								<Text className="text-[10px] text-muted-foreground">
									{selectedDate}
								</Text>
							) : null}
							{selectedItem.remarks ? (
								<Text className="text-[10px] text-foreground" numberOfLines={3}>
									{selectedItem.remarks}
								</Text>
							) : null}
						</View>
					) : null}
				</>
			) : null}
		</View>
	);
}

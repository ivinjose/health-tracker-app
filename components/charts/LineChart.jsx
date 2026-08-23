import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import {
	CHART_HEIGHT,
	CHART_PADDING,
	buildLinePoints,
	formatAxisValue,
	getChartAxisDate,
	getChartTooltipDate,
	getXLabelAnchor,
	getYAxisTicks,
} from './chartUtils';

const TOOLTIP_WIDTH = 120;
const MULTI_TOOLTIP_WIDTH = 160;
const HIT_SIZE = 44;

function getTooltipLeft(pointX, chartWidth, tooltipWidth) {
	const margin = 4;
	const left = pointX - tooltipWidth / 2;
	return Math.max(margin, Math.min(left, chartWidth - tooltipWidth - margin));
}

export default function LineChart({
	data = [],
	yAxisKey = 'value',
	yAxisKeys,
	width,
	unit = '',
	units,
	seriesLabels = [],
	showNodeValues = true,
}) {
	const theme = useTheme();
	const lineColors = [theme.chart.line, theme.chart.lineSecondary];
	const axisColor = theme.chart.axis;
	const labelColor = theme.chart.label;
	const [measuredWidth, setMeasuredWidth] = useState(0);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [tooltipHeight, setTooltipHeight] = useState(56);
	const chartWidth = width ?? measuredWidth;
	const keys = yAxisKeys?.length ? yAxisKeys : [yAxisKey];
	const isMulti = keys.length > 1;
	const tooltipWidth = isMulti ? MULTI_TOOLTIP_WIDTH : TOOLTIP_WIDTH;

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

	const padding = { ...CHART_PADDING, left: 36, right: isMulti ? 36 : CHART_PADDING.right };
	const { series, innerHeight } = chartWidth
		? buildLinePoints({
			data,
			yKeys: keys,
			chartWidth,
			padding,
		})
		: { series: [], innerHeight: 0 };
	const axisPoints = series[0]?.points ?? [];
	const leftTicks = series[0]
		? getYAxisTicks(
			series[0].minY,
			series[0].maxY,
			series[0].meanY,
			padding.top,
			innerHeight
		)
		: [];
	const rightTicks = isMulti && series[1]
		? getYAxisTicks(
			series[1].minY,
			series[1].maxY,
			series[1].meanY,
			padding.top,
			innerHeight
		)
		: [];
	const selectedRows = selectedIndex == null
		? []
		: series.flatMap((line, lineIndex) => {
			const point = line.points[selectedIndex];
			if (!point || Number.isNaN(point.value)) return [];
			return [{
				...point,
				color: lineColors[lineIndex % lineColors.length],
				label: seriesLabels[lineIndex] ?? line.key,
				unit: units?.[lineIndex] ?? (isMulti ? '' : unit),
			}];
		});
	const selectedPoint = selectedRows[0] ?? null;
	const selectedItem = selectedPoint?.item;
	const selectedDate = selectedItem ? getChartTooltipDate(selectedItem) : '';
	const tooltipLeft = selectedPoint
		? getTooltipLeft(selectedPoint.x, chartWidth, tooltipWidth)
		: 0;
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
							stroke={isMulti ? lineColors[0] : axisColor}
							strokeWidth={1}
						/>
						{isMulti ? (
							<Line
								x1={chartWidth - padding.right}
								y1={padding.top}
								x2={chartWidth - padding.right}
								y2={padding.top + innerHeight}
								stroke={lineColors[1]}
								strokeWidth={1}
							/>
						) : null}
						<Line
							x1={padding.left}
							y1={padding.top + innerHeight}
							x2={chartWidth - padding.right}
							y2={padding.top + innerHeight}
							stroke={axisColor}
							strokeWidth={1}
						/>
						{leftTicks.map((tick, index) => (
							<G key={`y-tick-left-${index}`}>
								<Line
									x1={padding.left - 4}
									y1={tick.y}
									x2={padding.left}
									y2={tick.y}
									stroke={isMulti ? lineColors[0] : axisColor}
									strokeWidth={1}
								/>
								<SvgText
									x={padding.left - 8}
									y={tick.y + 3}
									fontSize={10}
									fill={isMulti ? lineColors[0] : labelColor}
									textAnchor="end"
								>
									{formatAxisValue(tick.value)}
								</SvgText>
							</G>
						))}
						{rightTicks.map((tick, index) => (
							<G key={`y-tick-right-${index}`}>
								<Line
									x1={chartWidth - padding.right}
									y1={tick.y}
									x2={chartWidth - padding.right + 4}
									y2={tick.y}
									stroke={lineColors[1]}
									strokeWidth={1}
								/>
								<SvgText
									x={chartWidth - padding.right + 8}
									y={tick.y + 3}
									fontSize={10}
									fill={lineColors[1]}
									textAnchor="start"
								>
									{formatAxisValue(tick.value)}
								</SvgText>
							</G>
						))}
						{series.map((line, lineIndex) => {
							const stroke = lineColors[lineIndex % lineColors.length];
							const validPoints = line.points.filter((point) => !Number.isNaN(point.value));
							const polylinePoints = validPoints
								.map((point) => `${point.x},${point.y}`)
								.join(' ');

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
									{line.points.map((point, index) => {
										if (Number.isNaN(point.value)) return null;
										const selected = index === selectedIndex;
										return (
											<G key={`${line.key}-point-${index}`}>
												{selected ? (
													<Circle
														cx={point.x}
														cy={point.y}
														r={8}
														fill={stroke}
														opacity={0.18}
													/>
												) : null}
												<Circle
													cx={point.x}
													cy={point.y}
													r={selected ? 5 : 4}
													fill={stroke}
												/>
												{showNodeValues ? (
													<SvgText
														x={point.x}
														y={point.y - 10}
														fontSize={10}
														fontWeight="600"
														fill={stroke}
														textAnchor={getXLabelAnchor(index, line.points.length)}
													>
														{String(point.value)}
													</SvgText>
												) : null}
											</G>
										);
									})}
								</G>
							);
						})}
						{axisPoints.map((point, index) => (
							<SvgText
								key={`label-${index}`}
								x={point.x}
								y={CHART_HEIGHT - 10}
								fontSize={10}
								fill={labelColor}
								textAnchor={getXLabelAnchor(index, axisPoints.length)}
							>
								{getChartAxisDate(point.item)}
							</SvgText>
						))}
					</Svg>
					{series.flatMap((line) =>
						line.points.map((point, index) => {
							if (Number.isNaN(point.value)) return null;
							const seriesUnit = units?.[keys.indexOf(line.key)] ?? (isMulti ? '' : unit);
							return (
								<Pressable
									key={`hit-${line.key}-${index}`}
									accessibilityRole="button"
									accessibilityLabel={
										isMulti
											? `Show details for ${getChartTooltipDate(point.item)}`
											: `Show details for ${point.value}${seriesUnit ? ` ${seriesUnit}` : ''}`
									}
									onPress={() =>
										setSelectedIndex((current) => (current === index ? null : index))
									}
									hitSlop={8}
									style={{
										position: 'absolute',
										left: point.x - HIT_SIZE / 2,
										top: point.y - HIT_SIZE / 2 - 8,
										width: HIT_SIZE,
										height: HIT_SIZE,
									}}
								/>
							);
						})
					)}
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
								width: tooltipWidth,
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
							{selectedRows.map((row) => (
								<Text
									key={`${row.label}-${row.value}`}
									className="text-xs font-semibold"
									style={{ color: row.color }}
								>
									{isMulti ? `${row.label} ` : ''}
									{row.value}
									{row.unit ? ` ${row.unit}` : ''}
								</Text>
							))}
							{selectedDate ? (
								<Text className="text-[10px] text-muted-foreground">
									{selectedDate}
								</Text>
							) : null}
							{!isMulti && selectedItem.remarks ? (
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

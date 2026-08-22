import { format } from 'date-fns';

export const CHART_HEIGHT = 220;
export const CHART_PADDING = { top: 36, right: 10, bottom: 36, left: 8 };
export const CHART_AXIS_DATE_FORMAT = "MMM, ''yy";
export const CHART_TOOLTIP_DATE_FORMAT = 'MMM dd, yyyy';

function formatChartDate(item, dateFormat) {
	if (item?.timestamp == null) return '';
	const time = Number(item.timestamp);
	if (Number.isNaN(time)) return '';
	return format(time, dateFormat);
}

export function getChartAxisDate(item) {
	return formatChartDate(item, CHART_AXIS_DATE_FORMAT);
}

export function getChartTooltipDate(item) {
	return formatChartDate(item, CHART_TOOLTIP_DATE_FORMAT);
}

export function getXLabelAnchor(index, length) {
	if (length <= 1) return 'middle';
	if (index === 0) return 'start';
	if (index === length - 1) return 'end';
	return 'middle';
}

export function formatAxisValue(value) {
	if (!Number.isFinite(value)) return '';
	const rounded = Math.round(value * 10) / 10;
	return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function getYAxisTicks(minY, maxY, meanY, top, innerHeight) {
	if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return [];
	const range = maxY - minY;

	if (range === 0) {
		return [{ value: minY, y: top + innerHeight / 2 }];
	}

	const valueToY = (value) =>
		top + innerHeight - ((value - minY) / range) * innerHeight;

	const ticks = [
		{ value: maxY, y: valueToY(maxY) },
		{ value: minY, y: valueToY(minY) },
	];

	if (Number.isFinite(meanY) && meanY !== minY && meanY !== maxY) {
		ticks.splice(1, 0, { value: meanY, y: valueToY(meanY) });
	}

	return ticks;
}

function getScale(values) {
	if (values.length === 0) {
		return { minY: 0, maxY: 1, meanY: 0 };
	}

	const minY = Math.min(...values);
	const maxY = Math.max(...values);
	const meanY = values.reduce((sum, value) => sum + value, 0) / values.length;
	return { minY, maxY, meanY };
}

export function buildLinePoints({
	data,
	yKey,
	yKeys,
	chartWidth,
	height = CHART_HEIGHT,
	padding = CHART_PADDING,
}) {
	const keys = yKeys?.length ? yKeys : [yKey];
	const innerWidth = chartWidth - padding.left - padding.right;
	const innerHeight = height - padding.top - padding.bottom;
	const independentScale = keys.length > 1;

	const seriesValues = keys.map((key) =>
		data.map((item) => Number(item[key])).filter((value) => !Number.isNaN(value))
	);
	const sharedValues = seriesValues.flat();
	const sharedScale = getScale(sharedValues);

	if (sharedValues.length === 0) {
		return { series: [], points: [], minY: 0, maxY: 1, meanY: 0, innerWidth, innerHeight };
	}

	const series = keys.map((key, keyIndex) => {
		const { minY, maxY, meanY } = independentScale
			? getScale(seriesValues[keyIndex])
			: sharedScale;
		const range = maxY - minY;
		const hasValues = seriesValues[keyIndex].length > 0;

		return {
			key,
			minY,
			maxY,
			meanY,
			points: data.map((item, index) => {
				const value = Number(item[key]);
				const x =
					padding.left +
					(data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
				const y =
					Number.isNaN(value) || !hasValues
						? Number.NaN
						: range === 0
							? padding.top + innerHeight / 2
							: padding.top + innerHeight - ((value - minY) / range) * innerHeight;

				return { x, y, item, value };
			}),
		};
	});

	return {
		series,
		points: series[0]?.points ?? [],
		minY: sharedScale.minY,
		maxY: sharedScale.maxY,
		meanY: sharedScale.meanY,
		innerWidth,
		innerHeight,
	};
}

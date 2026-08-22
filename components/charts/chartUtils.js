import { format } from 'date-fns';

export const CHART_HEIGHT = 220;
export const CHART_PADDING = { top: 36, right: 10, bottom: 36, left: 8 };
export const CHART_AXIS_DATE_FORMAT = "MMM, ''yy";
export const CHART_TOOLTIP_DATE_FORMAT = 'MMM dd, yyyy';

/**
 * Formats a chart item's timestamp, or returns an empty string when the
 * timestamp is missing or not a number.
 *
 * @param {{ timestamp?: number|string|null }} [item]
 * @param {string} dateFormat - A `date-fns` format string.
 * @returns {string}
 */
function formatChartDate(item, dateFormat) {
	if (item?.timestamp == null) return '';
	const time = Number(item.timestamp);
	if (Number.isNaN(time)) return '';
	return format(time, dateFormat);
}

/**
 * Formats a data point's timestamp for the chart's X-axis (`MMM, 'yy`).
 *
 * @param {{ timestamp?: number|string|null }} [item]
 * @returns {string}
 */
export function getChartAxisDate(item) {
	return formatChartDate(item, CHART_AXIS_DATE_FORMAT);
}

/**
 * Formats a data point's timestamp for the chart tooltip (`MMM dd, yyyy`).
 *
 * @param {{ timestamp?: number|string|null }} [item]
 * @returns {string}
 */
export function getChartTooltipDate(item) {
	return formatChartDate(item, CHART_TOOLTIP_DATE_FORMAT);
}

/**
 * Picks the SVG text-anchor for an X-axis label so edge labels stay on-canvas.
 *
 * A single-point (or empty) series always uses `'middle'`. The first label
 * is `'start'`, the last is `'end'`, and everything in between is `'middle'`.
 *
 * @param {number} index - Zero-based index of the label.
 * @param {number} length - Total number of labels.
 * @returns {'start'|'middle'|'end'}
 */
export function getXLabelAnchor(index, length) {
	if (length <= 1) return 'middle';
	if (index === 0) return 'start';
	if (index === length - 1) return 'end';
	return 'middle';
}

/**
 * Formats a Y-axis tick for display, rounded to at most one decimal place.
 *
 * Non-finite values become an empty string. Whole numbers are returned
 * without a decimal (e.g. `10`), others use one digit (`10.5`).
 *
 * @param {number} value
 * @returns {string}
 */
export function formatAxisValue(value) {
	if (!Number.isFinite(value)) return '';
	const rounded = Math.round(value * 10) / 10;
	return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Builds Y-axis tick positions for min, max, and (when distinct) mean values.
 *
 * Returns an empty array when `minY` or `maxY` is not finite. A zero range
 * yields a single tick centered in the plot. Mean is inserted between max
 * and min only when it is finite and not equal to either bound.
 *
 * @param {number} minY
 * @param {number} maxY
 * @param {number} meanY
 * @param {number} top - Top padding of the chart (pixel Y of the plot top).
 * @param {number} innerHeight - Plot height in pixels.
 * @returns {Array<{ value: number, y: number }>}
 */
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

/**
 * Computes min, max, and mean for a list of numeric values.
 *
 * An empty list returns `{ minY: 0, maxY: 1, meanY: 0 }` so callers can still
 * render an empty chart.
 *
 * @param {number[]} values
 * @returns {{ minY: number, maxY: number, meanY: number }}
 */
function getScale(values) {
	if (values.length === 0) {
		return { minY: 0, maxY: 1, meanY: 0 };
	}

	const minY = Math.min(...values);
	const maxY = Math.max(...values);
	const meanY = values.reduce((sum, value) => sum + value, 0) / values.length;
	return { minY, maxY, meanY };
}

/**
 * Maps series data onto pixel coordinates for a line chart.
 *
 * Uses `yKeys` when that array is non-empty; otherwise a single series from
 * `yKey`. Multiple series are scaled independently; the returned `minY` /
 * `maxY` / `meanY` still describe the combined (shared) scale. A one-point
 * series is centered horizontally. Non-numeric values become `NaN` on `y`.
 *
 * @param {Object} options
 * @param {Array<Object>} options.data - Data points, each with the y-key fields.
 * @param {string} [options.yKey] - Field to plot when `yKeys` is omitted or empty.
 * @param {string[]} [options.yKeys] - Fields to plot as separate series.
 * @param {number} options.chartWidth - Full chart width in pixels.
 * @param {number} [options.height=220]
 * @param {{ top: number, right: number, bottom: number, left: number }} [options.padding]
 * @returns {{
 *   series: Array<{ key: string, minY: number, maxY: number, meanY: number, points: Array<Object> }>,
 *   points: Array<Object>,
 *   minY: number,
 *   maxY: number,
 *   meanY: number,
 *   innerWidth: number,
 *   innerHeight: number,
 * }}
 */
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

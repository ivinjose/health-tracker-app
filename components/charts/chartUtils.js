import { Dimensions } from 'react-native';

export const CHART_HEIGHT = 220;
export const CHART_PADDING = { top: 28, right: 16, bottom: 36, left: 44 };

export function getChartWidth(horizontalPadding = 32) {
	return Dimensions.get('window').width - horizontalPadding;
}

export function buildLinePoints({
	data,
	xKey,
	yKey,
	chartWidth,
	height = CHART_HEIGHT,
	padding = CHART_PADDING,
}) {
	const innerWidth = chartWidth - padding.left - padding.right;
	const innerHeight = height - padding.top - padding.bottom;

	const values = data
		.map((item) => Number(item[yKey]))
		.filter((value) => !Number.isNaN(value));

	if (values.length === 0) {
		return { points: [], minY: 0, maxY: 1, innerWidth, innerHeight };
	}

	const minY = Math.min(...values) * 0.9;
	const maxY = Math.max(...values) * 1.1 || 1;
	const range = maxY - minY || 1;

	const points = data.map((item, index) => {
		const value = Number(item[yKey]);
		const x =
			padding.left +
			(data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
		const y =
			padding.top + innerHeight - ((value - minY) / range) * innerHeight;

		return { x, y, item, value };
	});

	return { points, minY, maxY, innerWidth, innerHeight };
}

export function buildMultiLinePoints({
	data,
	xKey,
	yKeys,
	chartWidth,
	height = CHART_HEIGHT,
	padding = CHART_PADDING,
}) {
	const allValues = data.flatMap((item) =>
		yKeys.map((key) => Number(item[key])).filter((value) => !Number.isNaN(value))
	);

	const innerWidth = chartWidth - padding.left - padding.right;
	const innerHeight = height - padding.top - padding.bottom;

	if (allValues.length === 0) {
		return { series: [], minY: 0, maxY: 1, innerWidth, innerHeight };
	}

	const minY = Math.min(...allValues) * 0.9;
	const maxY = Math.max(...allValues) * 1.1 || 1;
	const range = maxY - minY || 1;

	const series = yKeys.map((yKey) => ({
		key: yKey,
		points: data.map((item, index) => {
			const value = Number(item[yKey]);
			const x =
				padding.left +
				(data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
			const y =
				Number.isNaN(value)
					? null
					: padding.top + innerHeight - ((value - minY) / range) * innerHeight;

			return {
				x,
				y,
				item,
				value,
			};
		}),
	}));

	return { series, minY, maxY, innerWidth, innerHeight };
}

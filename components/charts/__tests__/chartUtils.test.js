import {
	CHART_HEIGHT,
	CHART_PADDING,
	buildLinePoints,
	formatAxisValue,
	getChartAxisDate,
	getChartTooltipDate,
	getXLabelAnchor,
	getYAxisTicks,
} from '../chartUtils';

const januaryFifth = new Date(2024, 0, 5, 12, 0, 0, 0);
const marchFirst = new Date(2024, 2, 1, 8, 0, 0, 0);

describe('getChartAxisDate', () => {
	it('formats a timestamp as MMM, \'yy', () => {
		expect(getChartAxisDate({ timestamp: januaryFifth.getTime() })).toBe("Jan, '24");
		expect(getChartAxisDate({ timestamp: marchFirst.getTime() })).toBe("Mar, '24");
	});

	it('returns an empty string when timestamp is missing or not numeric', () => {
		expect(getChartAxisDate(undefined)).toBe('');
		expect(getChartAxisDate({})).toBe('');
		expect(getChartAxisDate({ timestamp: null })).toBe('');
		expect(getChartAxisDate({ timestamp: 'not-a-date' })).toBe('');
		expect(getChartAxisDate({ timestamp: Number.NaN })).toBe('');
	});

	it('accepts numeric timestamp strings', () => {
		expect(getChartAxisDate({ timestamp: String(januaryFifth.getTime()) })).toBe(
			"Jan, '24"
		);
	});
});

describe('getChartTooltipDate', () => {
	it('formats a timestamp as MMM dd, yyyy', () => {
		expect(getChartTooltipDate({ timestamp: januaryFifth.getTime() })).toBe(
			'Jan 05, 2024'
		);
	});

	it('returns an empty string when timestamp is missing or not numeric', () => {
		expect(getChartTooltipDate({ timestamp: null })).toBe('');
		expect(getChartTooltipDate({ timestamp: undefined })).toBe('');
		expect(getChartTooltipDate({ timestamp: 'nope' })).toBe('');
	});
});

describe('getXLabelAnchor', () => {
	it('returns middle when there is at most one label', () => {
		expect(getXLabelAnchor(0, 0)).toBe('middle');
		expect(getXLabelAnchor(0, 1)).toBe('middle');
	});

	it('anchors the first label at start and the last at end', () => {
		expect(getXLabelAnchor(0, 5)).toBe('start');
		expect(getXLabelAnchor(4, 5)).toBe('end');
	});

	it('anchors interior labels in the middle', () => {
		expect(getXLabelAnchor(1, 5)).toBe('middle');
		expect(getXLabelAnchor(2, 5)).toBe('middle');
		expect(getXLabelAnchor(3, 5)).toBe('middle');
	});
});

describe('formatAxisValue', () => {
	it('returns an empty string for non-finite values', () => {
		expect(formatAxisValue(Number.NaN)).toBe('');
		expect(formatAxisValue(Number.POSITIVE_INFINITY)).toBe('');
		expect(formatAxisValue(Number.NEGATIVE_INFINITY)).toBe('');
	});

	it('renders whole numbers without a decimal place', () => {
		expect(formatAxisValue(10)).toBe('10');
		expect(formatAxisValue(10.04)).toBe('10');
		expect(formatAxisValue(0)).toBe('0');
	});

	it('rounds to one decimal place for fractional values', () => {
		expect(formatAxisValue(10.14)).toBe('10.1');
		expect(formatAxisValue(10.15)).toBe('10.2');
		expect(formatAxisValue(10.5)).toBe('10.5');
	});

	it('rounds half away from zero toward +Infinity, matching Math.round', () => {
		expect(formatAxisValue(-1.25)).toBe('-1.2');
	});
});

describe('getYAxisTicks', () => {
	const top = 36;
	const innerHeight = 148;

	it('returns an empty array when min or max is not finite', () => {
		expect(getYAxisTicks(Number.NaN, 10, 5, top, innerHeight)).toEqual([]);
		expect(getYAxisTicks(0, Number.POSITIVE_INFINITY, 5, top, innerHeight)).toEqual([]);
	});

	it('returns a single centered tick when min and max are equal', () => {
		expect(getYAxisTicks(10, 10, 10, top, innerHeight)).toEqual([
			{ value: 10, y: top + innerHeight / 2 },
		]);
	});

	it('places max at the top, min at the bottom, and mean between them', () => {
		const ticks = getYAxisTicks(10, 20, 15, top, innerHeight);

		expect(ticks).toEqual([
			{ value: 20, y: top },
			{ value: 15, y: top + innerHeight / 2 },
			{ value: 10, y: top + innerHeight },
		]);
	});

	it('omits mean when it equals min or max', () => {
		expect(getYAxisTicks(10, 20, 10, top, innerHeight)).toEqual([
			{ value: 20, y: top },
			{ value: 10, y: top + innerHeight },
		]);
		expect(getYAxisTicks(10, 20, 20, top, innerHeight)).toEqual([
			{ value: 20, y: top },
			{ value: 10, y: top + innerHeight },
		]);
	});

	it('omits mean when it is not finite', () => {
		expect(getYAxisTicks(10, 20, Number.NaN, top, innerHeight)).toEqual([
			{ value: 20, y: top },
			{ value: 10, y: top + innerHeight },
		]);
	});
});

describe('buildLinePoints', () => {
	const chartWidth = 200;
	const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
	const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

	it('returns an empty series and a placeholder scale when every value is non-numeric', () => {
		const result = buildLinePoints({
			data: [{ value: 'n/a' }, { value: undefined }],
			yKey: 'value',
			chartWidth,
		});

		expect(result).toEqual({
			series: [],
			points: [],
			minY: 0,
			maxY: 1,
			meanY: 0,
			innerWidth,
			innerHeight,
		});
	});

	it('returns an empty series for empty data', () => {
		const result = buildLinePoints({
			data: [],
			yKey: 'value',
			chartWidth,
		});

		expect(result.series).toEqual([]);
		expect(result.points).toEqual([]);
		expect(result.minY).toBe(0);
		expect(result.maxY).toBe(1);
		expect(result.meanY).toBe(0);
	});

	it('maps two values onto the left and right edges of the plot', () => {
		const data = [{ value: 10 }, { value: 20 }];
		const result = buildLinePoints({
			data,
			yKey: 'value',
			chartWidth,
		});

		expect(result.innerWidth).toBe(innerWidth);
		expect(result.innerHeight).toBe(innerHeight);
		expect(result.minY).toBe(10);
		expect(result.maxY).toBe(20);
		expect(result.meanY).toBe(15);
		expect(result.series).toHaveLength(1);
		expect(result.points).toBe(result.series[0].points);

		expect(result.points[0]).toMatchObject({
			x: CHART_PADDING.left,
			y: CHART_PADDING.top + innerHeight,
			value: 10,
			item: data[0],
		});
		expect(result.points[1]).toMatchObject({
			x: CHART_PADDING.left + innerWidth,
			y: CHART_PADDING.top,
			value: 20,
			item: data[1],
		});
	});

	it('centers a single point horizontally and vertically when the range is zero', () => {
		const data = [{ value: 10 }];
		const result = buildLinePoints({
			data,
			yKey: 'value',
			chartWidth,
		});

		expect(result.points[0].x).toBe(CHART_PADDING.left + innerWidth / 2);
		expect(result.points[0].y).toBe(CHART_PADDING.top + innerHeight / 2);
		expect(result.minY).toBe(10);
		expect(result.maxY).toBe(10);
		expect(result.meanY).toBe(10);
	});

	it('treats an empty yKeys array as a single series from yKey', () => {
		const result = buildLinePoints({
			data: [{ value: 4 }, { value: 8 }],
			yKey: 'value',
			yKeys: [],
			chartWidth,
		});

		expect(result.series).toHaveLength(1);
		expect(result.series[0].key).toBe('value');
	});

	it('scales multiple series independently while reporting the shared min/max/mean', () => {
		const data = [
			{ a: 0, b: 100 },
			{ a: 10, b: 200 },
		];
		const result = buildLinePoints({
			data,
			yKeys: ['a', 'b'],
			chartWidth,
		});

		expect(result.minY).toBe(0);
		expect(result.maxY).toBe(200);
		expect(result.meanY).toBe(77.5);
		expect(result.series).toHaveLength(2);

		expect(result.series[0].minY).toBe(0);
		expect(result.series[0].maxY).toBe(10);
		expect(result.series[0].points[0].y).toBe(CHART_PADDING.top + innerHeight);
		expect(result.series[0].points[1].y).toBe(CHART_PADDING.top);

		expect(result.series[1].minY).toBe(100);
		expect(result.series[1].maxY).toBe(200);
		expect(result.series[1].points[0].y).toBe(CHART_PADDING.top + innerHeight);
		expect(result.series[1].points[1].y).toBe(CHART_PADDING.top);
	});

	it('uses NaN for y when a point value is not numeric', () => {
		const result = buildLinePoints({
			data: [{ value: 10 }, { value: 'missing' }, { value: 20 }],
			yKey: 'value',
			chartWidth,
		});

		expect(Number.isNaN(result.points[1].y)).toBe(true);
		expect(result.points[1].value).toBe(Number.NaN);
		expect(result.minY).toBe(10);
		expect(result.maxY).toBe(20);
		expect(result.meanY).toBe(15);
	});

	it('honors custom height and padding', () => {
		const padding = { top: 10, right: 10, bottom: 10, left: 10 };
		const result = buildLinePoints({
			data: [{ value: 1 }, { value: 2 }],
			yKey: 'value',
			chartWidth: 100,
			height: 80,
			padding,
		});

		expect(result.innerWidth).toBe(80);
		expect(result.innerHeight).toBe(60);
		expect(result.points[0].x).toBe(10);
		expect(result.points[1].x).toBe(90);
	});
});

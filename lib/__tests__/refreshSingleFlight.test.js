import { runSingleFlight } from '../refreshSingleFlight';

describe('runSingleFlight', () => {
	it('shares one underlying invocation across concurrent callers', async () => {
		let resolveFn;
		const fn = jest.fn(
			() =>
				new Promise((resolve) => {
					resolveFn = resolve;
				})
		);

		const first = runSingleFlight(fn);
		const second = runSingleFlight(fn);

		expect(fn).toHaveBeenCalledTimes(1);

		resolveFn('access-token');

		await expect(first).resolves.toBe('access-token');
		await expect(second).resolves.toBe('access-token');
	});

	it('starts a new invocation after the previous one finishes', async () => {
		const fn = jest
			.fn()
			.mockResolvedValueOnce('first')
			.mockResolvedValueOnce('second');

		await expect(runSingleFlight(fn)).resolves.toBe('first');
		await expect(runSingleFlight(fn)).resolves.toBe('second');
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('clears the in-flight slot when the invocation rejects', async () => {
		const fail = jest.fn().mockRejectedValue(new Error('refresh failed'));
		const ok = jest.fn().mockResolvedValue('ok');

		await expect(runSingleFlight(fail)).rejects.toThrow('refresh failed');
		await expect(runSingleFlight(ok)).resolves.toBe('ok');
		expect(ok).toHaveBeenCalledTimes(1);
	});
});

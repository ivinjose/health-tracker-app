let inFlight = null;

/**
 * Deduplicate concurrent refresh attempts so rotation cannot 403 the rest.
 * Later callers share the same promise; the slot clears when it settles.
 */
export function runSingleFlight(fn) {
	if (!inFlight) {
		inFlight = (async () => {
			try {
				return await fn();
			} finally {
				inFlight = null;
			}
		})();
	}
	return inFlight;
}

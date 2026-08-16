/**
 * Zod 4-compatible resolver for react-hook-form.
 *
 * `@hookform/resolvers` v3 expects Zod 3's `error.errors`; Zod 4 uses
 * `error.issues` and rethrows, which surfaces as an uncaught ZodError.
 */
export function zodResolver(schema) {
	return async (values) => {
		const result = schema.safeParse(values);

		if (result.success) {
			return { values: result.data, errors: {} };
		}

		const errors = {};
		for (const issue of result.error.issues) {
			const key = issue.path[0];
			if (key == null || errors[key]) continue;
			errors[key] = {
				type: issue.code,
				message: issue.message,
			};
		}

		return { values: {}, errors };
	};
}

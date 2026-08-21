import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormState, useWatch } from 'react-hook-form';

/**
 * Shared setup for create/edit forms (sheet tick, footer button, etc.).
 *
 * Disables submit while required fields are empty or the schema is invalid:
 *
 *   const { form, canSubmit } = useValidatedForm({
 *     schema: formSchema,
 *     defaultValues: { name: '', date: undefined },
 *   });
 *
 *   <FormSheetModal
 *     confirmDisabled={!canSubmit || isPending}
 *     onConfirm={form.handleSubmit(onSave)}
 *   />
 */
export default function useValidatedForm({ schema, defaultValues, ...formOptions }) {
	const form = useForm({
		defaultValues,
		...formOptions,
		resolver: zodResolver(schema),
	});

	const values = useWatch({ control: form.control });
	const { isSubmitting } = useFormState({ control: form.control });
	const canSubmit = schema.safeParse(values ?? {}).success && !isSubmitting;

	return { form, canSubmit };
}

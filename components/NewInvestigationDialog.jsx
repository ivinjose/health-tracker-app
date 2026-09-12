import FormSheetModal from '@/components/FormSheetModal';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import { shouldLockInvestigationSlug, slugifyLabel } from '@/lib/investigationUtils';
import formSchema from '@/schemas/Investigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

const EMPTY_VALUES = { label: '', value: '', unit: '' };

export default function NewInvestigationDialog({ open, onOpenChange, investigation }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const investigationsApiManager = useInvestigationsApiManager();
	const slugLockedRef = useRef(false);
	const slugInputKeyRef = useRef('investigation-slug');
	const [slugLocked, setSlugLocked] = useState(false);
	const isEdit = Boolean(investigation);

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: EMPTY_VALUES,
	});

	const values = form.watch();
	const label = values?.label ?? '';
	const generatedSlug = slugifyLabel(label);
	const generatedSlugRef = useRef(generatedSlug);
	generatedSlugRef.current = generatedSlug;
	if (open && !isEdit && !slugLocked) {
		slugInputKeyRef.current = `investigation-slug-${generatedSlug}`;
	}
	const confirmEnabled = isEdit
		? canSubmit
		: formSchema.safeParse({
				...values,
				value: slugLocked ? values?.value : generatedSlug,
			}).success;

	useEffect(() => {
		if (!open) return;
		slugLockedRef.current = false;
		slugInputKeyRef.current = 'investigation-slug';
		setSlugLocked(false);
		form.reset(
			investigation
				? {
						label: investigation.label ?? '',
						value: investigation.value ?? '',
						unit: investigation.unit ?? '',
					}
				: EMPTY_VALUES
		);
	}, [open, investigation, form]);

	const syncSlugFromLabel = (nextLabel) => {
		if (isEdit || slugLockedRef.current) return;
		form.setValue('value', slugifyLabel(nextLabel), { shouldValidate: true });
	};

	const onSlugChange = (text) => {
		if (isEdit || slugLockedRef.current) return;
		if (!shouldLockInvestigationSlug(text, generatedSlugRef.current, true)) return;
		slugLockedRef.current = true;
		setSlugLocked(true);
	};

	const { mutate: saveInvestigation, isPending } = useMutation({
		mutationFn: (data) => {
			if (isEdit) {
				return investigationsApiManager.updateInvestigation({
					id: investigation._id,
					label: data.label,
					unit: data.unit,
				});
			}
			return investigationsApiManager.createInvestigation({
				label: data.label,
				value: slugLockedRef.current ? data.value : slugifyLabel(data.label),
				unit: data.unit,
			});
		},
		onSuccess: async () => {
			form.reset(EMPTY_VALUES);
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ['investigations'] });
			toast({
				description: isEdit
					? 'Your investigation was updated successfully!'
					: 'Your investigation was saved successfully!',
			});
		},
		onError: (error) => {
			toast({ description: error.message });
		},
	});

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title={isEdit ? 'Edit investigation' : 'Create new investigation'}
			onConfirm={() => {
				if (!isEdit && !slugLockedRef.current) {
					form.setValue('value', generatedSlug, { shouldValidate: true });
				}
				form.handleSubmit(saveInvestigation)();
			}}
			confirmDisabled={!confirmEnabled || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel={isEdit ? 'Save' : 'Create investigation'}
		>
			<Form {...form}>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="label"
					placeholder="HbA1C (Sugar)"
					labelText="Label"
					onValueChange={syncSlugFromLabel}
				/>
				<FormFieldInput
					key={isEdit ? 'investigation-slug-edit' : slugInputKeyRef.current}
					formControl={form.control}
					schemaProperty="value"
					placeholder="hba1c"
					labelText="Slug"
					editable={!isEdit}
					autoCapitalize="none"
					displayValue={isEdit || slugLocked ? undefined : generatedSlug}
					onValueChange={onSlugChange}
				/>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="unit"
					placeholder="mmol/mol (optional)"
					labelText="Unit"
				/>
			</Form>
		</FormSheetModal>
	);
}

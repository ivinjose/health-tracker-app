import FormSheetModal from '@/components/FormSheetModal';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import formSchema from '@/schemas/Investigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const EMPTY_VALUES = { label: '', unit: '' };

export default function NewInvestigationDialog({ open, onOpenChange, investigation }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const investigationsApiManager = useInvestigationsApiManager();
	const isEdit = Boolean(investigation);

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: EMPTY_VALUES,
	});

	useEffect(() => {
		if (!open) return;
		form.reset(
			investigation
				? {
						label: investigation.label ?? '',
						unit: investigation.unit ?? '',
					}
				: EMPTY_VALUES
		);
	}, [open, investigation, form]);

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
			onConfirm={() => form.handleSubmit(saveInvestigation)()}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel={isEdit ? 'Save' : 'Create investigation'}
		>
			<Form {...form}>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="label"
					labelText="Label"
					required
				/>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="unit"
					labelText="Unit"
				/>
			</Form>
		</FormSheetModal>
	);
}

import FormFieldColor from '@/components/FormFieldColor';
import FormSheetModal from '@/components/FormSheetModal';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import { DEFAULT_LABEL_COLOR } from '@/constants/labels';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import useLabelsApiManager from '@/api-managers/LabelsApiManager';
import formSchema from '@/schemas/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const EMPTY_VALUES = { name: '', color: DEFAULT_LABEL_COLOR };

export default function NewLabelDialog({ open, onOpenChange, label }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const labelsApiManager = useLabelsApiManager();
	const isEdit = Boolean(label);

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: EMPTY_VALUES,
	});

	useEffect(() => {
		if (!open) return;
		form.reset(
			label
				? {
						name: label.name ?? '',
						color: label.color ?? DEFAULT_LABEL_COLOR,
					}
				: EMPTY_VALUES
		);
	}, [open, label, form]);

	const { mutate: saveLabel, isPending } = useMutation({
		mutationFn: (data) => {
			if (isEdit) {
				return labelsApiManager.updateLabel({
					id: label._id,
					name: data.name,
					color: data.color,
				});
			}
			return labelsApiManager.createLabel({
				name: data.name,
				color: data.color,
			});
		},
		onSuccess: async () => {
			form.reset(EMPTY_VALUES);
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ['labels'] });
			toast({
				description: isEdit
					? 'Your label was updated successfully!'
					: 'Your label was saved successfully!',
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
			title={isEdit ? 'Edit label' : 'Create new label'}
			onConfirm={() => form.handleSubmit(saveLabel)()}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel={isEdit ? 'Save' : 'Create label'}
		>
			<Form {...form}>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="name"
					labelText="Name"
					required
				/>
				<FormFieldColor
					formControl={form.control}
					schemaProperty="color"
					labelText="Color"
					required
				/>
			</Form>
		</FormSheetModal>
	);
}

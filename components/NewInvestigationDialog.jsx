import FormSheetModal from '@/components/FormSheetModal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import { slugifyLabel } from '@/lib/investigationUtils';
import formSchema from '@/schemas/Investigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

const EMPTY_VALUES = { label: '', value: '', unit: '' };

export default function NewInvestigationDialog({ open, onOpenChange, investigation }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const investigationsApiManager = useInvestigationsApiManager();
	const slugTouchedRef = useRef(false);
	const isEdit = Boolean(investigation);

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: EMPTY_VALUES,
	});

	const label = form.watch('label');

	useEffect(() => {
		if (!open) return;
		slugTouchedRef.current = false;
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

	useEffect(() => {
		if (!open || isEdit || slugTouchedRef.current) return;
		const nextSlug = slugifyLabel(label ?? '');
		if (form.getValues('value') !== nextSlug) {
			form.setValue('value', nextSlug, { shouldValidate: true });
		}
	}, [open, isEdit, label, form]);

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
				value: data.value,
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
			footer={
				<Button
					onPress={form.handleSubmit(saveInvestigation)}
					disabled={!canSubmit || isPending}
				>
					<Text className="font-medium text-primary-foreground">
						{isPending ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save' : 'Create investigation'}
					</Text>
				</Button>
			}
		>
			<Form {...form}>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="label"
					placeholder="HbA1C (Sugar)"
					labelText="Label"
				/>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="value"
					placeholder="hba1c"
					labelText="Slug"
					editable={!isEdit}
					autoCapitalize="none"
					onValueChange={() => {
						slugTouchedRef.current = true;
					}}
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

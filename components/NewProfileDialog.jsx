import FormSheetModal from '@/components/FormSheetModal';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import FormFieldSelect from '@/components/ui/form-field-select';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import formSchema from '@/schemas/Profile';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const GENDER_OPTIONS = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
];

export default function NewProfileDialog({ open, onOpenChange }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const profileApiManager = useProfileApiManager();

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: { name: '', age: '', gender: '' },
	});

	const { mutateAsync: addProfile, isPending } = useMutation({
		mutationFn: (data) => {
			const { name, age, gender } = data;
			return profileApiManager.createProfile({ name, age: Number(age), gender });
		},
		onSuccess: async () => {
			form.reset();
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ['profiles'] });
			toast({ description: 'Your profile was saved successfully!' });
		},
	});

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title="Create new profile"
			onConfirm={form.handleSubmit(addProfile)}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel="Create profile"
		>
			<Form {...form}>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="name"
					labelText="Name"
					required
				/>
				<FormFieldSelect
					formControl={form.control}
					schemaProperty="gender"
					labelText="Gender"
					dropdownOptions={GENDER_OPTIONS}
					required
				/>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="age"
					inputType="number"
					labelText="Age"
					required
				/>
			</Form>
		</FormSheetModal>
	);
}

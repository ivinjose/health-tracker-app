import FormSheetModal from '@/components/FormSheetModal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import FormFieldSelect from '@/components/ui/form-field-select';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import formSchema from '@/schemas/Profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

const GENDER_OPTIONS = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
];

export default function NewProfileDialog({ open, onOpenChange }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const profileApiManager = useProfileApiManager();

	const form = useForm({
		resolver: zodResolver(formSchema),
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
			footer={
				<Button onPress={form.handleSubmit(addProfile)} disabled={isPending}>
					<Text className="font-medium text-primary-foreground">
						{isPending ? 'Creating…' : 'Create profile'}
					</Text>
				</Button>
			}
		>
			<Form {...form}>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="name"
					placeholder="Enter the name"
					labelText="Name"
				/>
				<FormFieldSelect
					formControl={form.control}
					schemaProperty="gender"
					placeholder="Choose from the list"
					labelText="Gender"
					dropdownOptions={GENDER_OPTIONS}
				/>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="age"
					placeholder="Enter the age"
					inputType="number"
					labelText="Age"
				/>
			</Form>
		</FormSheetModal>
	);
}

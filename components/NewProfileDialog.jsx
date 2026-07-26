import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { ScrollView } from 'react-native';

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90%]">
				<DialogHeader>
					<DialogTitle>Create new profile</DialogTitle>
				</DialogHeader>
				<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
						<Button onPress={form.handleSubmit(addProfile)} disabled={isPending} className="mt-2">
							<Text className="font-medium text-primary-foreground">
								{isPending ? 'Creating…' : 'Create profile'}
							</Text>
						</Button>
					</Form>
				</ScrollView>
			</DialogContent>
		</Dialog>
	);
}

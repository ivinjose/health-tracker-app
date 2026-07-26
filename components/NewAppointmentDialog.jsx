import FormDateField from '@/components/FormDateField';
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
import FormFieldTextarea from '@/components/ui/form-field-textarea';
import { Text } from '@/components/ui/text';
import { TIME_SLOTS } from '@/constants/appointments';
import { useToast } from '@/hooks/use-toast';
import useAppointmentsApiManager from '@/api-managers/AppointmentsApiManager';
import formSchema from '@/schemas/Appointment';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, subDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';

const TIME_OPTIONS = TIME_SLOTS.map((slot) => ({ label: slot, value: slot }));

export default function NewAppointmentDialog({ open, onOpenChange }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const appointmentsApiManager = useAppointmentsApiManager();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: { location: '', date: undefined, time: '', remarks: '' },
	});

	const { mutateAsync: addAppointment, isPending } = useMutation({
		mutationFn: (data) => {
			const { location, date, time, remarks } = data;
			return appointmentsApiManager.createAppointment({ location, date, time, remarks });
		},
		onSuccess: async () => {
			form.reset();
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ['appointments'] });
			await queryClient.invalidateQueries({ queryKey: ['appointments-widget'] });
			toast({ description: 'Your appointment was saved successfully!' });
		},
	});

	const minDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90%]">
				<DialogHeader>
					<DialogTitle>Appointment details</DialogTitle>
				</DialogHeader>
				<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
					<Form {...form}>
						<FormFieldInput
							formControl={form.control}
							schemaProperty="location"
							placeholder="Dr. Jean Claude at Medical trust"
							labelText="Where's the appointment at"
						/>
						<FormDateField
							formControl={form.control}
							name="date"
							labelText="Date of appointment"
							minDate={minDate}
						/>
						<FormFieldSelect
							formControl={form.control}
							schemaProperty="time"
							placeholder="Select time"
							labelText="Time of appointment"
							dropdownOptions={TIME_OPTIONS}
						/>
						<FormFieldTextarea
							formControl={form.control}
							schemaProperty="remarks"
							placeholder="Remember to take the results from the blood work last week"
							labelText="Remarks"
						/>
						<Button
							onPress={form.handleSubmit(addAppointment)}
							disabled={isPending}
							className="mt-2"
						>
							<Text className="font-medium text-primary-foreground">
								{isPending ? 'Saving…' : 'Save'}
							</Text>
						</Button>
					</Form>
				</ScrollView>
			</DialogContent>
		</Dialog>
	);
}

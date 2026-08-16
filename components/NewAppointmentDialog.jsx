import FormDateField from '@/components/FormDateField';
import FormSheetModal from '@/components/FormSheetModal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import FormFieldSelect from '@/components/ui/form-field-select';
import FormFieldTextarea from '@/components/ui/form-field-textarea';
import { Text } from '@/components/ui/text';
import { TIME_SLOTS } from '@/constants/appointments';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import useAppointmentsApiManager from '@/api-managers/AppointmentsApiManager';
import formSchema from '@/schemas/Appointment';
import { format, subDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TIME_OPTIONS = TIME_SLOTS.map((slot) => ({ label: slot, value: slot }));

export default function NewAppointmentDialog({ open, onOpenChange }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const appointmentsApiManager = useAppointmentsApiManager();

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
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
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title="Appointment details"
			footer={
				<Button onPress={form.handleSubmit(addAppointment)} disabled={!canSubmit || isPending}>
					<Text className="font-medium text-primary-foreground">
						{isPending ? 'Saving…' : 'Save'}
					</Text>
				</Button>
			}
		>
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
			</Form>
		</FormSheetModal>
	);
}

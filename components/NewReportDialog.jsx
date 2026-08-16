import useAppointmentsApiManager from '@/api-managers/AppointmentsApiManager';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import FormDateField from '@/components/FormDateField';
import FormSheetModal from '@/components/FormSheetModal';
import { Form } from '@/components/ui/form';
import FormFieldInput from '@/components/ui/form-field-input';
import FormFieldSelect from '@/components/ui/form-field-select';
import FormFieldTextarea from '@/components/ui/form-field-textarea';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import formSchema from '@/schemas/Report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function NewReportDialog({ open, onOpenChange, appointmentId }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const appointmentsApiManager = useAppointmentsApiManager();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: {
			investigation: '',
			value: '',
			date: undefined,
			appointment: appointmentId ?? '',
			remarks: '',
		},
	});

	useEffect(() => {
		if (appointmentId) {
			form.setValue('appointment', appointmentId);
		}
	}, [appointmentId, form]);

	const { data: appointments = [], isLoading: appointmentsIsLoading } = useQuery({
		queryKey: ['appointments'],
		queryFn: () => appointmentsApiManager.readAppointments({}),
		enabled: open,
	});

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations({}),
		enabled: open,
	});

	const appointmentOptions = appointments.map(({ _id, location, timestamp }) => ({
		label: `${location} on ${format(timestamp, 'MMM dd, yyyy - hh:mm aaa')}`,
		value: _id,
	}));

	const { mutateAsync: addReport, isPending } = useMutation({
		mutationFn: (data) => reportsApiManager.createReport(data),
		onSuccess: async () => {
			form.reset({ appointment: appointmentId ?? '' });
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ['reports'] });
			await queryClient.invalidateQueries({ queryKey: ['latest'] });
			toast({ description: 'Your report was saved successfully!' });
		},
	});

	const maxDate = format(new Date(), 'yyyy-MM-dd');

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title="Report details"
			onConfirm={form.handleSubmit(addReport)}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
		>
			<Form {...form}>
				<FormFieldSelect
					formControl={form.control}
					schemaProperty="investigation"
					placeholder="Choose from the list"
					labelText="Investigation"
					dropdownOptions={isInvestigationLoading ? [] : investigations}
				/>
				<FormFieldInput
					formControl={form.control}
					schemaProperty="value"
					placeholder="Enter the test result value"
					labelText="Report value"
					inputType="number"
				/>
				<FormDateField
					formControl={form.control}
					name="date"
					labelText="Date of sample collection"
					maxDate={maxDate}
				/>
				{/* Hiding for now since its convoluting the focus away from the health metrics */}
				{/* <FormFieldSelect
					formControl={form.control}
					schemaProperty="appointment"
					placeholder="Choose an appointment"
					labelText="Link to an appointment"
					dropdownOptions={
						appointmentsIsLoading
							? [{ label: 'Loading appointments…', value: '' }]
							: appointmentOptions
					}
				/> */}
				<FormFieldTextarea
					formControl={form.control}
					schemaProperty="remarks"
					placeholder="Enter any details you want to remember or note"
					labelText="Remarks"
				/>
				{/* TODO Phase 4: file upload + OCR */}
			</Form>
		</FormSheetModal>
	);
}

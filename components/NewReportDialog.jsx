import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import FormSheetModal from '@/components/FormSheetModal';
import ReportFormFields from '@/components/ReportFormFields';
import { Form } from '@/components/ui/form';
import { FEATURE_REPORT_UPLOAD } from '@/constants/features';
import { useToast } from '@/hooks/use-toast';
import useValidatedForm from '@/hooks/useValidatedForm';
import formSchema from '@/schemas/Report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect } from 'react';

const EMPTY_VALUES = {
	investigation: '',
	value: '',
	date: undefined,
	appointment: undefined,
	remarks: '',
	report: undefined,
};

export default function NewReportDialog({ open, onOpenChange, appointmentId, report }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();
	const isEdit = Boolean(report);

	const { form, canSubmit } = useValidatedForm({
		schema: formSchema,
		defaultValues: {
			...EMPTY_VALUES,
			appointment: appointmentId || undefined,
		},
	});

	useEffect(() => {
		if (!open) return;
		form.reset(
			report
				? {
						investigation: report.investigation ?? '',
						value: report.value != null ? String(report.value) : '',
						date: report.timestamp ? new Date(report.timestamp) : undefined,
						appointment: report.appointment || undefined,
						remarks: report.remarks ?? '',
						report: undefined,
					}
				: {
						...EMPTY_VALUES,
						appointment: appointmentId || undefined,
					}
		);
	}, [open, report, appointmentId, form]);

	// TODO later: add appointments to the report
	// const { data: appointments = [], isLoading: appointmentsIsLoading } = useQuery({
	// 	queryKey: ['appointments'],
	// 	queryFn: () => appointmentsApiManager.readAppointments({}),
	// 	enabled: open,
	// });

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: async () => {
			const result = await investigationsApiManager.readInvestigations({});
			return result ?? [];
		},
		enabled: open,
	});

	const { mutate: saveReport, isPending } = useMutation({
		mutationFn: (data) => {
			if (isEdit) {
				return reportsApiManager.updateReport({
					id: report._id,
					investigation: data.investigation,
					value: data.value,
					date: data.date,
					remarks: data.remarks,
				});
			}
			return reportsApiManager.createReport(data);
		},
		onSuccess: async () => {
			form.reset({
				...EMPTY_VALUES,
				appointment: appointmentId || undefined,
			});
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ['reports'] });
			await queryClient.invalidateQueries({ queryKey: ['latest'] });
			toast({
				description: isEdit
					? 'Your report was updated successfully!'
					: 'Your report was saved successfully!',
			});
		},
		onError: (error) => {
			toast({ description: error.message });
		},
	});

	const maxDate = format(new Date(), 'yyyy-MM-dd');

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title={isEdit ? 'Edit report' : 'Report details'}
			onConfirm={form.handleSubmit(saveReport)}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel={isEdit ? 'Save' : 'Create report'}
		>
			<Form {...form}>
				<ReportFormFields
					form={form}
					investigations={investigations}
					isInvestigationLoading={isInvestigationLoading}
					maxDate={maxDate}
					investigationDisabled={isEdit}
					showUpload={FEATURE_REPORT_UPLOAD && !isEdit}
					uploadDisabled={isPending}
				/>
				{/* TODO later: add appointments to the report */}
				{/* TODO Phase 4: OCR */}
			</Form>
		</FormSheetModal>
	);
}

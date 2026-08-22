import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import FormSheetModal from '@/components/FormSheetModal';
import ReportFormFields from '@/components/ReportFormFields';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import { getDateWithoutTime } from '@/lib/helpers';
import { getInvestigationLabel } from '@/lib/reportUtils';
import formSchema, { isEmptyDraft } from '@/schemas/Report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Minus, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Pressable, View } from 'react-native';

function todayAtLocalMidnight() {
	return getDateWithoutTime(new Date());
}

function emptyDraft(date) {
	return {
		investigation: '',
		value: '',
		date: date ?? todayAtLocalMidnight(),
		remarks: '',
	};
}

function draftLabel(row, investigations) {
	const name = row.investigation
		? getInvestigationLabel(investigations, row.investigation)
		: 'Report';
	const datePart =
		row.date instanceof Date && !Number.isNaN(row.date.valueOf())
			? format(row.date, 'MMM dd, yyyy')
			: '';
	return datePart ? `${name} · ${datePart}` : name;
}

export default function NewMultiReportDialog({ open, onOpenChange }) {
	const theme = useTheme();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();
	const [saveErrors, setSaveErrors] = useState([]);

	const form = useForm({
		defaultValues: { reports: [emptyDraft()] },
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'reports',
	});
	const watchedReports = useWatch({ control: form.control, name: 'reports' });
	const canSubmit = (watchedReports ?? []).some((row) => formSchema.safeParse(row).success);

	useEffect(() => {
		if (!open) return;
		setSaveErrors([]);
		form.reset({ reports: [emptyDraft()] });
	}, [open, form]);

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: async () => {
			const result = await investigationsApiManager.readInvestigations({});
			return result ?? [];
		},
		enabled: open,
	});

	const { mutate: saveReports, isPending } = useMutation({
		mutationFn: async () => {
			const reports = form.getValues('reports') ?? [];
			const leftover = [];
			const listErrors = [];
			const fieldErrors = [];
			const validRows = [];

			for (const row of reports) {
				if (isEmptyDraft(row)) continue;

				const parsed = formSchema.safeParse(row);
				if (!parsed.success) {
					const leftoverIndex = leftover.length;
					leftover.push(row);
					listErrors.push({
						label: draftLabel(row, investigations),
						message: parsed.error.issues[0]?.message ?? 'Please complete this report.',
					});
					for (const issue of parsed.error.issues) {
						const name = issue.path[0];
						if (typeof name === 'string') {
							fieldErrors.push({
								index: leftoverIndex,
								name,
								message: issue.message,
							});
						}
					}
					continue;
				}

				validRows.push(row);
			}

			let savedCount = 0;
			if (validRows.length > 0) {
				const results = await reportsApiManager.createReports(validRows);
				results.forEach((result) => {
					if (result.status === 'fulfilled') {
						savedCount += 1;
						return;
					}
					leftover.push(result.row);
					listErrors.push({
						label: draftLabel(result.row, investigations),
						message: result.error?.message ?? 'Could not create report.',
					});
				});
			}

			return {
				leftover,
				listErrors,
				fieldErrors,
				savedCount,
				posted: validRows.length > 0,
			};
		},
		onSuccess: async ({ leftover, listErrors, fieldErrors, savedCount, posted }) => {
			if (posted) {
				await queryClient.invalidateQueries({ queryKey: ['reports'] });
				await queryClient.invalidateQueries({ queryKey: ['latest'] });
			}

			if (listErrors.length === 0) {
				setSaveErrors([]);
				form.reset({ reports: [emptyDraft()] });
				onOpenChange(false);
				toast({
					description:
						savedCount === 1
							? 'Your report was saved successfully!'
							: 'Your reports were saved successfully!',
				});
				return;
			}

			form.reset({
				reports: leftover.length > 0 ? leftover : [emptyDraft()],
			});
			setSaveErrors(listErrors);
			fieldErrors.forEach(({ index, name, message }) => {
				form.setError(`reports.${index}.${name}`, { type: 'manual', message });
			});
		},
		onError: (error) => {
			setSaveErrors([
				{
					label: 'Reports',
					message: error.message || 'Could not create reports.',
				},
			]);
		},
	});

	const maxDate = format(new Date(), 'yyyy-MM-dd');
	const canRemove = fields.length > 1 && !isPending;

	const addAnother = () => {
		const reports = form.getValues('reports') ?? [];
		const previous = reports[reports.length - 1];
		append(emptyDraft(previous?.date));
	};

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title="Add reports"
			onConfirm={() => saveReports()}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel="Create reports"
		>
			<Form {...form}>
				{saveErrors.length > 0 ? (
					<View className="mb-4 rounded-[10px] border border-destructive p-3">
						{saveErrors.map((item, index) => (
							<Text
								key={`${item.label}-${index}`}
								className="text-sm text-destructive"
							>
								{item.label}: {item.message}
							</Text>
						))}
					</View>
				) : null}

				<View className="gap-4">
					{fields.map((field, index) => (
						<View
							key={field.id}
							className="rounded-[10px] border border-input bg-card p-3"
						>
							<View className="mb-2 flex-row items-center justify-between">
								<Text className="text-sm font-medium text-muted-foreground">
									Report {index + 1}
								</Text>
								<Pressable
									onPress={() => remove(index)}
									disabled={!canRemove}
									hitSlop={8}
									accessibilityRole="button"
									accessibilityLabel={`Remove report ${index + 1}`}
									accessibilityState={{ disabled: !canRemove }}
									className="h-8 w-8 items-center justify-center"
								>
									<Minus
										size={20}
										color={
											canRemove
												? theme.colors.mutedForeground
												: theme.colors.tintDisabled
										}
									/>
								</Pressable>
							</View>
							<ReportFormFields
								form={form}
								namePrefix={`reports.${index}`}
								investigations={investigations}
								isInvestigationLoading={isInvestigationLoading}
								maxDate={maxDate}
							/>
						</View>
					))}
				</View>

				<Button
					variant="outline"
					onPress={addAnother}
					disabled={isPending}
					className="mt-4"
				>
					<Plus size={16} color={theme.colors.foreground} />
					<Text>Add another report</Text>
				</Button>
			</Form>
		</FormSheetModal>
	);
}

import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import FormDateField from '@/components/FormDateField';
import FormFieldFile from '@/components/FormFieldFile';
import FormSheetModal from '@/components/FormSheetModal';
import ReportFormFields from '@/components/ReportFormFields';
import { Expanding } from '@/components/ui/expanding';
import { Form } from '@/components/ui/form';
import FormFieldTextarea from '@/components/ui/form-field-textarea';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import { getDateWithoutTime } from '@/lib/helpers';
import { getInvestigationLabel } from '@/lib/reportUtils';
import formSchema, { isEmptyDraft, reportFileSchema, reportRowSchema } from '@/schemas/Report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Keyboard, Pressable, View } from 'react-native';

const ROOT_FIELD_NAMES = new Set(['report', 'date', 'remarks']);

function todayAtLocalMidnight() {
	return getDateWithoutTime(new Date());
}

function emptyDraft() {
	return {
		investigation: '',
		value: '',
	};
}

function emptyForm() {
	return {
		reports: [emptyDraft()],
		report: undefined,
		date: todayAtLocalMidnight(),
		remarks: '',
	};
}

function draftLabel(row, investigations, date) {
	const name = row.investigation
		? getInvestigationLabel(investigations, row.investigation)
		: 'Report';
	const datePart =
		date instanceof Date && !Number.isNaN(date.valueOf())
			? format(date, 'MMM dd, yyyy')
			: '';
	return datePart ? `${name} · ${datePart}` : name;
}

export default function NewMultiReportDialog({ open, onOpenChange }) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();
	const [saveErrors, setSaveErrors] = useState([]);
	const [collapsedIds, setCollapsedIds] = useState(() => new Set());

	const form = useForm({
		defaultValues: emptyForm(),
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'reports',
	});
	const watchedReports = useWatch({ control: form.control, name: 'reports' });
	const watchedReport = useWatch({ control: form.control, name: 'report' });
	const watchedDate = useWatch({ control: form.control, name: 'date' });
	const canSubmit =
		(watchedReports ?? []).some((row) => reportRowSchema.safeParse(row).success) &&
		formSchema.shape.date.safeParse(watchedDate).success &&
		reportFileSchema.safeParse(watchedReport).success;

	useEffect(() => {
		if (!open) return;
		setSaveErrors([]);
		setCollapsedIds(new Set());
		form.reset(emptyForm());
	}, [open, form]);

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: async () => {
			const result = await investigationsApiManager.readInvestigations();
			return result ?? [];
		},
		enabled: open,
	});

	const { mutate: saveReports, isPending } = useMutation({
		mutationFn: async () => {
			const reports = form.getValues('reports') ?? [];
			const report = form.getValues('report');
			const date = form.getValues('date');
			const remarks = form.getValues('remarks');
			const listErrors = [];
			const fieldErrors = [];
			const validRows = [];

			const parsedDate = formSchema.shape.date.safeParse(date);
			if (!parsedDate.success) {
				const message = parsedDate.error.issues[0]?.message ?? 'Date is required.';
				listErrors.push({
					label: 'Date of sample collection',
					message,
				});
				fieldErrors.push({
					name: 'date',
					message,
				});
			}

			for (let index = 0; index < reports.length; index += 1) {
				const row = reports[index];
				if (isEmptyDraft(row)) continue;

				const parsed = reportRowSchema.safeParse(row);
				if (!parsed.success) {
					listErrors.push({
						label: draftLabel(row, investigations, date),
						message: parsed.error.issues[0]?.message ?? 'Please complete this report.',
					});
					for (const issue of parsed.error.issues) {
						const name = issue.path[0];
						if (typeof name === 'string') {
							fieldErrors.push({
								index,
								name,
								message: issue.message,
							});
						}
					}
					continue;
				}

				if (parsedDate.success) {
					validRows.push({
						...parsed.data,
						date: parsedDate.data,
						remarks,
					});
				}
			}

			const parsedFile = reportFileSchema.safeParse(report);
			if (!parsedFile.success) {
				const message =
					parsedFile.error.issues[0]?.message ?? 'Please attach a valid report file.';
				listErrors.push({
					label: 'Upload report',
					message,
				});
				fieldErrors.push({
					name: 'report',
					message,
				});
			}

			if (listErrors.length > 0 || validRows.length === 0) {
				return {
					listErrors,
					fieldErrors,
					savedCount: 0,
					posted: false,
				};
			}

			await reportsApiManager.createReports(validRows, report);

			return {
				listErrors: [],
				fieldErrors: [],
				savedCount: validRows.length,
				posted: true,
			};
		},
		onSuccess: async ({ listErrors, fieldErrors, savedCount, posted }) => {
			if (posted) {
				await queryClient.invalidateQueries({ queryKey: ['reports'] });
				await queryClient.invalidateQueries({ queryKey: ['latest'] });
			}

			if (listErrors.length === 0 && posted) {
				setSaveErrors([]);
				setCollapsedIds(new Set());
				form.reset(emptyForm());
				onOpenChange(false);
				toast({
					description:
						savedCount === 1
							? 'Your report was saved successfully!'
							: 'Your reports were saved successfully!',
				});
				return;
			}

			if (listErrors.length === 0) {
				return;
			}

			setSaveErrors(listErrors);
			fieldErrors.forEach(({ index, name, message }) => {
				if (ROOT_FIELD_NAMES.has(name) && index == null) {
					form.setError(name, { type: 'manual', message });
					return;
				}
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
		Keyboard.dismiss();
		setCollapsedIds(new Set(fields.map((field) => field.id)));
		append(emptyDraft());
	};

	const toggleCollapsed = (id) => {
		setCollapsedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<FormSheetModal
			open={open}
			onOpenChange={onOpenChange}
			title="Multiple Investigations"
			onConfirm={() => saveReports()}
			confirmDisabled={!canSubmit || isPending}
			confirmLoading={isPending}
			confirmAccessibilityLabel="Create reports"
		>
			<Form {...form}>
				{saveErrors.length > 0 ? (
					<View className="mb-4">
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

				<FormFieldFile
					formControl={form.control}
					schemaProperty="report"
					labelText="Upload report"
					disabled={isPending}
				/>
				<FormDateField
					formControl={form.control}
					name="date"
					labelText="Date of sample collection"
					maxDate={maxDate}
					required
				/>
				<FormFieldTextarea
					formControl={form.control}
					schemaProperty="remarks"
					placeholder="Enter any details you want to remember or note"
					labelText="Remarks"
				/>
				<View className="mb-4 mt-1 h-px bg-border" />

				{fields.map((field, index) => {
					const showHeader = fields.length > 1;
					const isExpanded = !showHeader || !collapsedIds.has(field.id);
					const row = watchedReports?.[index];
					const headerTitle = reportRowSchema.safeParse(row).success
						? getInvestigationLabel(investigations, row.investigation)
						: `Investigation ${index + 1}`;

					return (
						<View key={field.id} className="shrink-0">
							{index > 0 ? <View className="mb-4 mt-1 h-px bg-border/40" /> : null}
							{showHeader ? (
								<View className="mb-4 flex-row items-center justify-between">
									<Pressable
										onPress={() => toggleCollapsed(field.id)}
										hitSlop={8}
										className="min-w-0 flex-1 flex-row items-center gap-1.5 pr-3"
										accessibilityRole="button"
										accessibilityState={{ expanded: isExpanded }}
										accessibilityLabel={headerTitle}
									>
										<Text
											className="min-w-0 flex-1 text-sm font-medium text-muted-foreground"
											numberOfLines={1}
										>
											{headerTitle}
										</Text>
										<Icon
											as={isExpanded ? ChevronUp : ChevronDown}
											className="shrink-0 text-muted-foreground"
											size={16}
										/>
									</Pressable>
									<Pressable
										onPress={() => remove(index)}
										disabled={!canRemove}
										hitSlop={8}
										accessibilityRole="button"
										accessibilityLabel={`Remove ${headerTitle}`}
										accessibilityState={{ disabled: !canRemove }}
									>
										<Text
											className={
												canRemove
													? 'text-sm text-destructive'
													: 'text-sm text-muted-foreground'
											}
										>
											Remove
										</Text>
									</Pressable>
								</View>
							) : null}
							<Expanding open={isExpanded}>
								<ReportFormFields
									form={form}
									namePrefix={`reports.${index}`}
									investigations={investigations}
									isInvestigationLoading={isInvestigationLoading}
									showDate={false}
									showRemarks={false}
								/>
							</Expanding>
						</View>
					);
				})}

				<Pressable
					onPress={addAnother}
					disabled={isPending}
					accessibilityRole="button"
					accessibilityLabel="Add another investigation"
					accessibilityState={{ disabled: isPending }}
					className="mt-1 py-2"
				>
					<Text className={isPending ? 'text-muted-foreground' : 'text-primary'}>
						Add another investigation
					</Text>
				</Pressable>
			</Form>
		</FormSheetModal>
	);
}

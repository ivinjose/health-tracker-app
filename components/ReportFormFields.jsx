import FormFieldDate from '@/components/FormFieldDate';
import FormFieldFile from '@/components/FormFieldFile';
import FormFieldInvestigation from '@/components/FormFieldInvestigation';
import FormFieldLabels from '@/components/FormFieldLabels';
import FormFieldRemarks from '@/components/FormFieldRemarks';
import FormFieldInput from '@/components/ui/form-field-input';

function fieldName(namePrefix, name) {
	return namePrefix ? `${namePrefix}.${name}` : name;
}

export default function ReportFormFields({
	form,
	namePrefix = '',
	investigations = [],
	isInvestigationLoading = false,
	labels = [],
	isLabelLoading = false,
	maxDate,
	showUpload = false,
	uploadDisabled = false,
	showDate = true,
	showRemarks = true,
	showLabels = true,
}) {
	return (
		<>
			{showUpload ? (
				<FormFieldFile
					formControl={form.control}
					schemaProperty={fieldName(namePrefix, 'report')}
					labelText="Upload report"
					disabled={uploadDisabled}
				/>
			) : null}
			<FormFieldInvestigation
				formControl={form.control}
				schemaProperty={fieldName(namePrefix, 'investigation')}
				placeholder={isInvestigationLoading ? 'Loading investigations…' : undefined}
				labelText="Investigation"
				investigations={isInvestigationLoading ? [] : investigations}
				disabled={isInvestigationLoading}
				required
			/>
			{showLabels ? (
				<FormFieldLabels
					formControl={form.control}
					schemaProperty={fieldName(namePrefix, 'labels')}
					placeholder={isLabelLoading ? 'Loading labels…' : undefined}
					labels={isLabelLoading ? [] : labels}
					disabled={isLabelLoading}
				/>
			) : null}
			<FormFieldInput
				formControl={form.control}
				schemaProperty={fieldName(namePrefix, 'value')}
				labelText="Value"
				inputType="number"
				required
			/>
			{showDate ? (
				<FormFieldDate
					formControl={form.control}
					name={fieldName(namePrefix, 'date')}
					labelText="Date of sample collection"
					maxDate={maxDate}
					dateFormat="PP"
					required
				/>
			) : null}
			{showRemarks ? (
				<FormFieldRemarks
					formControl={form.control}
					schemaProperty={fieldName(namePrefix, 'remarks')}
				/>
			) : null}
		</>
	);
}

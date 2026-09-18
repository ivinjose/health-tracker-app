import FormDateField from '@/components/FormDateField';
import FormFieldFile from '@/components/FormFieldFile';
import FormFieldInvestigation from '@/components/FormFieldInvestigation';
import FormFieldInput from '@/components/ui/form-field-input';
import FormFieldTextarea from '@/components/ui/form-field-textarea';

function fieldName(namePrefix, name) {
	return namePrefix ? `${namePrefix}.${name}` : name;
}

export default function ReportFormFields({
	form,
	namePrefix = '',
	investigations = [],
	isInvestigationLoading = false,
	maxDate,
	showUpload = false,
	uploadDisabled = false,
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
				placeholder={
					isInvestigationLoading ? 'Loading investigations…' : 'Choose from the list'
				}
				labelText="Investigation"
				investigations={isInvestigationLoading ? [] : investigations}
				disabled={isInvestigationLoading}
				required
			/>
			<FormFieldInput
				formControl={form.control}
				schemaProperty={fieldName(namePrefix, 'value')}
				placeholder="Enter the test result value"
				labelText="Value"
				inputType="number"
				required
			/>
			<FormDateField
				formControl={form.control}
				name={fieldName(namePrefix, 'date')}
				labelText="Date of sample collection"
				maxDate={maxDate}
				required
			/>
			<FormFieldTextarea
				formControl={form.control}
				schemaProperty={fieldName(namePrefix, 'remarks')}
				placeholder="Enter any details you want to remember or note"
				labelText="Remarks"
			/>
		</>
	);
}

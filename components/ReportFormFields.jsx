import FormDateField from '@/components/FormDateField';
import FormFieldInput from '@/components/ui/form-field-input';
import FormFieldSelect from '@/components/ui/form-field-select';
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
	investigationDisabled = false,
}) {
	return (
		<>
			<FormFieldSelect
				formControl={form.control}
				schemaProperty={fieldName(namePrefix, 'investigation')}
				placeholder="Choose from the list"
				labelText="Investigation"
				dropdownOptions={isInvestigationLoading ? [] : investigations}
				disabled={investigationDisabled}
			/>
			<FormFieldInput
				formControl={form.control}
				schemaProperty={fieldName(namePrefix, 'value')}
				placeholder="Enter the test result value"
				labelText="Report value"
				inputType="number"
			/>
			<FormDateField
				formControl={form.control}
				name={fieldName(namePrefix, 'date')}
				labelText="Date of sample collection"
				maxDate={maxDate}
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

/**
 * Generic short dropdown for a fixed option list (profile gender, appointment slot).
 *
 * Do not use for long catalogs: investigations use {@link FormFieldInvestigation},
 * report tags use {@link FormFieldLabels}.
 */
import FormFieldLabel from '@/components/FormFieldLabel';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { Text, View } from 'react-native';

/**
 * Select bound to a react-hook-form string, with options `{ label, value }`.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the selected value.
 * @param {string} [props.labelText]
 * @param {string} [props.placeholder]
 * @param {Array<{ label: string, value: string }>} props.dropdownOptions
 * @param {boolean} [props.required]
 */
const FormFieldSelect = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	labelStyleClass,
	dropdownOptions,
	disabled = false,
	required = false,
}) => {
	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const stringValue =
					typeof value === 'string'
						? value
						: value && typeof value === 'object' && 'value' in value
							? String(value.value)
							: '';
				const selectedOption = dropdownOptions.find((o) => o.value === stringValue);
				const selectValue = selectedOption
					? {
							value: selectedOption.value,
							label: selectedOption.label,
						}
					: undefined;

				return (
					<View className="mb-4 w-full">
						<FormFieldLabel
							labelText={labelText}
							required={required}
							className={
								labelStyleClass ?? 'text-sm font-medium text-muted-foreground'
							}
						/>

						<Select
							value={selectValue}
							onValueChange={(option) => onChange(option?.value ?? '')}
							disabled={disabled}
						>
							<SelectTrigger className="mt-1 bg-card" disabled={disabled}>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>

							<SelectContent>
								{dropdownOptions.map(({ value: optionValue, label }) => (
									<SelectItem
										key={optionValue}
										value={optionValue}
										label={label}
									/>
								))}
							</SelectContent>
						</Select>

						{error && (
							<Text className="mt-1 text-destructive">{error.message}</Text>
						)}
					</View>
				);
			}}
		/>
	);
};

export default FormFieldSelect;

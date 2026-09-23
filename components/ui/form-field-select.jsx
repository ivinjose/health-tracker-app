/**
 * Generic short dropdown for a fixed option list (profile gender, appointment slot).
 *
 * Do not use for long catalogs: investigations use {@link FormFieldInvestigation},
 * report tags use {@link FormFieldLabels}.
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Controller } from 'react-hook-form';
import { Text as ErrorText, View } from 'react-native';

/**
 * Select bound to a react-hook-form string, with options `{ label, value }`.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the selected value.
 * @param {string} [props.labelText] - Shown on the left. The chosen option sits on the right.
 * @param {string} [props.placeholder] - Overrides `labelText` when set.
 * @param {Array<{ label: string, value: string }>} props.dropdownOptions
 * @param {boolean} [props.required]
 */
const FormFieldSelect = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	dropdownOptions,
	disabled = false,
	required = false,
}) => {
	const hint = placeholder || labelText;

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
					<View className="w-full border-b border-border">
						<Select
							value={selectValue}
							onValueChange={(option) => onChange(option?.value ?? '')}
							disabled={disabled}
						>
							<SelectTrigger
								className="h-auto w-full rounded-none border-0 bg-transparent px-0 py-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent sm:h-auto"
								disabled={disabled}
								accessibilityLabel={requiredFieldAccessibilityLabel(
									labelText || hint,
									required
								)}
							>
								<Text className="shrink-0 text-muted-foreground">{hint}</Text>
								<View className="min-w-0 flex-1 flex-row items-center justify-end">
									{selectValue ? (
										<Text
											className="min-w-0 shrink text-foreground"
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{selectValue.label}
										</Text>
									) : null}
								</View>
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
							<ErrorText className="mt-1 text-destructive">{error.message}</ErrorText>
						)}
					</View>
				);
			}}
		/>
	);
};

export default FormFieldSelect;

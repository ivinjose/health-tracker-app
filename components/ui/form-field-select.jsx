import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { Text, View } from 'react-native';

const FormFieldSelect = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	labelStyleClass,
	dropdownOptions,
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
						{!!labelText && (
							<Text
								className={
									labelStyleClass ?? 'text-sm font-medium text-muted-foreground'
								}
							>
								{labelText}
							</Text>
						)}

						<Select
							value={selectValue}
							onValueChange={(option) => onChange(option?.value ?? '')}
						>
							<SelectTrigger className="mt-1 bg-card">
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

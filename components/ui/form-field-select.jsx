import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { TextClassContext } from '@/components/ui/text';
import { useFormSheetAppearance } from '@/components/form-sheet-appearance';
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
	const isDark = useFormSheetAppearance() === 'dark';

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
					<View className={isDark ? 'mb-4 w-full' : 'w-full'}>
						{!!labelText && (
							<Text
								className={
									labelStyleClass ??
									(isDark ? 'text-[13px] font-normal text-[#8E8E93]' : undefined)
								}
							>
								{labelText}
							</Text>
						)}

						<TextClassContext.Provider value={isDark ? 'text-white' : undefined}>
							<Select
								value={selectValue}
								onValueChange={(option) => onChange(option?.value ?? '')}
							>
								<SelectTrigger
									className={
										isDark
											? 'mt-1 h-11 border-0 bg-[#2C2C2E] shadow-none'
											: 'mt-1'
									}
								>
									<SelectValue
										placeholder={placeholder}
										className={
											isDark
												? selectValue
													? 'text-white'
													: 'text-[#8E8E93]'
												: undefined
										}
									/>
								</SelectTrigger>

								<SelectContent
									className={
										isDark
											? 'border-[#3A3A3C] bg-[#2C2C2E]'
											: undefined
									}
								>
									{dropdownOptions.map(({ value: optionValue, label }) => (
										<SelectItem
											className={isDark ? undefined : 'text-black'}
											key={optionValue}
											value={optionValue}
											label={label}
										/>
									))}
								</SelectContent>
							</Select>
						</TextClassContext.Provider>

						{error && (
							<Text
								className={
									isDark ? 'mt-1 text-[#FF453A]' : 'mt-1 text-red-500'
								}
							>
								{error.message}
							</Text>
						)}
					</View>
				);
			}}
		/>
	);
};

export default FormFieldSelect;

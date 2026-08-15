import { IOS_DARK_SHEET, useFormSheetAppearance } from '@/components/form-sheet-appearance';
import { Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

const FormFieldInput = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	labelStyleClass,
	inputType = 'default',
}) => {
	const isDark = useFormSheetAppearance() === 'dark';

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
				<View className="mb-4">
					{!!labelText && (
						<Text
							className={
								labelStyleClass ??
								(isDark
									? 'mb-1 text-[13px] font-normal text-[#8E8E93]'
									: 'mb-1 text-base font-medium')
							}
						>
							{labelText}
						</Text>
					)}

					<TextInput
						className={
							isDark
								? 'rounded-[10px] bg-[#2C2C2E] px-3 py-3 text-base text-white'
								: 'rounded-lg border border-gray-300 px-3 py-2 text-base'
						}
						placeholder={placeholder}
						placeholderTextColor={isDark ? IOS_DARK_SHEET.placeholder : '#9ca3af'}
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						keyboardType={inputType === 'number' ? 'numeric' : 'default'}
						keyboardAppearance={isDark ? 'dark' : 'default'}
						selectionColor={isDark ? IOS_DARK_SHEET.tint : undefined}
					/>

					{error && (
						<Text
							className={
								isDark ? 'mt-1 text-sm text-[#FF453A]' : 'mt-1 text-sm text-red-500'
							}
						>
							{error.message}
						</Text>
					)}
				</View>
			)}
		/>
	);
};

export default FormFieldInput;

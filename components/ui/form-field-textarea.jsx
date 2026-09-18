import FormFieldLabel from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

const FormFieldTextarea = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	labelStyleClass,
	inputStyleClass,
	required = false,
}) => {
	const theme = useTheme();

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
				<View className="mb-4">
					<FormFieldLabel
						labelText={labelText}
						required={required}
						className={
							labelStyleClass ??
							'mb-1 text-sm font-medium text-muted-foreground'
						}
					/>

					<TextInput
						className={
							inputStyleClass ??
							'min-h-[100px] rounded-[10px] border border-input bg-card px-3 py-3 text-base leading-tight text-foreground'
						}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.placeholder}
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						multiline
						textAlignVertical="top"
						keyboardAppearance={theme.keyboardAppearance}
						selectionColor={theme.colors.tint}
					/>

					{error && (
						<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
					)}
				</View>
			)}
		/>
	);
};

export default FormFieldTextarea;

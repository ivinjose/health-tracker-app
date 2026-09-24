/**
 * Generic multiline text form control (typically report or appointment `remarks`).
 */
import FormFieldLabel from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

/**
 * Multiline text input bound to a react-hook-form string field.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the string.
 * @param {string} [props.labelText]
 * @param {string} [props.placeholder]
 * @param {boolean} [props.required]
 */
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
							'min-h-[75px] rounded-lg border border-input bg-card px-3 py-3 text-base leading-tight text-foreground'
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

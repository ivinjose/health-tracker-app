/**
 * Generic single-line text (or numeric keyboard) form control.
 *
 * Used for values such as report `value`, profile name, and label `name`.
 * Not a catalog Labels picker — that is {@link FormFieldLabels}.
 */
import FormFieldLabel from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

/**
 * Text input bound to a react-hook-form string field.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the string.
 * @param {string} [props.labelText]
 * @param {string} [props.placeholder]
 * @param {string} [props.inputType] - `'number'` uses a numeric keyboard.
 * @param {boolean} [props.required]
 */
const FormFieldInput = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	labelStyleClass,
	inputType = 'default',
	editable = true,
	autoCapitalize,
	onValueChange,
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
						className={`rounded-[10px] border border-input bg-card px-3 py-3 text-base leading-tight text-foreground ${!editable ? 'opacity-50' : ''}`}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.placeholder}
						value={value ?? ''}
						onChangeText={(text) => {
							onChange(text);
							onValueChange?.(text);
						}}
						onBlur={onBlur}
						editable={editable}
						autoCapitalize={autoCapitalize}
						keyboardType={inputType === 'number' ? 'numeric' : 'default'}
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

export default FormFieldInput;

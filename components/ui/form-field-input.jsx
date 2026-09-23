/**
 * Generic single-line text (or numeric keyboard) form control.
 *
 * Used for values such as report `value`, profile name, and label `name`.
 * Not a catalog Labels picker — that is {@link FormFieldLabels}.
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { Controller } from 'react-hook-form';
import { Text as ErrorText, TextInput, View } from 'react-native';

/**
 * Text input bound to a react-hook-form string field.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the string.
 * @param {string} [props.labelText] - Shown on the left. Typed text sits on the right.
 * @param {string} [props.placeholder] - Overrides `labelText` when set.
 * @param {string} [props.inputType] - `'number'` uses a numeric keyboard.
 * @param {boolean} [props.required]
 */
const FormFieldInput = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	inputType = 'default',
	editable = true,
	autoCapitalize,
	onValueChange,
	required = false,
}) => {
	const theme = useTheme();
	const hint = placeholder || labelText;

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
				<View className="mb-4">
					<View
						className={`flex-row items-center justify-between gap-2 py-3 ${!editable ? 'opacity-50' : ''}`}
					>
						<Text className="shrink-0 text-muted-foreground">{hint}</Text>
						<TextInput
							className="min-w-0 flex-1 border-0 bg-transparent text-base leading-tight text-foreground outline-none"
							style={{ textAlign: 'right' }}
							placeholderTextColor={theme.colors.placeholder}
							accessibilityLabel={requiredFieldAccessibilityLabel(labelText || hint, required)}
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
					</View>

					{error && (
						<ErrorText className="mt-1 text-sm text-destructive">{error.message}</ErrorText>
					)}
				</View>
			)}
		/>
	);
};

export default FormFieldInput;

/**
 * Generic multiline text form control (typically report or appointment `remarks`).
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { Controller } from 'react-hook-form';
import { Text as ErrorText, TextInput, View } from 'react-native';

/**
 * Multiline text input bound to a react-hook-form string field.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the string.
 * @param {string} [props.labelText] - Shown on the left. Typed text sits on the right.
 * @param {string} [props.placeholder] - Overrides `labelText` when set.
 * @param {boolean} [props.required]
 */
const FormFieldTextarea = ({
	formControl,
	schemaProperty,
	placeholder,
	labelText,
	inputStyleClass,
	required = false,
}) => {
	const theme = useTheme();
	const hint = placeholder || labelText;

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
				<View className="border-b border-border">
					<View className="min-h-[75px] flex-row items-start justify-between gap-2 py-4">
						<Text className="shrink-0 text-muted-foreground">{hint}</Text>
						<TextInput
							className={
								inputStyleClass ??
								'min-h-[51px] min-w-0 flex-1 border-0 bg-transparent text-base leading-tight text-foreground outline-none'
							}
							style={{ textAlign: 'right' }}
							placeholderTextColor={theme.colors.placeholder}
							accessibilityLabel={requiredFieldAccessibilityLabel(labelText || hint, required)}
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							multiline
							textAlignVertical="top"
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

export default FormFieldTextarea;

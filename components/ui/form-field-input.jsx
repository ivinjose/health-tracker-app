import { useTheme } from '@/components/ThemeProvider';
import { Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

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
}) => {
	const theme = useTheme();

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
								'mb-1 text-sm font-medium text-muted-foreground'
							}
						>
							{labelText}
						</Text>
					)}

					<TextInput
						className={`rounded-[10px] border border-input bg-card px-3 py-3 text-base leading-tight text-foreground ${!editable ? 'opacity-50' : ''}`}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.placeholder}
						value={value}
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

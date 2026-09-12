import { useTheme } from '@/components/ThemeProvider';
import { Controller } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
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
	displayValue,
}) => {
	const theme = useTheme();
	const inputRef = useRef(null);
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		if (displayValue === undefined || focused) return;
		inputRef.current?.setNativeProps({ text: displayValue });
	}, [displayValue, focused]);

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
						ref={inputRef}
						className={`rounded-[10px] border border-input bg-card px-3 py-3 text-base leading-tight text-foreground ${!editable ? 'opacity-50' : ''}`}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.placeholder}
						value={displayValue !== undefined ? displayValue : (value ?? '')}
						onChangeText={(text) => {
							if (displayValue !== undefined && !focused) return;
							onChange(text);
							onValueChange?.(text);
						}}
						onFocus={() => setFocused(true)}
						onBlur={() => {
							setFocused(false);
							onBlur();
						}}
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

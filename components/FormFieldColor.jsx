/**
 * Form control for a catalog label’s `color` field (`#RRGGBB` from the allowlist).
 *
 * Used on create/edit label (More → Labels), not on report forms.
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { LABEL_COLORS } from '@/constants/labels';
import { Controller } from 'react-hook-form';
import { Pressable, Text as ErrorText, View } from 'react-native';

const SWATCH_SIZE = 32;

/**
 * Color swatch row for choosing a label color.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the hex string (`color`).
 * @param {string} [props.labelText] - Shown on the left. Color choices sit on the right.
 * @param {boolean} [props.required]
 */
export default function FormFieldColor({
	formControl,
	schemaProperty,
	labelText = 'Color',
	required = false,
}) {
	const theme = useTheme();

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, value }, fieldState: { error } }) => (
				<View className="border-b border-border">
					<View
						className="flex-row items-center justify-between gap-2 py-4"
						accessibilityLabel={requiredFieldAccessibilityLabel(labelText, required)}
					>
						<Text className="shrink-0 text-muted-foreground">{labelText}</Text>
						<View className="min-w-0 flex-1 flex-row flex-wrap items-center justify-end gap-2">
							{LABEL_COLORS.map((item) => {
								const selected = value === item.color;
								return (
									<Pressable
										key={item.color}
										onPress={() => onChange(item.color)}
										accessibilityRole="button"
										accessibilityLabel={item.name}
										accessibilityState={{ selected }}
										className="items-center justify-center rounded-full"
										style={{
											width: SWATCH_SIZE + 7,
											height: SWATCH_SIZE + 7,
											borderWidth: 2,
											borderColor: selected ? theme.colors.foreground : 'transparent',
										}}
									>
										<View
											className="rounded-full"
											style={{
												width: SWATCH_SIZE,
												height: SWATCH_SIZE,
												backgroundColor: item.color,
											}}
										/>
									</Pressable>
								);
							})}
						</View>
					</View>
					{error ? (
						<ErrorText className="mt-1 text-sm text-destructive">{error.message}</ErrorText>
					) : null}
				</View>
			)}
		/>
	);
}

/**
 * Form control for a catalog label’s `color` field (`#RRGGBB` from the allowlist).
 *
 * Used on create/edit label (More → Labels), not on report forms.
 */
import FormFieldLabel from '@/components/FormFieldLabel';
import { useTheme } from '@/components/ThemeProvider';
import { LABEL_COLORS } from '@/constants/labels';
import { Controller } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

const SWATCH_SIZE = 32;

/**
 * Color swatch row for choosing a label color.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the hex string (`color`).
 * @param {string} [props.labelText]
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
				<View className="mb-4">
					<FormFieldLabel labelText={labelText} required={required} />
					<View className="mt-1 flex-row flex-wrap gap-3">
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
					{error ? (
						<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
					) : null}
				</View>
			)}
		/>
	);
}

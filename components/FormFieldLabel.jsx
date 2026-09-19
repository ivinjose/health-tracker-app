/**
 * Caption row above a form control (“Investigation”, “Value”, “Labels”).
 *
 * This is not the health-record Labels field. For attaching catalog tags to a
 * report, use {@link FormFieldLabels}.
 */
import { Text, View } from 'react-native';

/**
 * Builds the accessibility name for a field caption, appending “required” when needed.
 *
 * @param {string} [labelText]
 * @param {boolean} [required]
 * @returns {string|undefined}
 */
export function requiredFieldAccessibilityLabel(labelText, required) {
	if (!labelText) return undefined;
	return required ? `${labelText}, required` : labelText;
}

/**
 * Renders the visible title for a form field, with an optional required marker.
 *
 * @param {object} props
 * @param {string} [props.labelText] - Caption shown above the control.
 * @param {boolean} [props.required]
 * @param {string} [props.className]
 */
export default function FormFieldLabel({
	labelText,
	required = false,
	className = 'mb-1 text-sm font-medium text-muted-foreground',
}) {
	if (!labelText) return null;

	return (
		<View
			className="flex-row items-baseline"
			accessible
			accessibilityLabel={requiredFieldAccessibilityLabel(labelText, required)}
		>
			<Text className={className}>{labelText}</Text>
			{required ? (
				<View className="ml-1">
					<Text className="text-xs font-semibold text-destructive/80">*</Text>
				</View>
			) : null}
		</View>
	);
}

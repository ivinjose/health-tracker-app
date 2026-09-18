import { Text, View } from 'react-native';

export function requiredFieldAccessibilityLabel(labelText, required) {
	if (!labelText) return undefined;
	return required ? `${labelText}, required` : labelText;
}

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

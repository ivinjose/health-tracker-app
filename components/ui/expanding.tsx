import { View, type StyleProp, type ViewStyle } from 'react-native';

type ExpandingProps = {
	open: boolean;
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
};

function Expanding({ open, children, style }: ExpandingProps) {
	if (!open) return null;

	return <View style={[{ width: '100%' }, style]}>{children}</View>;
}

export { Expanding };

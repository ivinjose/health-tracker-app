import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
	Easing,
	ReduceMotion,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

const DEFAULT_DURATION = 340;
const DEFAULT_EASING = Easing.bezier(0.42, 0, 0.58, 1);

type ExpandingProps = {
	open: boolean;
	children: React.ReactNode;
	duration?: number;
	style?: StyleProp<ViewStyle>;
};

function Expanding({
	open,
	children,
	duration = DEFAULT_DURATION,
	style,
}: ExpandingProps) {
	const measuredHeight = useSharedValue(0);
	const openProgress = useSharedValue(open ? 1 : 0);

	useEffect(() => {
		openProgress.value = open ? 1 : 0;
	}, [open, openProgress]);

	const animatedHeight = useDerivedValue(() =>
		withTiming(measuredHeight.value * openProgress.value, {
			duration,
			easing: DEFAULT_EASING,
			reduceMotion: ReduceMotion.System,
		})
	);

	const animatedStyle = useAnimatedStyle(() => ({
		height: animatedHeight.value,
	}));

	return (
		<View style={[{ overflow: 'hidden', width: '100%' }, style]}>
			<Animated.View
				style={[animatedStyle, { overflow: 'hidden', width: '100%' }]}
				pointerEvents={open ? 'auto' : 'none'}
				accessibilityElementsHidden={!open}
				importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
			>
				<View
					collapsable={false}
					onLayout={(event) => {
						const nextHeight = event.nativeEvent.layout.height;
						if (nextHeight > 0) {
							measuredHeight.value = nextHeight;
						}
					}}
					style={{ position: 'absolute', left: 0, right: 0 }}
				>
					{children}
				</View>
			</Animated.View>
		</View>
	);
}

export { Expanding };

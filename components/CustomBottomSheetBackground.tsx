import React, { useMemo } from 'react';
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
	const theme = useTheme();
	const containerAnimatedStyle = useAnimatedStyle(() => ({
		backgroundColor: theme.colors.background,
	}));
	const containerStyle = useMemo(
		() => [style, containerAnimatedStyle],
		[style, containerAnimatedStyle]
	);
	return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomBackground;

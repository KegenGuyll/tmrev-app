/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
	Canvas,
	Rect,
	Group,
	useFont,
	Text,
	AnimatedProp,
	Color,
} from '@shopify/react-native-skia';
import { Text as PaperText } from 'react-native-paper';
import Animated, { useSharedValue, interpolate, Extrapolate } from 'react-native-reanimated';
// @ts-expect-error
import robotoBold from '../../assets/fonts/roboto/Roboto-Bold.ttf';

const { width } = Dimensions.get('window');

type Data = {
	label: string;
	value: number;
};

type BarChartProps = {
	data: Data[];
	valueLabelColor?: AnimatedProp<Color>;
	barLabelColor?: AnimatedProp<Color>;
	barColor?: AnimatedProp<Color>;
	fontSize?: number;
	canvasHeight?: number;
	chartTitle?: string;
	appendValueLabel?: string;
	displayValue?: boolean;
	barWidth?: number;
};

const BarChart: React.FC<BarChartProps> = ({
	data = [],
	barLabelColor = 'white',
	valueLabelColor = 'white',
	barColor = '#4682b4',
	fontSize = 14,
	canvasHeight = 300,
	chartTitle = '',
	appendValueLabel = '',
	displayValue = true,
	barWidth: bW = 200,
}: BarChartProps) => {
	const translateY = useSharedValue(0);
	const font = useFont(robotoBold, fontSize);

	const barHeight = bW / data.length;
	const maxValue = Math.max(...data.map((item) => item.value));

	return (
		<View style={styles.container}>
			{chartTitle && <PaperText variant="labelLarge">{chartTitle}</PaperText>}
			<Animated.View>
				<Canvas style={{ width: width - 32, height: canvasHeight }}>
					<Group>
						{/* ... (gradient remains the same) */}
						{data.map((item, index) => {
							const barWidth = interpolate(item.value, [0, maxValue], [0, 200], Extrapolate.CLAMP);
							const x = 0;
							const y = index * barHeight;

							return (
								// eslint-disable-next-line react/no-array-index-key
								<Group key={index}>
									<Rect
										x={x}
										y={y + translateY.value}
										width={barWidth}
										height={barHeight - 10}
										color={barColor}
									/>
									{font && ( // <-- Conditional rendering based on font availability
										<Text
											x={5}
											y={y + translateY.value + barHeight / 2}
											text={item.label}
											font={font}
											color={barLabelColor}
										/>
									)}
									{font && displayValue && (
										<Text
											x={barWidth + 10} // End label
											y={y + translateY.value + barHeight / 2}
											text={`${String(item.value).toString()} ${appendValueLabel}`}
											font={font}
											color={valueLabelColor}
										/>
									)}
								</Group>
							);
						})}
					</Group>
				</Canvas>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'center',
		gap: 8,
		paddingLeft: 4,
	},
});

export default BarChart;

/* eslint-disable react/no-array-index-key */
/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import {
	Canvas,
	Path,
	Skia,
	useComputedValue,
	RoundedRect,
	Text,
	useFont,
	Circle,
	Group,
} from '@shopify/react-native-skia';
import { useTheme } from 'react-native-paper';

// @ts-expect-error broken type definitions
import robotoBold from '../../assets/fonts/roboto/Roboto-Bold.ttf';

type Data = {
	label: string;
	value: number;
};

type RadarChartProps = {
	data: Data[];
};

const RadarChart: React.FC<RadarChartProps> = ({ data }: RadarChartProps) => {
	const [width, setWidth] = useState(0);
	const theme = useTheme();
	const height = 400; // Set a fixed height

	const handleLayout = (event: LayoutChangeEvent) => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const { width } = event.nativeEvent.layout;
		setWidth(width);
	};

	const center = width / 2;
	const radius = Math.min(width, height) * 2; // Increase the proportion to make the chart larger
	const angleStep = (2 * Math.PI) / data.length;
	const labelOffset = 40; // Offset for the labels

	const font = useFont(robotoBold, 12); // Adjust the font path and size as needed

	const points = useMemo(() => {
		if (!font) return [];

		return data.map((item, index) => {
			const angle = index * angleStep - Math.PI / 2;
			const x = center + radius * (item.value / 100) * Math.cos(angle);
			const y = height / 2 + radius * (item.value / 100) * Math.sin(angle);

			// Calculate text dimensions
			const textWidth = font.getTextWidth(item.label);
			const textHeight = font.getSize();

			// Adjust label position based on angle
			let labelX = x + labelOffset * Math.cos(angle);
			let labelY = y + labelOffset * Math.sin(angle);

			if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
				labelX -= textWidth / 2;
			} else {
				labelX -= textWidth / 2;
			}

			if (angle > 0) {
				labelY += textHeight / 2;
			} else {
				labelY -= textHeight / 2;
			}

			return { x, y, labelX, labelY, label: item.label };
		});
	}, [data, center, radius, angleStep, height, font]);

	const path = useComputedValue(() => {
		const skPath = Skia.Path.Make();
		if (points.length > 0) {
			skPath.moveTo(points[0].x, points[0].y);
			points.forEach((point, index) => {
				if (index > 0) {
					skPath.lineTo(point.x, point.y);
				}
			});
			skPath.close();
		}
		return skPath;
	}, [points]);

	return (
		<View style={styles.container} onLayout={handleLayout}>
			{width > 0 && (
				<Canvas style={{ width, height }}>
					<RoundedRect
						r={4}
						x={0}
						y={0}
						width={width}
						height={height}
						color={theme.colors.background}
					/>
					{/* Draw concentric circles */}
					<Group opacity={0.09}>
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value, index) => (
							<Circle
								key={index}
								cx={center}
								cy={height / 2}
								r={(radius / 10) * value}
								color={theme.colors.outline}
								style="stroke"
								strokeWidth={1}
							/>
						))}
					</Group>
					{/* Draw radial lines */}
					<Group opacity={0.09}>
						{data.map((_, index) => {
							const angle = index * angleStep - Math.PI / 2;
							const x = center + radius * Math.cos(angle);
							const y = height / 2 + radius * Math.sin(angle);
							return (
								<Path
									key={index}
									path={Skia.Path.Make()
										.moveTo(center, height / 2)
										.lineTo(x, y)}
									color={theme.colors.outline}
									style="stroke"
									strokeWidth={1}
								/>
							);
						})}
					</Group>

					{/* Draw data points and labels */}
					{points.map((point, index) => (
						<React.Fragment key={index}>
							{font && (
								<Text
									x={point.labelX}
									y={point.labelY}
									text={point.label}
									font={font}
									color={theme.colors.onBackground}
								/>
							)}
						</React.Fragment>
					))}
					<Path path={path} color={theme.colors.primary} style="stroke" strokeWidth={2} />
				</Canvas>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
});

export default RadarChart;

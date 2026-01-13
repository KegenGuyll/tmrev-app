import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, useCanvasRef } from '@shopify/react-native-skia';
import { Text } from 'react-native-paper';
import { HeatmapInsight } from '@/api/tmrev-api-v2';

interface HeatmapProps {
	customColor?: string;
	noValueColor?: string;
	heatmapData: HeatmapInsight[];
	chartTitle?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({
	customColor = 'rgba(0, 255, 0, 1)',
	noValueColor = 'rgba(0, 0, 0, 0)',
	chartTitle = 'Heatmap',
	heatmapData,
}) => {
	const canvasRef = useCanvasRef();

	const maxVal = Math.max(...heatmapData.map((item) => item.count));
	const minVal = Math.min(...heatmapData.map((item) => item.count));
	const getColor = (value: number) => {
		if (!value) return noValueColor;

		const ratio = (value - maxVal) / (minVal - maxVal);
		const [r, g, b, a] = customColor.replace('rgba(', '').replace(')', '').split(',').map(Number);
		const adjustedG = Math.floor(g * ratio);
		return `rgba(${r}, ${adjustedG}, ${b}, ${a})`;
	};

	const spacing = 6; // 8px spacing between each data point
	const rectSize = 16; // 16px for both width and height
	const totalWidth = Dimensions.get('window').width * 1; // 95% of the window width
	const numCols = Math.floor(totalWidth / (rectSize + spacing)); // Number of columns that fit in the width
	const canvasWidth = numCols * (rectSize + spacing) - spacing; // Adjust canvas width to fit the columns
	const canvasHeight = Math.ceil(heatmapData.length / numCols) * (rectSize + spacing) - spacing; // Adjust canvas height to fit the rows

	return (
		<View style={styles.container}>
			<Text variant="labelLarge">{chartTitle}</Text>
			<Canvas ref={canvasRef} style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
				{heatmapData.map((value, index) => {
					const colIndex = index % numCols;
					const rowIndex = Math.floor(index / numCols);
					return (
						<RoundedRect
							// eslint-disable-next-line react/no-array-index-key
							key={index}
							x={colIndex * (rectSize + spacing)}
							y={rowIndex * (rectSize + spacing)}
							width={rectSize}
							height={rectSize}
							color={getColor(value.count)}
							r={4}
						/>
					);
				})}
			</Canvas>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		width: '100%',
		textAlign: 'right',
		gap: 8,
		overflow: 'hidden',
	},
	canvas: {},
});

export default Heatmap;

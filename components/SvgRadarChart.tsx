import React, { useMemo } from 'react';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import times from 'lodash.times';
import { Surface } from 'react-native-paper';

export type RadarData = {
	value: number;
	label: string;
};

type Props = {
	radarData: RadarData[];
	size: number;
};

type Point = [number, number];

const svgY = (degrees: number) => degrees + 180;

// create function to convert from degrees to radian
const degToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const calculateEdgePointFn =
	(center: number, radius: number) =>
	(degree: number, scale: number = 1): Point => {
		const degreeInRadians = degToRadians(degree);
		const degreeInRadiansY = degToRadians(svgY(degree));
		return [
			center + Math.cos(degreeInRadians) * radius * scale,
			center + Math.sin(degreeInRadiansY) * radius * scale,
		];
	};

const SvgRadarChart = ({ size, radarData }: Props) => {
	const viewBoxSize = size || 120;
	const viewBoxCenter = viewBoxSize * 0.5;
	const radius = viewBoxSize * 0.4;

	const calculateEdgePoint = useMemo(() => calculateEdgePointFn(viewBoxCenter, radius), [radius]);

	return (
		<Surface
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				height: 300,
				width: '100%',
				borderRadius: 4,
			}}
		>
			<Svg height="100%" width="100%" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
				<Circle
					cx={viewBoxCenter}
					cy={viewBoxCenter}
					r={radius}
					stroke="black"
					strokeOpacity="0.2"
					strokeWidth="0.5"
					fill="#F0F0F0"
				/>

				{times(3).map((i) => (
					<Circle
						key={`circle_outline_${i}`}
						cx={viewBoxCenter}
						cy={viewBoxCenter}
						r={(i + 1) * radius * 0.25}
						stroke="black"
						strokeOpacity="0.2"
						strokeWidth="0.5"
						fill="transparent"
					/>
				))}

				{times(3).map((i) => (
					<Line
						key={`crosshair_${i}`}
						x1={calculateEdgePoint(i * 60)[0]}
						y1={calculateEdgePoint(i * 60)[1]}
						x2={calculateEdgePoint(i * 60 + 180)[0]}
						y2={calculateEdgePoint(i * 60 + 180)[1]}
						stroke="black"
						strokeOpacity="0.2"
						strokeWidth="0.5"
						fill="transparent"
					/>
				))}
				<Polygon
					stroke="#50E2C2"
					strokeWidth={1.2}
					fill="transparent"
					fillOpacity={0.9}
					points={`${radarData.map((r, i) => {
						const edgePoint = calculateEdgePoint(i * 60, r.value / 100);
						return `${edgePoint[0]},${edgePoint[1]}`;
					})}`}
				/>
			</Svg>
		</Surface>
	);
};

export default SvgRadarChart;

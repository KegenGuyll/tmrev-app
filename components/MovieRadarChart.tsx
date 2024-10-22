import { useMemo } from 'react';
import { View } from 'react-native';
import { TmrevReview } from '@/models/tmrev';
import RadarChart from './CustomCharts/RadarChart';

type MovieRadarChartProps = {
	reviews: TmrevReview[];
};

const MovieRadarChart: React.FC<MovieRadarChartProps> = ({ reviews }: MovieRadarChartProps) => {
	const radarData = useMemo(() => {
		if (!reviews) return [];

		const plot: number[] = [];
		const acting: number[] = [];
		const theme: number[] = [];
		const climax: number[] = [];
		const ending: number[] = [];
		const chars: number[] = [];
		const music: number[] = [];
		const cinema: number[] = [];
		const visuals: number[] = [];
		const personalScore: number[] = [];

		reviews.forEach((review) => {
			plot.push(review.advancedScore?.plot);
			acting.push(review.advancedScore?.acting);
			theme.push(review.advancedScore?.theme);
			climax.push(review.advancedScore?.climax);
			ending.push(review.advancedScore?.ending);
			chars.push(review.advancedScore?.characters);
			music.push(review.advancedScore?.music);
			cinema.push(review.advancedScore?.cinematography);
			visuals.push(review.advancedScore?.visuals);
			personalScore.push(review.advancedScore.personalScore);
		});

		return [
			{ label: 'Plot', value: (plot.reduce((a, b) => a + b, 0) / plot.length) * 2 || 0 },
			{ label: 'Acting', value: (acting.reduce((a, b) => a + b, 0) / acting.length) * 2 || 0 },
			{ label: 'Theme', value: (theme.reduce((a, b) => a + b, 0) / theme.length) * 2 || 0 },
			{ label: 'Climax', value: (climax.reduce((a, b) => a + b, 0) / climax.length) * 2 || 0 },
			{ label: 'Ending', value: (ending.reduce((a, b) => a + b, 0) / ending.length) * 2 || 0 },
			{ label: 'Characters', value: (chars.reduce((a, b) => a + b, 0) / chars.length) * 2 || 0 },
			{ label: 'Music', value: (music.reduce((a, b) => a + b, 0) / music.length) * 2 || 0 },
			{ label: 'Cinema', value: (cinema.reduce((a, b) => a + b, 0) / cinema.length) * 2 || 0 },
			{ label: 'Visuals', value: (visuals.reduce((a, b) => a + b, 0) / visuals.length) * 2 || 0 },
			{
				label: 'Personal Score',
				value: (personalScore.reduce((a, b) => a + b, 0) / personalScore.length) * 2 || 0,
			},
		];
	}, [reviews]);

	return (
		<View style={{ flex: 1, height: 400, width: '100%' }}>
			<RadarChart data={radarData} />
		</View>
	);
};

export default MovieRadarChart;

import { View } from 'react-native';
import { useMemo, useState } from 'react';
import { List, Text, Button } from 'react-native-paper';
import TitledSlider from '../TitledSlider';

type Ratings = {
	plot: number;
	theme: number;
	climax: number;
	ending: number;
	acting: number;
	characters: number;
	music: number;
	cinematography: number;
	visuals: number;
	personalScore: number;
};

type RatingSliderListProps = {
	ratings: Ratings;
	setRatings: (key: string, value: number) => void;
	resetRatings: () => void;
	showAverageRating?: boolean;
};

type RatingSlider = {
	title: string;
	value: number;
	onValueChange: (value: number) => void;
};

const RatingSliderList: React.FC<RatingSliderListProps> = ({
	ratings,
	resetRatings,
	setRatings,
}: RatingSliderListProps) => {
	const [expanded, setExpanded] = useState(true);
	const averageRating = useMemo(() => {
		const total = Object.values(ratings).reduce((acc, curr) => acc + curr, 0);
		return total / Object.keys(ratings).length;
	}, [ratings]);

	const ratingSliders: RatingSlider[] = useMemo(
		() => [
			{
				title: 'Plot',
				value: ratings.plot,
				onValueChange: (value: number) => setRatings('plot', value),
			},
			{
				title: 'Theme',
				value: ratings.theme,
				onValueChange: (value: number) => setRatings('theme', value),
			},
			{
				title: 'Climax',
				value: ratings.climax,
				onValueChange: (value: number) => setRatings('climax', value),
			},
			{
				title: 'Ending',
				value: ratings.ending,
				onValueChange: (value: number) => setRatings('ending', value),
			},
			{
				title: 'Acting',
				value: ratings.acting,
				onValueChange: (value: number) => setRatings('acting', value),
			},
			{
				title: 'Characters',
				value: ratings.characters,
				onValueChange: (value: number) => setRatings('characters', value),
			},
			{
				title: 'Music',
				value: ratings.music,
				onValueChange: (value: number) => setRatings('music', value),
			},
			{
				title: 'Cinematography',
				value: ratings.cinematography,
				onValueChange: (value: number) => setRatings('cinematography', value),
			},
			{
				title: 'Visuals',
				value: ratings.visuals,
				onValueChange: (value: number) => setRatings('visuals', value),
			},
			{
				title: 'Personal Score',
				value: ratings.personalScore,
				onValueChange: (value: number) => setRatings('personalScore', value),
			},
		],
		[ratings]
	);

	return (
		<View>
			<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ flexGrow: 1 }} variant="labelLarge">
					Total Score: {averageRating}
				</Text>
				<Button onPress={resetRatings}>Reset</Button>
			</View>
			<List.Accordion
				expanded={expanded}
				onPress={() => setExpanded(!expanded)}
				title="Rating"
				description="Create your review based on 10 different catagories."
			>
				<View style={{ padding: 8 }}>
					{ratingSliders.map((slider) => (
						<TitledSlider key={slider.title} {...slider} />
					))}
				</View>
			</List.Accordion>
		</View>
	);
};

export default RatingSliderList;

export type { Ratings, RatingSlider, RatingSliderListProps };

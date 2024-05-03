import { TouchableHighlight } from 'react-native-gesture-handler';
import { Chip, Surface, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { TmrevReview } from '@/models/tmrev';
import MoviePoster from './MoviePoster';

type MovieReviewCardProps = {
	review: TmrevReview;
};

const MovieReviewCard: React.FC<MovieReviewCardProps> = ({ review }: MovieReviewCardProps) => {
	return (
		<TouchableHighlight>
			<Surface style={styles.container}>
				<View
					style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}
				>
					<Text style={{ flexGrow: 1 }} variant="titleMedium">
						{review.title}
					</Text>
					<View style={{ display: 'flex', flexDirection: 'row' }}>
						<Chip icon="star">{review.averagedAdvancedScore}</Chip>
					</View>
				</View>

				<View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
					<MoviePoster
						height={100}
						width={200}
						movieId={review.tmdbID}
						moviePoster={review.moviePoster}
						clickable={false}
						location="movies"
					/>
					<Text style={{ flex: 1, flexWrap: 'wrap' }}>{review.notes}</Text>
				</View>
			</Surface>
		</TouchableHighlight>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 8,
		borderRadius: 4,
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},
	list: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});

export default MovieReviewCard;

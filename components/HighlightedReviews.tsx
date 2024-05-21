import { View, StyleSheet } from 'react-native';
import { Chip, Text, TouchableRipple } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { useGetUserHighlightedReviewsQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import MoviePoster from './MoviePoster';
import { TmrevReview } from '@/models/tmrev';

type HighlightedReviewsProps = {
	userId?: string;
	from: FromLocation;
};

type HighlightedReviewItemProps = {
	movie: TmrevReview;
	from: FromLocation;
};

const HighlightedReviewItem: React.FC<HighlightedReviewItemProps> = ({
	movie,
	from,
}: HighlightedReviewItemProps) => {
	return (
		<TouchableRipple style={{ position: 'relative' }}>
			<>
				<Chip style={{ position: 'absolute', bottom: 4, right: 8, zIndex: 1 }} icon="star">
					{movie.averagedAdvancedScore}
				</Chip>
				<MoviePoster
					movieId={movie.tmdbID}
					moviePoster={movie.movieDetails.poster_path}
					location={from}
				/>
			</>
		</TouchableRipple>
	);
};

const HighlightedReviews: React.FC<HighlightedReviewsProps> = ({
	userId,
	from,
}: HighlightedReviewsProps) => {
	if (!userId) return null;

	const { data } = useGetUserHighlightedReviewsQuery(userId, { skip: !userId });

	if (!data) return null;

	return (
		<View>
			<View>
				<Text style={{ padding: 8 }} variant="labelMedium">
					Highest Rated Movies ({data.body.highest.length})
				</Text>
				<FlatGrid
					itemDimension={100}
					style={styles.list}
					data={data.body.highest}
					spacing={8}
					renderItem={({ item }) => <HighlightedReviewItem movie={item} from={from} />}
					keyExtractor={(item) => item._id}
				/>
			</View>
			<View>
				<Text style={{ padding: 8 }} variant="labelMedium">
					Lowest Rated Movies ({data.body.lowest.length})
				</Text>
				<FlatGrid
					itemDimension={100}
					style={styles.list}
					data={data.body.lowest}
					spacing={8}
					renderItem={({ item }) => <HighlightedReviewItem movie={item} from={from} />}
					keyExtractor={(item) => item._id}
				/>
			</View>
		</View>
	);
};

export default HighlightedReviews;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});

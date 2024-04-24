import { Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import MovieHorizontalGrid, { MovieHorizontalGridData } from '@/components/MovieHorizontalGrid';
import { useGetJustReviewedQuery } from '@/redux/api/tmrev';
import { PosterPath } from '@/models';

type JustReviewedMoviesProps = {
	posterSelectionLocation: PosterPath;
};

const JustReviewedMovies: React.FC<JustReviewedMoviesProps> = ({
	posterSelectionLocation,
}: JustReviewedMoviesProps) => {
	const [formattedData, setFormattedData] = useState<MovieHorizontalGridData[]>([]);
	const { data, isLoading } = useGetJustReviewedQuery();

	useEffect(() => {
		if (data) {
			const newlyFormattedData: MovieHorizontalGridData[] = data.body.movies.map((movie) => ({
				movieId: movie.tmdbID,
				moviePoster: movie.moviePoster,
				uniqueId: movie._id,
			}));
			setFormattedData(newlyFormattedData);
		}
	}, [data]);

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<View>
			<Text>Just Reviewed</Text>
			<MovieHorizontalGrid data={formattedData} posterSelectionLocation={posterSelectionLocation} />
		</View>
	);
};

export default JustReviewedMovies;

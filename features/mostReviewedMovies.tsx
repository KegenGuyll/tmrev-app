import { Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import MovieHorizontalGrid, { MovieHorizontalGridData } from '@/components/MovieHorizontalGrid';
import { PosterPath } from '@/models';
import { useReviewControllerFindMostReviewed } from '@/api/tmrev-api-v2';

type MostReviewedMoviesProps = {
	posterSelectionLocation: PosterPath;
};

const MostReviewedMovies: React.FC<MostReviewedMoviesProps> = ({
	posterSelectionLocation,
}: MostReviewedMoviesProps) => {
	const [formattedData, setFormattedData] = useState<MovieHorizontalGridData[]>([]);
	const { data, isLoading } = useReviewControllerFindMostReviewed();

	useEffect(() => {
		if (data) {
			const newlyFormattedData: MovieHorizontalGridData[] = data.map((movie) => ({
				movieId: movie.tmdbID,
				moviePoster: movie.movieDetails.poster_path,
				uniqueId: Math.random().toString(36).substring(7),
			}));
			setFormattedData(newlyFormattedData);
		}
	}, [data]);

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<View>
			<Text>Most Reviewed</Text>
			<MovieHorizontalGrid data={formattedData} posterSelectionLocation={posterSelectionLocation} />
		</View>
	);
};

export default MostReviewedMovies;

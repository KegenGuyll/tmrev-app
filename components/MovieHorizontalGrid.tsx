import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import MoviePoster from './MoviePoster';
import { FromLocation } from '@/models';

type MovieHorizontalGridData = {
	uniqueId: string;
	movieId: number;
	moviePoster?: string;
};

type MovieHorizontalGridProps = {
	data: MovieHorizontalGridData[];
	posterSelectionLocation: FromLocation;
	posterHeight?: number;
	isLoading?: boolean;
};

const MovieHorizontalGrid: React.FC<MovieHorizontalGridProps> = ({
	data,
	posterSelectionLocation,
	posterHeight,
	isLoading,
}: MovieHorizontalGridProps) => {
	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<FlatList
			horizontal
			contentContainerStyle={{
				gap: 8,
			}}
			renderItem={({ item }) => (
				<MoviePoster
					movieId={item.movieId}
					moviePoster={item.moviePoster}
					location={posterSelectionLocation}
					height={posterHeight}
				/>
			)}
			keyExtractor={(item) => item.uniqueId}
			data={data}
		/>
	);
};

export type { MovieHorizontalGridData, MovieHorizontalGridProps };

export default MovieHorizontalGrid;

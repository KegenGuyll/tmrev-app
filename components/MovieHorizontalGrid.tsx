import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import MoviePoster from './MoviePoster';
import { FromLocation } from '@/models';

type MovieHorizontalGridData = {
	uniqueId: string;
	movieId: number;
	moviePoster?: string;
	overlayComponent?: React.ReactNode;
};

type MovieHorizontalGridProps = {
	data: MovieHorizontalGridData[];
	posterSelectionLocation: FromLocation;
	posterHeight?: number;
	isLoading?: boolean;
	selectedMovieId?: number;
};

const MovieHorizontalGrid: React.FC<MovieHorizontalGridProps> = ({
	data,
	posterSelectionLocation,
	posterHeight,
	isLoading,
	selectedMovieId,
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
					isSelected={selectedMovieId === item.movieId}
					movieId={item.movieId}
					moviePoster={item.moviePoster}
					location={posterSelectionLocation}
					height={posterHeight}
					overlayComponent={item.overlayComponent}
				/>
			)}
			keyExtractor={(item) => item.uniqueId}
			data={data}
		/>
	);
};

export type { MovieHorizontalGridData, MovieHorizontalGridProps };

export default MovieHorizontalGrid;

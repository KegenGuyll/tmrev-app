import { FlatList, View } from 'react-native';
import MoviePoster from './MoviePoster';
import { PosterPath } from '@/models';

type MovieHorizontalGridData = {
	uniqueId: string;
	movieId: number;
	moviePoster: string;
};

type MovieHorizontalGridProps = {
	data: MovieHorizontalGridData[];
	posterSelectionLocation: PosterPath;
};

const MovieHorizontalGrid: React.FC<MovieHorizontalGridProps> = ({
	data,
	posterSelectionLocation,
}: MovieHorizontalGridProps) => {
	return (
		<FlatList
			horizontal
			renderItem={({ item }) => (
				<View
					style={{
						marginRight: 8,
						borderRadius: 4,
						gap: 8,
					}}
				>
					<MoviePoster
						movieId={item.movieId}
						moviePoster={item.moviePoster}
						location={posterSelectionLocation}
					/>
				</View>
			)}
			keyExtractor={(item) => item.uniqueId}
			data={data}
		/>
	);
};

export type { MovieHorizontalGridData, MovieHorizontalGridProps };

export default MovieHorizontalGrid;

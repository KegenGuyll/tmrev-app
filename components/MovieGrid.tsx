import React from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { Text, StyleSheet } from 'react-native';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import MoviePoster from '@/components/MoviePoster';

type MovieGridProps = {
	movies: MovieGeneral[];
	isLoading: boolean;
	onEndReached: () => void;
	onEndReachedThreshold: number;
	posterPath: 'movies' | 'search';
};

const MovieGrid: React.FC<MovieGridProps> = ({
	movies,
	isLoading,
	onEndReached,
	onEndReachedThreshold,
	posterPath,
}: MovieGridProps) => {
	return (
		<>
			{isLoading && <Text>Loading...</Text>}
			{movies && (
				<FlatGrid
					itemDimension={100}
					style={styles.list}
					data={movies}
					spacing={8}
					renderItem={({ item }) => (
						<MoviePoster movieId={item.id} moviePoster={item.poster_path} location={posterPath} />
					)}
					keyExtractor={(item) => item.id.toString()}
					onEndReached={onEndReached}
					onEndReachedThreshold={onEndReachedThreshold}
				/>
			)}
		</>
	);
};

export default MovieGrid;

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
